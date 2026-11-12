(() => {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("navBackdrop");
  const closeButton = document.getElementById("sideMenuClose");
  const settingsButton = document.getElementById("sideMenuSettings");
  if (!toggle || !menu || !backdrop || !closeButton) return;

  const closeMenu = (restoreFocus = true) => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
    backdrop.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
    if (restoreFocus) toggle.focus();
  };

  const openMenu = () => {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menu.removeAttribute("inert");
    backdrop.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
    closeButton.focus();
  };

  toggle.addEventListener("click", () => {
    toggle.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });
  closeButton.addEventListener("click", () => closeMenu());
  backdrop.addEventListener("click", () => closeMenu());

  // Keep section navigation in the site's existing app.js routing system.
  menu.querySelectorAll("[data-view]").forEach(link => {
    link.addEventListener("click", () => {
      const view = link.dataset.view;
      closeMenu(false);
      document.dispatchEvent(new CustomEvent("verbum:menu-select", { detail: view }));
    });
  });

  if (settingsButton) settingsButton.addEventListener("click", () => {
    closeMenu(false);
    const settings = document.getElementById("settingsButton");
    if (settings) settings.click();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") closeMenu();
  });
})();