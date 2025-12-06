// src/main/webapp/static/views/registerView.js
import { registerUser } from "../api.js";

/**
 * Registrierung:
 * - Passwort / Bestätigung prüfen
 * - AJAX-Registrierung
 * - danach auf Login-View navigieren
 */
export function initRegisterView() {
  const form = document.getElementById("register-form");
  if (!form) {
    console.warn("RegisterView: #register-form nicht gefunden.");
    return;
  }

  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const passwordConfirmInput = document.getElementById("reg-password-confirm");

  let errorBox = document.getElementById("register-error");
  if (!errorBox) {
    errorBox = document.createElement("p");
    errorBox.id = "register-error";
    errorBox.style.color = "darkred";
    errorBox.style.marginTop = "0.5rem";
    form.appendChild(errorBox);
  }

  let infoBox = document.getElementById("register-info");
  if (!infoBox) {
    infoBox = document.createElement("p");
    infoBox.id = "register-info";
    infoBox.style.color = "green";
    infoBox.style.marginTop = "0.5rem";
    form.appendChild(infoBox);
  }

  let isSubmitting = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    errorBox.textContent = "";
    infoBox.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    if (!email || !password || !passwordConfirm) {
      errorBox.textContent = "Bitte alle Felder ausfüllen.";
      return;
    }

    if (password !== passwordConfirm) {
      errorBox.textContent = "Passwörter stimmen nicht überein.";
      return;
    }

    isSubmitting = true;

    try {
      await registerUser(email, password);
      infoBox.textContent = "Registrierung erfolgreich. Du kannst dich jetzt anmelden.";
      // Nach kurzer Zeit auf Login-Seite gehen
      setTimeout(() => {
        if (window.navigateTo) {
          window.navigateTo("login");
        }
      }, 800);
    } catch (err) {
      console.error("Fehler bei der Registrierung:", err);
      errorBox.textContent = err.message || "Fehler bei der Registrierung.";
    } finally {
      isSubmitting = false;
    }
  });
}
