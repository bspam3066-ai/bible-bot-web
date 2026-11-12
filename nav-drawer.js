(() => {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("navBackdrop");
  const closeButton = document.getElementById("sideMenuClose");
  const settingsShortcut = document.getElementById("sideMenuSettings");

  if (!toggle || !menu || !backdrop || !closeButton) {
    console.error("Verbum Dei navigation: required menu elements are missing.", {
      toggle: !!toggle, menu: !!menu, backdrop: !!backdrop, closeButton: !!closeButton
    });
    return;
  }

  const closeMenu = (restoreFocus = false) => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
    menu.style.setProperty("transform", "translate3d(-105%,0,0)", "important");
    menu.style.setProperty("visibility", "hidden", "important");
    backdrop.hidden = true;
    backdrop.style.display = "none";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  const openMenu = () => {
    backdrop.hidden = false;
    backdrop.style.display = "block";
    backdrop.style.zIndex = "50";
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    menu.classList.add("is-open");
    menu.style.setProperty("transform", "translate3d(0,0,0)", "important");
    menu.style.setProperty("visibility", "visible", "important");
    menu.style.zIndex = "51";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
  };

  // Use a direct listener on the real button; the drawer is outside the page shell
  // so it cannot be clipped by the page's overflow rules.
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
    else openMenu();
  });

  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    closeMenu(true);
  });
  backdrop.addEventListener("click", () => closeMenu(true));

  // app.js handles data-view navigation at document level. Close after that
  // handler has received the same click.
  menu.querySelectorAll("[data-view]").forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(() => closeMenu(false), 0);
    });
  });

  if (settingsShortcut) {
    settingsShortcut.addEventListener("click", () => {
      window.setTimeout(() => {
        closeMenu(false);
        const settingsButton = document.getElementById("settingsButton");
        if (settingsButton) settingsButton.click();
      }, 0);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  closeMenu(false);
})();