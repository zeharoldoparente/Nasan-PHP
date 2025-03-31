<nav class="navbar">
   <div class="logo">
      <a href="./home.php"><img src="../image/logo.png" alt="Logo Nasam" /></a>
      <div class="h2"><img src="../image/nome.png" alt=""></div>
   </div>
   <div class="links">
      <a href="../home.php">Home</a>
      <a href="#">Administração</a>
      <div class="dropdown">
         <a href="#">Pedidos</a>
         <i class="bi bi-arrow-down-short"></i>
         <div class="menu">
            <a href="#">Criar Pedido</a>
            <a href="#">Lista de Pedidos</a>
         </div>
      </div>
   </div>
   <div class="navbar-right">
      <div class="hamburger-menu" onclick="toggleMenu()">
         <i class="bi bi-list"></i>
      </div>
      <div class="logout-button">
         <a href="../../index.php">
            <img src="../image/logout.svg" alt="Sair" />
         </a>
      </div>
   </div>
   <div class="mobile-menu">
      <a href="#">Home</a>
      <a href="#">Administração</a>
      <div class="dropdown">
         <a href="#">Pedidos</a>
         <i class="bi bi-arrow-down-short"></i>
         <div class="menu">
            <a href="#">Criar Pedido</a>
            <a href="#">Lista de Pedidos</a>
         </div>
      </div>
   </div>
</nav>

<script src="./Js/navBar.js"></script>