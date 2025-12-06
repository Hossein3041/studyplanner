export function initHomeView() {
    const heroActions = document.querySelector("#home .hero-actions");
    if (!heroActions) {
        return;
    }

    heroActions.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || !window.routingUtils || !window.navigateTo) {
                return;
            }

            e.preventDefault();

            const url = new URL(href, window.location.origin);
            const route = window.routingUtils = getRouteFromPath(url.pathname);

            window.navigateTo(route);
        });
    });
}