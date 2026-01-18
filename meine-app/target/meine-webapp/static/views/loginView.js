// src/main/webapp/static/views/loginView.js
import { loginUser, fetchSession, requestPasswordReset, resetPassword } from "../api.js";

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
  const rememberCheckbox = document.getElementById("login-remember");

  const forgotLink = document.querySelector(".forgot-password");
  const forgotPanel = document.getElementById("forgot-password-panel");
  const forgotEmailInput = document.getElementById("forgot-email");
  const forgotEmailError = document.getElementById("forgot-email-error");
  const forgotSubmitBtn = document.getElementById("forgot-submit-btn");
  const forgotInfoText = document.getElementById("forgot-info-text");

  let resetToken = null;

  if (forgotPanel && forgotLink) {
    forgotPanel.hidden = true;

    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      forgotPanel.hidden = !forgotPanel.hidden;
      forgotEmailError.textContent = "";
      forgotEmailInput.value =  "";
    });
  }

  if (forgotSubmitBtn) {
    forgotSubmitBtn.addEventListener("click", async() => {
      const email = forgotEmailInput.value.trim();
      forgotEmailError.textContext = "";

      if (!email) {
        forgotEmailError.textContent = "Bitte E-Mail eingeben.";
        return;
      }

      try {
        const result = await requestPasswordReset(email);
        resetToken = result.token;
        console.log("Password-Reset-Token:", resetToken);
        showNewPasswordForm();
      } catch (err) {
        forgotEmailError.textContent = "Fehler. Bitte später erneut versuchen.";
        console.error(err);
      }
    })
  }

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

  // ---------------------------------------------
  // UI für neues Passwort dynamisch einfügen
  // ---------------------------------------------
  function showNewPasswordForm() {
      forgotPanel.innerHTML = `
         <p>Bitte neues Passwort eingeben:</p>

          <div class="form-group">
              <div class="input-wrapper">
                 <input type="password" id="new-password" autocomplete="new-password" />
                 <label for="new-password">Neues Passwort</label>
             </div>
             <span class="error-message" id="new-password-error"></span>
         </div> 

          <button type="button" class="login-btn" id="new-password-submit">
             Passwort setzen
         </button>  

          <p class="info-text" id="reset-info-text"></p>
     `;

      const newPasswordInput = document.getElementById("new-password");
      const newPasswordError = document.getElementById("new-password-error");
      const submitNewPwBtn = document.getElementById("new-password-submit");
      const infoText = document.getElementById("reset-info-text");

      submitNewPwBtn.addEventListener("click", async () => {
          const pw = newPasswordInput.value.trim();
          newPasswordError.textContent = "";

          if (!pw) {
              newPasswordError.textContent = "Bitte Passwort eingeben.";
              return;
          }

          try {
              await resetPassword(resetToken, pw);

              infoText.textContent = "Passwort erfolgreich gesetzt! Weiterleitung...";
              infoText.style.color = "green";

              setTimeout(() => {
                  window.navigateTo("login");
              }, 1200);

          } catch (err) {
              newPasswordError.textContent = "Fehler beim Setzen des Passworts.";
              console.error(err);
          }
      });
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
    const rememberMe = rememberCheckbox?.checked ?? false;

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
      await loginUser(email, password, rememberMe);

      // 2) Session abrufen
      const session = await fetchSession();

      // 3) Erfolgsmeldung anzeigen
      form.style.display = "none";

      removeLoginSuccessMessage();

      // 3) Formular + kompletter Card-Inhalt ausblenden bzw. leeren
      const loginCard = form.closest(".login-card");

      if (loginCard) {
        loginCard.innerHTML = ""; // ALLES entfernen
      }

      // 4) Erfolgsmeldung hinzufügen
      const successDiv = document.createElement("div");
      successDiv.id = "login-success-message";
      successDiv.className = "success-message show";
      successDiv.innerHTML = `
        <div class="success-icon">✓</div>
        <h3 style="margin:12px 0 4px; font-weight:600;">Login erfolgreich</h3>
        <p style="opacity:.8;">Weiterleitung läuft…</p>
      `;

      if (loginCard) {
        loginCard.appendChild(successDiv);
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
