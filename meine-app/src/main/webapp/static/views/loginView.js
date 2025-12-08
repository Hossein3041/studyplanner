// src/main/webapp/static/views/loginView.js
import { loginUser, fetchSession } from "../api.js";

export function initLoginView() {
  const form = document.getElementById("login-form");
  if (!form) {
    console.warn("LoginView: #login-form nicht gefunden");
    return;
  }

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const emailError = document.getElementById("login-email-error");
  const passwordError = document.getElementById("login-password-error");
  const passwordToggle = document.getElementById("login-password-toggle");
  const successMessage = document.getElementById("login-success-message");

  if (!emailInput || !passwordInput) {
    console.warn("LoginView: Eingabefelder nicht gefunden");
    return;
  }

  let isSubmitting = false;

  // ---------------------------------------------------
  // 1) Floating Label: hat das Feld Inhalt?
  // ---------------------------------------------------
  [emailInput, passwordInput].forEach((input) => {
    const updateHasValue = () => {
      if (input.value.trim() !== "") {
        input.classList.add("has-value");
      } else {
        input.classList.remove("has-value");
      }
    };
    input.addEventListener("input", updateHasValue);
    updateHasValue();
  });

  // ---------------------------------------------------
  // 2) Passwort ein-/ausblenden
  // ---------------------------------------------------
  if (passwordToggle) {
    const eye = passwordToggle.querySelector(".eye-icon");

    passwordToggle.addEventListener("click", () => {
      const showing = passwordInput.type === "text";
      passwordInput.type = showing ? "password" : "text";

      if (eye) {
        eye.classList.toggle("show-password", !showing);
      }
    });
  }

  // ---------------------------------------------------
  // Fehler anzeigen / löschen
  // ---------------------------------------------------
  function showFieldError(input, errorElement, message) {
    const group = input.closest(".form-group");
    if (group) group.classList.add("error");

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }
  }

  function clearFieldError(input, errorElement) {
    const group = input.closest(".form-group");
    if (group) group.classList.remove("error");

    if (errorElement) {
      errorElement.classList.remove("show");
      errorElement.textContent = "";
    }
  }

  // ---------------------------------------------------
  // 3) Submit – Login durchführen
  // ---------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Fehler zurücksetzen
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
      showFieldError(
        passwordInput,
        passwordError,
        "Bitte Passwort eingeben."
      );
      hasError = true;
    }

    if (hasError) return;

    isSubmitting = true;
    const submitBtn = form.querySelector(".login-btn");
    submitBtn?.classList.add("loading");

    try {
      // 1) Login durchführen
      await loginUser(email, password);

      // 2) Session laden (inkl. role)
      const session = await fetchSession();

      // 3) Erfolg anzeigen
      if (successMessage) {
        form.style.display = "none";
        successMessage.classList.add("show");
      }

      // 4) Weiterleiten
      setTimeout(() => {
        if (window.navigateTo) {
          if (session && session.role === "ADMIN") {
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
  });
}
