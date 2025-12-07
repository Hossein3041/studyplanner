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
        ? `${name} (Semester ${semester})`
        : name;

      ul.appendChild(li);
    });

    container.innerHTML = "";
    container.appendChild(ul);
  } catch (e) {
    console.error("Fehler beim Laden der Module: ", e);
    container.textContent = "Fehler beim Laden der Module.";
  }
}

export function fillModuleSelect() {
  console.warn("fillModuleSelect() ist noch nicht implementiert.");
}
