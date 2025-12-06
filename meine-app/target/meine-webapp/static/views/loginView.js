// src/main/webapp/static/views/loginView.js
import { loginUser, fetchSession } from "../api.js";

/**
 * Login-View:
 * - Formular submitten
 * - AJAX-Login
 * - danach Session abfragen
 *   - wenn ADMIN => admin-View
 *   - sonst => dashboard
 */
export function initLoginView() {
  const form = document.getElementById("login-form");
  if (!form) {
    console.warn("LoginView: #login-form nicht gefunden.");
    return;
  }

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  let errorBox = document.getElementById("login-error");
  if (!errorBox) {
    errorBox = document.createElement("p");
    errorBox.id = "login-error";
    errorBox.style.color = "darkred";
    errorBox.style.marginTop = "0.5rem";
    form.appendChild(errorBox);
  }

  let isSubmitting = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    errorBox.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorBox.textContent = "Bitte E-Mail und Passwort eingeben.";
      return;
    }

    isSubmitting = true;

    try {
      await loginUser(email, password); // Backend setzt Session/Cookie

      const session = await fetchSession();

      if (session && session.loggedIn) {
        if (session.role === "ADMIN") {
          window.navigateTo("admin");
        } else {
          window.navigateTo("dashboard");
        }
      } else {
        errorBox.textContent = "Login fehlgeschlagen. Bitte Daten prüfen.";
      }
    } catch (err) {
      console.error("Fehler beim Login:", err);
      errorBox.textContent = err.message || "Fehler beim Login.";
    } finally {
      isSubmitting = false;
    }
  });
}
