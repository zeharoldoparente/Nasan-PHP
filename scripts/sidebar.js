const sidebar = document.getElementById("sidebar");
const menuItems = document.getElementById("menu-items");
const menuToggle = document.getElementById("menu-toggle");

menuToggle.addEventListener("click", function () {
   sidebar.classList.toggle("active");
   menuItems.classList.toggle("active");
   menuToggle.classList.toggle("hide");
});

document.addEventListener("click", function (event) {
   if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove("active");
      menuItems.classList.remove("active");
      menuToggle.classList.remove("hide");
   }
});
