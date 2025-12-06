import { fetchSession } from "./api.js";

import { initHomeView } from "./views/homeView.js";
import { initLoginView } from "./views/loginView.js";
import { initRegisterView } from "./views/registerView.js";
import { initDashboardView } from "./views/dashboardView.js";
import { initModulesView } from "./views/modulesView.js";
import { initTasksView } from "./views/tasksView.js";
import { initSessionsView } from "./views/sessionsView.js";
import { initAdminView } from "./views/adminView.js";

const CONTEXTPATH = "/meine-webapp/";

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

function getFullPath(route) {
    if (!route || route === "home") {
        return CONTEXTPATH;
    }
    return CONTEXTPATH + route.replace(/^\//, "");
}

function getApiUrl(endpoint) {
    const [path, queryString] = endpoint.split("?");
    const normalized = path.startsWith("/") ? path.substring(1) : path;
    const baseUrl = CONTEXTPATH + "api/" + normalized;
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

window.routingUtils = {
    CONTEXTPATH,
    getRouteFromPath,
    getFullPath,
    getApiUrl,
};

/* View-Verwaltung */

const publicViews = ["home", "login", "register"];
const protectedViews = ["dashboard", "modules", "tasks", "sessions"];
const adminViews = ["admin"];

const viewInitializers = {
    home: initHomeView,
    login: initLoginView,
    register: initRegisterView,
    dashboard: initDashboardView,
    modules: initModulesView,
    tasks: initTasksView,
    sessions: initSessionsView,
    admin: initAdminView,
};

const initializedViews = new Set();

async function checkViewAuthorization(viewId) {
    const session = await fetchSession();
    const loggedIn = !!session.loggedIn;
    const role = session.role;

    if (publicViews.includes(viewId)) {
        return viewId;
    }

    if (protectedViews.includes(viewId)) {
        if (!loggedIn) return "login";
        return viewId;
    }

    if (adminViews.includes(viewId)) {
        if (!loggedIn) return "login";
        if (role !== "ADMIN") return "dashboard";
        return viewId;
    }

    return "home";
}

function showViewSync(viewId) {
    const views = document.querySelectorAll(".view");
    views.forEach((v) => v.classList.remove("active"));

    const active = document.getElementById(viewId);
    if (active) {
        active.classList.add("active");
    } else {
        console.warn("Unbekannte View:", viewId);
    }

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
    history.pushState({ view: allowed}, "", fullPath);
    showViewSync(allowed);
}
window.navigateTo = navigateTo;

async function updateNavbar(currentView) {
    const session = await fetchSession();
    const loggedIn = !!session.loggedIn;
    const role = session.role;

    const loginLink = document.getElementById("nav-login");
    const registerLink = document.getElementById("nav-register");
    const logoutLink = document.getElementById("nav-logout");
    const dashboardLink = document.getElementById("nav-dashboard");
    const modulesLink = document.getElementById("nav-modules");
    const tasksLink = document.getElementById("nav-tasks");
    const sessionsLink = document.getElementById("nav-sessions");
    const adminLink = document.getElementById("nav-admin");

    if (loggedIn) {
        if (loginLink) loginLink.style.display = "inline-block";
        if (registerLink) registerLink.style.display = "inline-block";

        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";

        if (logoutLink) logoutLink.style.display = "inline-block";

        if (dashboardLink) dashboardLink.style.display = "inline-block";
        if (modulesLink) modulesLink.style.display = "inline-block";
        if (tasksLink) tasksLink.style.display = "inline-block";
        if (sessionsLink) sessionsLink.style.display = "inline-block";

        if (adminLink) {
            adminLink.style.display = role === "ADMIN" ? "inline-block" : "none";
        }
    } else {
        if (loginLink) loginLink.style.display = "inline-block";
        if (registerLink) registerLink.style.display = "inline-block";
        if (logoutLink) logoutLink.style.display = "none";

        if (dashboardLink) dashboardLink.style.display = "none";
        if (modulesLink) modulesLink.style.display = "none";
        if (tasksLink) tasksLink.style.display = "none";
        if (sessionsLink) sessionsLink.style.display = "none";
        if (adminLink) adminLink.style.display = "none";
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        const href = link.getAttribute("href");
        if (!href) return;

        const url = new URL(href, window.location.origin);
        const route = getRouteFromPath(url.pathname);

        if (route === currentView || (currentView === "home" && route === "home")) {
            link.classList.add("active");
        }
    });
}

function setupNavigation() {
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || href === "#") return;

            if (link.id === "nav-logout") {
                e.preventDefault();
                // TODO: Logout-API per ajaxJson/axiosJson aufrufen, Session beenden
                alert("Logout-Endpoint noch nicht implementiert.");
                return;
            }

            e.preventDefault();

            const url = new URL(href, window.location.origin);
            const route = getRouteFromPath(url.pathname);

            navigateTo(route);
        });
    });

    window.addEventListener("popstate", async (e) => {
        const requested = 
            e.state?.view || getRouteFromPath(window.location.pathname);
        const allowed = await checkViewAuthorization(requested);
        showViewSync(allowed);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    setupNavigation();

    const initialRoute = getRouteFromPath(window.location.pathname);
    await navigateTo(initialRoute);
});