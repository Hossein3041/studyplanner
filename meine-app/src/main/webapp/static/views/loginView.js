// src/main/webapp/static/views/loginView.js
import { loginUser, fetchSession } from "../api.js";

function removeLoginSuccessMessage() {
  const old = document.getElementById("login-success-message");
  if (old && old.parentElement) {
    old.parentElement.removeChild(old);
  }
}

export function initLoginView() {
  const form = document.getElementById("login-form");

  if (!form) {
    console.warn("LoginView: #login-form nicht gefunden");
    return;
  }

  removeLoginSuccessMessage();

  // --- WICHTIG: Login-View in Grundzustand versetzen ---
  form.style.display = "block";          // Formular sichtbar

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const emailError = document.getElementById("login-email-error");
  const passwordError = document.getElementById("login-password-error");
  const passwordToggle = document.getElementById("login-password-toggle");

  // Eingabefelder zurücksetzen
  if (emailInput) {
    emailInput.value = "";
    emailInput.classList.remove("has-value");
  }
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.classList.remove("has-value");
    passwordInput.type = "password"; // falls vorher sichtbar
  }

  // Fehler zurücksetzen
  if (emailError) {
    emailError.textContent = "";
    emailError.classList.remove("show");
  }
  if (passwordError) {
    passwordError.textContent = "";
    passwordError.classList.remove("show");
  }

  const emailGroup = emailInput?.closest(".form-group");
  const passwordGroup = passwordInput?.closest(".form-group");
  emailGroup?.classList.remove("error");
  passwordGroup?.classList.remove("error");

  if (!emailInput || !passwordInput) {
    console.warn("LoginView: Eingabefelder nicht gefunden");
    return;
  }

  let isSubmitting = false;

  // ---------------------------------------------------
  // Floating Labels
  // ---------------------------------------------------
  [emailInput, passwordInput].forEach((input) => {
    const updateHasValue = () => {
      input.classList.toggle("has-value", input.value.trim() !== "");
    };
    input.addEventListener("input", updateHasValue);
    updateHasValue();
  });

  // ---------------------------------------------------
  // Passwort-Auge
  // ---------------------------------------------------
  if (passwordToggle) {
    const eye = passwordToggle.querySelector(".eye-icon");

    passwordToggle.onclick = () => {
      const showing = passwordInput.type === "text";
      passwordInput.type = showing ? "password" : "text";
      eye?.classList.toggle("show-password", !showing);
    };
  }

  // ---------------------------------------------------
  // Hilfsfunktionen Fehler
  // ---------------------------------------------------
  function showFieldError(input, errorElement, message) {
    const group = input.closest(".form-group");
    group?.classList.add("error");

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }
  }

  function clearFieldError(input, errorElement) {
    const group = input.closest(".form-group");
    group?.classList.remove("error");

    if (errorElement) {
      errorElement.classList.remove("show");
      errorElement.textContent = "";
    }
  }

  // ---------------------------------------------------
  // Submit-Handler – EIN Handler pro Init
  // ---------------------------------------------------
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    clearFieldError(emailInput, emailError);
    clearFieldError(passwordInput, passwordError);

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let hasError = false;

    if (!email) {
      showFieldError(emailInput, emailError, "Bitte E-Mail eingeben.");
      hasError = true;
    }
    if (!password) {
      showFieldError(passwordInput, passwordError, "Bitte Passwort eingeben.");
      hasError = true;
    }

    if (hasError) return;

    isSubmitting = true;
    const submitBtn = form.querySelector(".login-btn");
    submitBtn?.classList.add("loading");

    try {
      // 1) Login durchführen
      await loginUser(email, password);

      // 2) Session abrufen
      const session = await fetchSession();

      // 3) Erfolgsmeldung anzeigen
      form.style.display = "none";

      removeLoginSuccessMessage();

      const loginCard = form.closest(".login-card");
      if (loginCard) {
        const msg = document.createElement("div");
        msg.id = "login-success-message";
        msg.className = "success-message show";
        msg.innerHTML = `
            <div class="success-icon">✓</div>
            <h3>Willkommen zurück!</h3>
            <p>Du wirst zum Dashboard weitergeleitet...</>
        `;
        loginCard.appendChild(msg);
      }

      // 4) Weiterleiten
      setTimeout(() => {
        if (window.navigateTo) {
          if (session?.role === "ADMIN") {
            window.navigateTo("admin");
          } else {
            window.navigateTo("dashboard");
          }
        }
      }, 1200);
    } catch (err) {
      console.error("Login-Fehler:", err);
      showFieldError(
        passwordInput,
        passwordError,
        err?.message || "Login fehlgeschlagen."
      );
    } finally {
      isSubmitting = false;
      submitBtn?.classList.remove("loading");
    }
  };
}
