import { fetchModules } from "../api.js";

export async function renderModuleList() {
    const container = document.getElementById("module-list");
    if (!container) {
        console.warn("ModuleList: Element #module-list nicht gefunden.");
        return;
    }

    container.textContent = "Lade Module...";

    try {
        const modules = (await fetchModules()) || [];

        if (!Array.isArray(modules) || modules.length === 0) {
            container.textContent = "Noch keine Module angelegt.";
            return;
        }

        const ul = document.createElement("ul");
        ul.classList.add("module-list");

        modules.forEach((m) => {
            const li = document.createElement("li");
            const name = m.name ?? m.title ?? "(ohne Namen)";
            const semester = m.semester ?? m.term ?? null;

            li.textContent = semester
                ? `${name} (Semester ${semster})` : name;
            
            ul.appendChild(li);
        });

        container.innerHtML = "";
        container.appendChild(ul);
    } catch (e) {
        console.error("Fehler beim Laden der Module: ", e);
        container.textContent = "Fehler beim Laden der Module.";
    }
}

export async function fillModuleSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`ModuleList: <select id="${selectId}"> nicht gefunden.`);
        return;
    }

    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Bitte Modul wählen";
    select.appendChild(placeholder);

    try {
        const modules = (await fetchModules()) || [];
        if (!Array.isArray(modules) || modules.length === 0) {
            return;
        }

        modules.forEach((m) => {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.name ?? m.title ?? `Modul #${m.id}`;
            select.appendChild(opt); 
        });
    } catch (e) {
        console.error("Fehler beim Laden der Module für Select:", e);
    }
}