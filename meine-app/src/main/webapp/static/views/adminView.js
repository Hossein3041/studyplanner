// src/main/webapp/static/views/adminView.js

import { fetchModules, fetchTasks, fetchSessions } from "../api.js";

export function initAdminView() {
  const root = document.getElementById("admin");
  if (!root) {
    console.warn("AdminView: #admin nicht gefunden");
    return;
  }

  root.innerHTML = `
    <h2>Admin-Bereich</h2>
    <p>Hier kannst du später z. B. Module, User und Statistiken verwalten.</p>
    <div class="admin-panels">
      <section id="admin-modules-panel">
        <h3>Module-Übersicht</h3>
        <div class="admin-modules-list">Lade Module...</div>
      </section>
      <section id="admin-users-panel">
        <h3>User / Rollen (TODO)</h3>
        <p>Später: Liste aller User, Rollen ändern etc.</p>
      </section>
    </div>
  `;

  // Beispiel: Module laden und anzeigen
  (async () => {
    try {
      const modules = await fetchModules();
      const listEl = root.querySelector(".admin-modules-list");
      if (!listEl) return;

      if (!modules || modules.length === 0) {
        listEl.textContent = "Keine Module vorhanden.";
        return;
      }

      const ul = document.createElement("ul");
      modules.forEach((m) => {
        const li = document.createElement("li");
        li.textContent = `[#${m.id}] ${m.name} (Semester ${m.semester})`;
        ul.appendChild(li);
      });
      listEl.innerHTML = "";
      listEl.appendChild(ul);
    } catch (e) {
      console.error("Fehler beim Laden der Module für Admin:", e);
      const listEl = root.querySelector(".admin-modules-list");
      if (listEl) {
        listEl.textContent = "Fehler beim Laden der Admin-Module.";
      }
    }
  })();
}
