<?php
// Não destruímos a sessão imediatamente para permitir a animação
session_start();
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Saindo...</title>
   <style>
      body {
         font-family: 'Poppins', sans-serif;
         margin: 0;
         padding: 0;
         display: flex;
         justify-content: center;
         align-items: center;
         height: 100vh;
         background-color: #f0f0f0;
         transition: opacity 0.5s ease;
      }

      .logout-message {
         text-align: center;
         font-size: 1.5rem;
         color: #333;
      }

      .fade-out {
         opacity: 0;
      }
   </style>
</head>

<body>
   <div class="logout-message">Até logo!</div>

   <script>
      // Inicia a animação de fade-out imediatamente
      setTimeout(function() {
         document.body.classList.add('fade-out');

         // Redireciona após a animação
         setTimeout(function() {
            window.location.href = 'logout_process.php';
         }, 1000);
      }, 800);
   </script>
</body>

</html>