import { fetchSessions } from "../api.js";

export async function renderSessionList() {
    const container = document.getElementById("session-list");
    if (!container) {
        console.warn("SessionList: Element #session-list nicht gefunden.");
        return;
    }

    container.textContent = "Lade Lernsessions...";

    try {
        const sessions = (await fetchSessions()) || [];

        if (!Array.isArray(sessions) || sessions.length === 0) {
            container.textContent = "Noch keine Lernsessions gespeichert.";
            return;
        }

        const ul = document.createElement("ul");
        ul.classList.add("session-list");

        sessions.forEach((s) => {
            const li = document.createElement("li");

            const moduleName = s.moduleName ?? s.module?.name ?? "";
            const date = s.date ?? s.sessionDate ?? "";
            const duration = s.durationMinutes ?? s.duration ?? "";

            let text = moduleName || "Unbekanntes Modul";
            if (date) text += ` – ${date}`;
            if (duration) text += ` – ${duration} Minuten`;

            if (s.note) {
                text += ` – Notiz: ${s.note}`;
            }

            li.textContent = text;
            ul.appendChild(li);
        });

        container.innerHTML = "";
        container.appendChild(ul);
    } catch (e) {
        console.error("Fehler beim Laden der Lernsessions:", e);
        container.textContent = "Fehler beim Laden der Lernsessions.";
    }
}