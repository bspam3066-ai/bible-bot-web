(() => {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("navBackdrop");
  const closeButton = document.getElementById("sideMenuClose");
  const settingsShortcut = document.getElementById("sideMenuSettings");
  if (!toggle || !menu || !backdrop || !closeButton) {
    console.error("Verbum Dei navigation: required menu elements are missing.");
    return;
  }

  const closeMenu = (restoreFocus = false) => {
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
    backdrop.hidden = false;
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
    closeButton.focus();
  };

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    if (toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
    else openMenu();
  });
  closeButton.addEventListener("click", () => closeMenu(true));
  backdrop.addEventListener("click", () => closeMenu(true));

  // Let app.js receive the original data-view click and route to the section.
  menu.querySelectorAll("[data-view]").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });

  if (settingsShortcut) {
    settingsShortcut.addEventListener("click", () => {
      closeMenu(false);
      const settingsButton = document.getElementById("settingsButton");
      if (settingsButton) settingsButton.click();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  closeMenu(false);
})();