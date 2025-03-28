<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet" />
   <link
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
      rel="stylesheet" />
   <link rel="icon" href="../image/logo.png" type="image/x-icon" />
   <link rel="stylesheet" href="../../styles/global.css" />
   <link rel="stylesheet" href="../../styles/home.css" />
   <title>Home</title>
</head>

<body>
   <div class="container">
      <nav class="navbar">
         <div class="logo">
            <a href="#"><img src="../image/logo.png" alt="Logo Nasam" /></a>
            <div class="h2"><img src="../image/nome.png" alt=""></div>
         </div>
         <div class="links">
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
         <div class="navbar-right">
            <div class="hamburger-menu" onclick="toggleMenu()">
               <i class="bi bi-list"></i>
            </div>
            <div class="logout-button">
               <a href="#">
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
   </div>

   <script src="./Js/navBar.js"></script>
</body>

</html>