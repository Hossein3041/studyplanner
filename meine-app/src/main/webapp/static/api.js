import {
    LOGIN_ENDPOINT,
    REGISTER_ENDPOINT,
    SESSION_ENDPOINT,
    DASHBOARD_STATS_ENDPOINT,
    MODULES_ENDPOINT,
    TASKS_ENDPOINT,
    SESSIONS_ENDPOINT,
} from "./endpoints.js";

function getRoutingUtils() {
    if (window.routingUtils) {
        return window.routingUtils;
    }

    const CONTEXTPATH = "/meine-webapp/";

    function getRouteFromPath(path) {
        let p = path;
        if (p.startsWith(CONTEXTPATH)) {
            p = p.substring(CONTEXTPATH.length);
        }
        p = p.replace(/^\//, "");
        return p || "home";
    }

    function getFullPath(route) {
        if (!route || route === "home") return CONTEXTPATH;
        return CONTEXTPATH + route.replace(/^\//, "");
    }

    function getApiUrl(endpoint) {
        const [path, queryString] = endpoint.split("?");
        const normalized = path.startsWith("/") ? path.substring(1) : path;
        const baseUrl = CONTEXTPATH + "api/" + normalized;
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }

    return {
        CONTEXTPATH,
        getRouteFromPath,
        getFullPath,
        getApiUrl,
    };
}

