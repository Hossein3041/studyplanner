// src/main/webapp/static/views/modulesView.js
import { createModule } from "../api.js";
import { renderModuleList } from "../components/ModuleList.js";

/**
 * Module-View:
 * - Formular zum Anlegen von Modulen
 * - Liste der Module anzeigen
 */
export function initModulesView() {
  const form = document.getElementById("module-form");
  if (!form) {
    console.warn("ModulesView: #module-form nicht gefunden.");
    return;
  }

  const nameInput = document.getElementById("module-name");
  const semesterInput = document.getElementById("module-semester");

  let errorBox = document.getElementById("modules-error");
  if (!errorBox) {
    errorBox = document.createElement("p");
    errorBox.id = "modules-error";
    errorBox.style.color = "darkred";
    errorBox.style.marginTop = "0.5rem";
    form.appendChild(errorBox);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const name = nameInput.value.trim();
    const semester = semesterInput.value.trim();

    if (!name) {
      errorBox.textContent = "Bitte einen Modulnamen angeben.";
      return;
    }

    const moduleData = {
      name,
      semester: semester || null,
    };

    try {
      await createModule(moduleData);
      nameInput.value = "";
      semesterInput.value = "";
      await renderModuleList();
    } catch (err) {
      console.error("Fehler beim Erstellen eines Moduls:", err);
      errorBox.textContent = err.message || "Fehler beim Anlegen des Moduls.";
    }
  });

  // Erste Liste laden
  renderModuleList();
}
