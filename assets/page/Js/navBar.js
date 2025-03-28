function toggleMenu() {
   const menu = document.querySelector(".mobile-menu");
   menu.classList.toggle("open");
}

document.addEventListener("click", function (e) {
   const menu = document.querySelector(".mobile-menu");
   const hamburgerMenu = document.querySelector(".hamburger-menu");
   const logoutButton = document.querySelector(".logout-button");
   if (
      !menu.contains(e.target) &&
      !hamburgerMenu.contains(e.target) &&
      !logoutButton.contains(e.target)
   ) {
      menu.classList.remove("open");
   }
});
