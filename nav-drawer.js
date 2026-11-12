(() => {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("navBackdrop");
  const closeButton = document.getElementById("sideMenuClose");
  const settingsButton = document.getElementById("sideMenuSettings");
  if (!toggle || !menu || !backdrop || !closeButton) return;

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menu.removeAttribute("inert");
    backdrop.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
    const firstLink = menu.querySelector("[data-view]");
    if (firstLink) firstLink.focus();
  }

  function closeMenu(returnFocus = true) {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
    backdrop.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (toggle.getAttribute("aria-expanded") === "true") closeMenu();
    else openMenu();
  });
  closeButton.addEventListener("click", () => closeMenu());
  backdrop.addEventListener("click", () => closeMenu());
  menu.addEventListener("click", event => {
    if (event.target.closest("[data-view]")) closeMenu(false);
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