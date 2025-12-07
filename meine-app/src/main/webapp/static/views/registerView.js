// src/main/webapp/static/views/registerView.js
import { registerUser } from "../api.js";

export function initRegisterView() {
  const form = document.getElementById("register-form");
  if (!form) {
    console.warn("RegisterView: #register-form nicht gefunden.");
    return;
  }

  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const passwordConfirmInput = document.getElementById("reg-password-confirm");

  const emailError = document.getElementById("reg-email-error");
  const passwordError = document.getElementById("reg-password-error");
  const passwordConfirmError = document.getElementById("reg-password-confirm-error");

  const passwordToggle = document.getElementById("reg-password-toggle");
  const passwordConfirmToggle = document.getElementById("reg-password-confirm-toggle");

  const successMessage = document.getElementById("register-success-message");

  if (!emailInput || !passwordInput || !passwordConfirmInput) {
    console.warn("RegisterView: Eingabefelder fehlen!");
    return;
  }

  let isSubmitting = false;

  /* ---------------------------------------------------
     FLOATING LABELS (E-Mail, Passwort, Passwort best.)
  --------------------------------------------------- */
  [emailInput, passwordInput, passwordConfirmInput].forEach((input) => {
    const updateHasValue = () => {
      input.classList.toggle("has-value", input.value.trim() !== "");
    };
    input.addEventListener("input", updateHasValue);
    updateHasValue();
  });

  /* ---------------------------------------------------
     PASSWORT-AUGEN (beide Felder)
  --------------------------------------------------- */
  setupPasswordToggle(passwordInput, passwordToggle);
  setupPasswordToggle(passwordConfirmInput, passwordConfirmToggle);

  /* ---------------------------------------------------
     FEHLERHILFSFUNKTIONEN
  --------------------------------------------------- */
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

  /* ---------------------------------------------------
     SUBMIT HANDLING
  --------------------------------------------------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    clearFieldError(emailInput, emailError);
    clearFieldError(passwordInput, passwordError);
    clearFieldError(passwordConfirmInput, passwordConfirmError);

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    let hasError = false;

    // Validierung
    if (!email) {
      showFieldError(emailInput, emailError, "Bitte E-Mail angeben.");
      hasError = true;
    }
    if (!password) {
      showFieldError(passwordInput, passwordError, "Bitte Passwort angeben.");
      hasError = true;
    }
    if (!passwordConfirm) {
      showFieldError(passwordConfirmInput, passwordConfirmError, "Bitte Passwort bestätigen.");
      hasError = true;
    }
    if (password && passwordConfirm && password !== passwordConfirm) {
      showFieldError(passwordConfirmInput, passwordConfirmError, "Passwörter stimmen nicht überein.");
      hasError = true;
    }

    if (hasError) return;

    isSubmitting = true;
    const submitBtn = form.querySelector(".login-btn");
    submitBtn?.classList.add("loading");

    try {
      await registerUser(email, password);

      // Form ausblenden → Erfolg anzeigen
      if (successMessage) {
        form.style.display = "none";
        successMessage.classList.add("show");
      }

      // Nach kurzer Zeit auf Login wechseln
      setTimeout(() => {
        if (window.navigateTo) window.navigateTo("login");
      }, 1200);

    } catch (err) {
      console.error("Fehler bei der Registrierung:", err);
      showFieldError(emailInput, emailError, err?.message || "Fehler bei der Registrierung.");
    } finally {
      isSubmitting = false;
      submitBtn?.classList.remove("loading");
    }
  });
}

/* ---------------------------------------------------
   Passwort-Auge-Helfer
--------------------------------------------------- */
function setupPasswordToggle(input, toggleBtn) {
  if (!input || !toggleBtn) return;

  const icon = toggleBtn.querySelector(".eye-icon");

  toggleBtn.addEventListener("click", () => {
    const isText = input.type === "text";
    input.type = isText ? "password" : "text";

    if (icon) {
      icon.classList.toggle("show-password", !isText);
    }
  });
}
