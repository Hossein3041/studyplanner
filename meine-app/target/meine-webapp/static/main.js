// src/main/webapp/static/main.js

import { fetchSession, logoutUser } from "./api.js";

import { initHomeView } from "./views/homeView.js";
import { initLoginView } from "./views/loginView.js";
import { initRegisterView } from "./views/registerView.js";
import { initDashboardView } from "./views/dashboardView.js";
import { initModulesView } from "./views/modulesView.js";
import { initTasksView } from "./views/tasksView.js";
import { initSessionsView } from "./views/sessionsView.js";
import { initAdminView } from "./views/adminView.js";

const CONTEXTPATH = "/meine-webapp/";
const THEME_KEY = "theme";

/* ========================
   THEME / DARK MODE
   ======================== */

/** Lies gespeichertes Theme oder System-Preference */
function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Hast du die Frage schon einmal bekommen?
  const confirmShown = localStorage.getItem("themeConfirmShown");

  // System-Einstellung auslesen
  let systemTheme = "light";
  if (window.matchMedia) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    systemTheme = prefersDark ? "dark" : "light";
  }

  // Wenn Frage noch nie gezeigt wurde → einmal nachfragen
  if (!confirmShown) {
    const msg =
      systemTheme === "dark"
        ? "Dein System ist im Dunkelmodus. Diesen Modus für StudyPlanner übernehmen?"
        : "Dein System ist im Hellmodus. Diesen Modus für StudyPlanner übernehmen?";

    const accept = window.confirm(msg);
    localStorage.setItem("themeConfirmShown", "yes");

    if (accept) {
      return systemTheme;
    }
  }

  // Standard: Light
  return "light";
}

function updateThemeLabel(theme) {
  const el = document.getElementById("current-theme-label");
  if (!el) return;
  el.textContent = theme === "dark" ? "Dark" : "Light";
}

/** wendet Theme auf <html> an und speichert es */
function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeLabel(theme);
}

/** Initialisiert den Toggle im Header */
function initThemeToggle() {
  const toggle = document.getElementById("darkmode-toggle");
  if (!toggle) return;

  // Beim Laden aktuellen Zustand visuell setzen
  const isDark = document.documentElement.classList.contains("dark");
  toggle.classList.toggle("is-dark", isDark);

  toggle.addEventListener("click", () => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    const nextTheme = currentlyDark ? "light" : "dark";
    applyTheme(nextTheme);
    toggle.classList.toggle("is-dark", nextTheme === "dark");
  });
}

/* möglichst früh Theme anwenden, um Flackern zu vermeiden */
applyTheme(getPreferredTheme());

/* ========================
   META-INFO (Version / Build)
   ======================== */

async function loadMetaInfo() {
  try {
    const resp = await fetch(`${CONTEXTPATH}static/meta.json`);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const meta = await resp.json();

    const versionEl = document.getElementById("app-version");
    const buildEl = document.getElementById("build-timestamp");

    if (versionEl) versionEl.textContent = meta.version ?? "unknown";
    if (buildEl) buildEl.textContent = meta.build ?? "unknown";
  } catch (e) {
    console.warn("Konnte meta.json nicht laden:", e);
    const versionEl = document.getElementById("app-version");
    const buildEl = document.getElementById("build-timestamp");
    if (versionEl) versionEl.textContent = "unknown";
    if (buildEl) buildEl.textContent = "unknown";
  }
}

/* ========================
   ROUTING-UTILS
   ======================== */

/** Pfad aus der Browser-URL -> "Route" (home, login, dashboard, ...) */
function getRouteFromPath(pathname) {
  let path = pathname;
  if (path.startsWith(CONTEXTPATH)) {
    path = path.substring(CONTEXTPATH.length);
  }
  path = path.replace(/^\//, "");

  if (path === "" || path === "index.html") {
    return "home";
  }
  return path;
}

/** Route -> URL im Browser */
function getFullPath(route) {
  if (!route || route === "home") {
    return CONTEXTPATH;
  }
  return CONTEXTPATH + route.replace(/^\//, "");
}

/** API-Endpunkt -> echte URL (für ajaxJson in api.js) */
function getApiUrl(endpoint) {
  const [path, queryString] = endpoint.split("?");
  const normalized = path.startsWith("/") ? path.substring(1) : path;
  const baseUrl = CONTEXTPATH + "api/" + normalized;
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// Globale Utilities, damit api.js sie benutzen kann
window.routingUtils = {
  CONTEXTPATH,
  getRouteFromPath,
  getFullPath,
  getApiUrl,
};

/* ========================
   VIEW-KONFIGURATION
   ======================== */

const publicViews = ["home", "login", "register", "impressum", "datenschutz"];
const protectedViews = ["dashboard", "modules", "tasks", "sessions", "admin"];

const viewInitializers = {
  home: initHomeView,
  login: initLoginView,
  register: initRegisterView,
  dashboard: initDashboardView,
  modules: initModulesView,
  tasks: initTasksView,
  sessions: initSessionsView,
  admin: initAdminView,
  impressum: () => {},
  datenschutz: () => {},
};

const initializedViews = new Set();

async function checkViewAuthorization(viewId) {
  const session = await fetchSession().catch(() => ({ loggedIn: false }));
  const loggedIn = !!session.loggedIn;

  if (publicViews.includes(viewId)) {
    return viewId;
  }

  if (protectedViews.includes(viewId)) {
    if (!loggedIn) {
      return "login";
    }
    return viewId;
  }

  // Unbekannte Route -> home
  return "home";
}

function showViewSync(viewId) {
  // Alle Views verstecken
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.remove("active");
  });

  // Gewünschte View anzeigen
  const active = document.getElementById(viewId);
  if (active) {
    active.classList.add("active");
  } else {
    console.warn("Unbekannte View:", viewId);
  }

  // View-spezifische Initialisierung
  const init = viewInitializers[viewId];
  if (init && !initializedViews.has(viewId)) {
    init();
    initializedViews.add(viewId);
  }

  updateNavbar(viewId);
}

async function navigateTo(route) {
  const allowed = await checkViewAuthorization(route);
  const fullPath = getFullPath(allowed);
  history.pushState({ view: allowed }, "", fullPath);
  showViewSync(allowed);
}

window.navigateTo = navigateTo;

/* ========================
   NAVBAR / STATUS
   ======================== */

async function updateNavbar(currentView) {
  const session = await fetchSession().catch(() => ({ loggedIn: false }));
  const loggedIn = !!session.loggedIn;

  const loginLink = document.getElementById("nav-login");
  const registerLink = document.getElementById("nav-register");
  const logoutLink = document.getElementById("nav-logout");
  const dashboardLink = document.getElementById("nav-dashboard");
  const modulesLink = document.getElementById("nav-modules");
  const tasksLink = document.getElementById("nav-tasks");
  const sessionsLink = document.getElementById("nav-sessions");

  if (loggedIn) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "inline-block";

    if (dashboardLink) dashboardLink.style.display = "inline-block";
    if (modulesLink) modulesLink.style.display = "inline-block";
    if (tasksLink) tasksLink.style.display = "inline-block";
    if (sessionsLink) sessionsLink.style.display = "inline-block";

    const adminLink = document.getElementById("nav-admin");
    
    if (session.role === "ADMIN") {
      adminLink?.classList.remove("hidden");
      adminLink.style.display = "inline-block";
    } else {
      adminLink?.classList.add("hidden");
      adminLink.style.display = "none";
    }

  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (registerLink) registerLink.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = "none";

    if (dashboardLink) dashboardLink.style.display = "none";
    if (modulesLink) modulesLink.style.display = "none";
    if (tasksLink) tasksLink.style.display = "none";
    if (sessionsLink) sessionsLink.style.display = "none";
  }

  // Aktiven Link markieren (über data-route)
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    const route = link.dataset.route;
    if (!route) return;

    if (route === currentView || (currentView === "home" && route === "home")) {
      link.classList.add("active");
    }
  });
}

/* ========================
   NAVIGATION-SETUP
   ======================== */

function setupNavigation() {
  // Header-Links + Hero-Buttons + ggf. Login/Signup-Links
  const clickable = document.querySelectorAll(
    ".nav-link, #home .hero-actions a, .signup-link a"
  );

  clickable.forEach((link) => {
    const route = link.dataset.route;
    if (!route) {
      // Link ohne data-route -> normales Verhalten
      return;
    }

    link.addEventListener("click", async (e) => {
      e.preventDefault();

      if (route === "logout") {
        try {
          await logoutUser();
          await fetchSession();
        } catch (err) {
          console.error("Logout fehlgeschlagen:", err);
        }
        if (window.navigateTo) {
          window.navigateTo("login");
        }
        return;
      }

      navigateTo(route);
    });
  });

  // Back/Forward-Buttons im Browser
  window.addEventListener("popstate", async (e) => {
    const requested =
      e.state?.view || getRouteFromPath(window.location.pathname);
    const allowed = await checkViewAuthorization(requested);
    showViewSync(allowed);
  });
}

/* ========================
   INITIALISIERUNG
   ======================== */

document.addEventListener("DOMContentLoaded", async () => {
  initThemeToggle();
  loadMetaInfo();
  setupNavigation();

  const initialRoute = getRouteFromPath(window.location.pathname);
  await navigateTo(initialRoute);
});
