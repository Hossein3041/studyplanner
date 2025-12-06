// src/main/webapp/static/views/tasksView.js
import { createTask } from "../api.js";
import { renderTaskList } from "../components/TaskList.js";
import { fillModuleSelect } from "../components/ModuleList.js";

/**
 * Aufgaben-View:
 * - Modul-Select füllen
 * - Aufgaben anlegen
 * - Aufgabenliste anzeigen
 */
export function initTasksView() {
  const form = document.getElementById("task-form");
  if (!form) {
    console.warn("TasksView: #task-form nicht gefunden.");
    return;
  }

  const titleInput = document.getElementById("task-title");
  const moduleSelect = document.getElementById("task-module");
  const deadlineInput = document.getElementById("task-deadline");
  const prioritySelect = document.getElementById("task-priority");

  let errorBox = document.getElementById("tasks-error");
  if (!errorBox) {
    errorBox = document.createElement("p");
    errorBox.id = "tasks-error";
    errorBox.style.color = "darkred";
    errorBox.style.marginTop = "0.5rem";
    form.appendChild(errorBox);
  }

  // Modul-Auswahl laden
  fillModuleSelect("task-module");
  // Aufgabenliste laden
  renderTaskList();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const title = titleInput.value.trim();
    const moduleId = moduleSelect.value;
    const deadline = deadlineInput.value || null;
    const priority = prioritySelect.value || "MEDIUM";

    if (!title) {
      errorBox.textContent = "Bitte einen Aufgabentitel angeben.";
      return;
    }

    if (!moduleId) {
      errorBox.textContent = "Bitte ein Modul auswählen.";
      return;
    }

    const taskData = {
      title,
      moduleId: Number(moduleId),
      deadline,
      priority,
    };

    try {
      await createTask(taskData);
      titleInput.value = "";
      deadlineInput.value = "";
      prioritySelect.value = "MEDIUM";
      await renderTaskList();
    } catch (err) {
      console.error("Fehler beim Anlegen einer Aufgabe:", err);
      errorBox.textContent =
        err.message || "Fehler beim Anlegen der Aufgabe.";
    }
  });
}
