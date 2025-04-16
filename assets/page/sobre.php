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

         <div class="daily-verse">
            <h3>Palavra do dia</h3>
            <div id="verse-content">
               <p id="verse-text">Carregando versículo...</p>
               <p id="verse-reference" class="reference"></p>
            </div>
         </div>

         <script>
            document.addEventListener('DOMContentLoaded', function() {
               async function fetchRandomVerse() {
                  try {
                     const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random');
                     const data = await response.json();

                     if (data) {
                        document.getElementById('verse-text').textContent = '"' + data.text + '"';
                        document.getElementById('verse-reference').textContent = data.book.name + ' ' + data.chapter + ':' + data.number;
                     }
                  } catch (error) {
                     console.error('Erro ao buscar versículo:', error);
                     document.getElementById('verse-text').textContent = '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."';
                     document.getElementById('verse-reference').textContent = 'João 3:16';
                  }
               }

               fetchRandomVerse();
            });
         </script>
</body>

</html>
<?php ob_end_flush(); ?>