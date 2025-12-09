import {
    LOGIN_ENDPOINT,
    REGISTER_ENDPOINT,
    SESSION_ENDPOINT,
    DASHBOARD_STATS_ENDPOINT,
    MODULES_ENDPOINT,
    TASKS_ENDPOINT,
    SESSIONS_ENDPOINT,
    LOGOUT_ENDPOINT,
} from "./endpoints.js";

function getRoutingUtils() {
    if (window.routingUtils) {
        return window.routingUtils;
    }

    const CONTEXTPATH = "/meine-webapp/";
    /**
     * Tomcat/WebApp-Kontext. Alle URLs der App hängen drunter:
     * - HTML: /meine-webapp/
     * - API: /meine-webapp/api/...
     * - JS/CSS: /meine-webapp/static/...
     */

    function getRouteFromPath(path) {
        let p = path;
        if (p.startsWith(CONTEXTPATH)) {
            p = p.substring(CONTEXTPATH.length);
        }
        p = p.replace(/^\//, "");
        return p || "home";

        /**
         * Browser-URL -> SPA-Route
         * - "/meine-webapp/" => p = "" => "home"
         * - "/meine-webapp/dashboard" => p = "dashboard" => "dashboard"
         * - "/meine-webapp/modules" => p = modules => "modules"
         */
    }

    function getFullPath(route) {
        if (!route || route === "home") return CONTEXTPATH;
        return CONTEXTPATH + route.replace(/^\//, "");

        /**
         * SPA-Route -> Browser-URL
         * - "home" => "/meine-webapp/"
         * - "dashboard" => "/meine-webapp/dashboard"
         * - "modules" => "/meine-webapp/modules"
         */
    }

    function getApiUrl(endpoint) {
        const [path, queryString] = endpoint.split("?");
        const normalized = path.startsWith("/") ? path.substring(1) : path;
        const baseUrl = CONTEXTPATH + "api/" + normalized;
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
        /**
         * Aus einem logischen Endpunkt "auth/login" oder "/auth/login?foo/bar" eine volle URL machen
         * - LOGIN_ENDPOINT = "auth/login"
         * - getApiUrl("auth/login") => "/meine-webapp/api/auth/login"
         */
    }

    return {
        CONTEXTPATH,
        getRouteFromPath,
        getFullPath,
        getApiUrl,
    };
}

function ajaxJson(endpoint, method = "GET", body) {
    const { getApiUrl } = getRoutingUtils();
    const url = getApiUrl(endpoint);
    /**
     * Aus einem Endpoint-String wird eine volle URL gebaut => "auth/login" => "/meine-webapp/api/auth/login"
     * Es wird ein XHR-Request geschickt (GET/POST/PUT/DELETE).
     * Json-Antwort wird geparst.
     * Man bekommt ein Promise, denn man mit await verwenden kann. Beispiel:
     * - const result = await ajaxJson("auth/login", "POST", { email, password });
     */

    return new Promise((resolve, reject) => { // ajaxKson gibt es Promise zurück: resolve(value) -> alles ok; reject(error) -> Fehlerfall
        const xhr = new XMLHttpRequest(); // Erzeugt ein neues XHR-Objekt
        xhr.open(method, url, true); // Methode (GET/POST/...); url; true um asynchronität zu erlauben, d.h. die Seite blockiert nicht.

        xhr.withCredentials = true; // Cookies, z.B. Session-Cookie vvom Servlet-Container, werden mitgeschickt.

        xhr.setRequestHeader("Accept", "application/json"); // Ich erwarte JSON als Antwort
        xhr.setRequestHeader("Content-Type", "application/json"); // Ich schicke dir JSON im Request-Body.

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) { // Warten, bis Anfrage komplett fertig ist. Bis dahin nichts machen.
                return;
            }

            const status = xhr.status; // HTTP-Statuscode, z.B. 200, 201, 400, 401, 500, ...

            if (status >= 200 && status < 300) {
                if (!xhr.responseText) {
                    resolve(null);
                    return;
                }
                try {
                    const json = JSON.parse(xhr.responseText);
                    resolve(json);
                } catch (e) {
                    reject(new Error("Antwort ist kein gültiges JSON"));
                }
                return;
            }

            let msg = xhr.statusText || "Unbekannter Fehler";
            try {
                if (xhr.responseText) {
                    const errJson = JSON.parse(xhr.responseText);
                    msg = errJson.message || JSON.stringify(errJson);
                }
            } catch (_) {

            }

            reject(new Error(`HTTP ${status}: ${msg}`));
        };

        xhr.onerror = () => {
            reject(new Error("Netzwerkfehler bei AJAX-Request"));
        };

        if (body !== undefined) {
            xhr.send(JSON.stringify(body));
        } else {
            xhr.send();
        }
    })
}

/* Authentification */
export async function loginUser(email, password) {
    return await ajaxJson(LOGIN_ENDPOINT, "POST", { email, password });
}

export async function registerUser(email, password) {
    return await ajaxJson(REGISTER_ENDPOINT, "POST", { email, password });
}

export async function fetchSession() {
    try {
         const data = await ajaxJson(SESSION_ENDPOINT, "GET");

         if (!data) {
            return {loggedIn: false, role: null, userName: null };
         }

         return {
            loggedIn: !!data.loggedIn,
            role: data.role ?? null,
            userName: data.userName ?? null,
            ...data,
         };
    } catch (_) {
        return { loggedIn: false, role: null, userName: null };
    }
}

export async function logoutUser() {
    return await ajaxJson(LOGOUT_ENDPOINT, "POST");
}

/* Dashboard */

export async function fetchDashboardStats() {
    return await ajaxJson(DASHBOARD_STATS_ENDPOINT, "GET");
}

/* Module */
export async function fetchModules() {
    return await ajaxJson(MODULES_ENDPOINT, "GET");
}

export async function createModule(moduleData) {
    return await ajaxJson(MODULES_ENDPOINT, "POST", moduleData);
}

/* Aufgaben */
export async function fetchTasks() {
    return await ajaxJson(TASKS_ENDPOINT, "GET");
}

export async function createTask(taskData) {
    return await ajaxJson(TASKS_ENDPOINT, "POST", taskData);
}

/* Lernsessions */
export async function fetchSessions() {
    return await ajaxJson(SESSIONS_ENDPOINT, "GET");
}

export async function createSession(sessionData) {
    return await ajaxJson(SESSIONS_ENDPOINT, "POST", sessionData);
}