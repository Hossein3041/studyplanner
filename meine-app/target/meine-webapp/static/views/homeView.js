
export function initHomeView() {
  const heroActions = document.querySelector("#home .hero-actions");
  if (!heroActions) {
    return;
  }

  heroActions.querySelectorAll("a[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const route = link.dataset.route;
      if (!route || !window.navigateTo) {
        return;
      }

      e.preventDefault();
      window.navigateTo(route);
    });
  });
}
