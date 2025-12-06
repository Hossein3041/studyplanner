// src/main/webapp/static/views/sessionsView.js
import { createSession } from "../api.js";
import { renderSessionList } from "../components/SessionList.js";
import { fillModuleSelect } from "../components/ModuleList.js";

/**
 * Lernsessions-View:
 * - Modul-Select füllen
 * - Session anlegen
 * - Liste anzeigen
 */
export function initSessionsView() {
  const form = document.getElementById("session-form");
  if (!form) {
    console.warn("SessionsView: #session-form nicht gefunden.");
    return;
  }

  const moduleSelect = document.getElementById("session-module");
  const dateInput = document.getElementById("session-date");
  const durationInput = document.getElementById("session-duration");
  const noteInput = document.getElementById("session-note");

  let errorBox = document.getElementById("sessions-error");
  if (!errorBox) {
    errorBox = document.createElement("p");
    errorBox.id = "sessions-error";
    errorBox.style.color = "darkred";
    errorBox.style.marginTop = "0.5rem";
    form.appendChild(errorBox);
  }

  fillModuleSelect("session-module");
  renderSessionList();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const moduleId = moduleSelect.value;
    const date = dateInput.value;
    const duration = durationInput.value;
    const note = noteInput.value.trim() || null;

    if (!moduleId) {
      errorBox.textContent = "Bitte ein Modul auswählen.";
      return;
    }
    if (!date) {
      errorBox.textContent = "Bitte ein Datum angeben.";
      return;
    }
    if (!duration || Number(duration) <= 0) {
      errorBox.textContent = "Bitte eine gültige Dauer in Minuten angeben.";
      return;
    }

    const sessionData = {
      moduleId: Number(moduleId),
      date,
      durationMinutes: Number(duration),
      note,
    };

    try {
      await createSession(sessionData);
      dateInput.value = "";
      durationInput.value = "";
      noteInput.value = "";
      await renderSessionList();
    } catch (err) {
      console.error("Fehler beim Speichern einer Lernsessions:", err);
      errorBox.textContent =
        err.message || "Fehler beim Speichern der Lernsessions.";
    }
  });
}
