<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}
ob_start();
?>
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
   <link rel="stylesheet" href="../../styles/navbar.css" />
   <link rel="stylesheet" href="../../styles/sobre.css" />

   <title>Sobre Nós</title>
</head>

<body class="sobre-page">
   <div class="container sobre-container">
      <?php include __DIR__ . '/config/navbar.php'; ?>
      <div class="sobre-modal">
         <div class="sobre-content">
            <h2>Criado e mantido por</h2>
            <div class="logo-container logo-lg">
               <img src="../../assets/image/NASAM DEV.svg" alt="NASAM DEV Logo" />
            </div>
            <p>José Aroldo Soares</p>
            <div class="contact">
               <h2>Contato</h2>
               <p>(63) 9 9956-9407</p>
               <p>contato.nasamdev@gmail.com</p>
            </div>
         </div>
      </div>
   </div>
</body>

</html>
<?php ob_end_flush(); ?>