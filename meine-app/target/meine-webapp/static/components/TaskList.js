import { fetchTasks } from "../api.js";

export async function renderTaskList() {
    const container = document.getElementById("task-list");
    if (!container) {
        console.warn("TaskList: Element #task-list nicht gefunden.");
        return;
    }

    container.textContent = "Lade Aufgaben...";

    try {
        const tasks = (await fetchTasks()) || [];

        if (!Array.isArray(tasks) || tasks.length === 0) {
            container.textContent = "Noch keine Aufgaben vorhanden.";
            return;
        }

        const ul = document.createElement("ul");
        ul.classList.add("task-list");

        tasks.forEach((t) => {
            const li = document.createElement("li");

            const title = t.title ?? t.name ?? "(ohne Titel)";
            const moduleName = t.moduleName ?? t.module?.name ?? "";
            const deadline = t.deadline ?? t.dueDate ?? "";
            const priority = t.priority ?? "";

            let text = title;
            if (moduleName) text += ` – ${moduleName}`;
            if (deadline) text += ` – Fällig: ${deadline}`;
            if (priority) text += ` – Priorität: ${priority}`;

            li.textContent = text;
            ul.appendChild(li);
        });

        container.innerHTML = "";
        container.appendChild(ul);
    } catch (e) {
        console.error("Fehler beim Laden der Aufgaben:", e);
        container.textContent = "Fehler beim Laden der Aufgaben.";
    }
}