// src/main/webapp/static/views/adminView.js
import { fetchSession } from "../api.js";

/**
 * Admin-View (Platzhalter):
 * Wird NICHT über Navbar verlinkt.
 * Nur wenn ein ADMIN-User eingeloggt ist und z.B. nach Login
 *   window.navigateTo("admin")
 * aufgerufen wird.
 *
 * Du musst in index.html noch ein <section id="admin" class="view"> ergänzen,
 * damit diese View sichtbar werden kann.
 */
export function initAdminView() {
  const section = document.getElementById("admin");
  if (!section) {
    console.warn(
      "AdminView: #admin nicht gefunden. Bitte <section id=\"admin\" class=\"view\"> im HTML ergänzen."
    );
    return;
  }

  const containerId = "admin-content";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    section.appendChild(container);
  }

  loadAdminOverview(container);
}

async function loadAdminOverview(container) {
  container.textContent = "Lade Admin-Informationen...";

  try {
    const session = await fetchSession();
    if (!session || session.role !== "ADMIN") {
      container.textContent = "Keine Berechtigung für den Admin-Bereich.";
      return;
    }

    container.innerHTML = "";
    const h3 = document.createElement("h3");
    h3.textContent = "Admin-Bereich";

    const p = document.createElement("p");
    p.textContent =
      "Hier könnte später eine Übersicht über alle Studierenden, Module, Aufgaben usw. erscheinen.";

    container.appendChild(h3);
    container.appendChild(p);
  } catch (e) {
    console.error("Fehler beim Laden der Admin-Infos:", e);
    container.textContent = "Fehler beim Laden des Admin-Bereichs.";
  }
}
