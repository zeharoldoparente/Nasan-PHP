<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Carregando...</title>
   <style>
      /* Estilo básico para a tela de loading */
      body {
         font-family: Arial, sans-serif;
         display: flex;
         justify-content: center;
         align-items: center;
         height: 100vh;
         margin: 0;
         background-color: #f0f0f0;
      }

      .loading-container {
         text-align: center;
      }

      /* Círculo de carregamento */
      .loader {
         border: 8px solid #f3f3f3;
         border-top: 8px solid #3498db;
         border-radius: 50%;
         width: 50px;
         height: 50px;
         animation: spin 2s linear infinite;
         margin: 0 auto;
      }

      /* Animação de rotação do círculo */
      @keyframes spin {
         0% {
            transform: rotate(0deg);
         }

         100% {
            transform: rotate(360deg);
         }
      }

      /* Estilo da frase de carregamento */
      .loading-text {
         font-size: 18px;
         font-weight: bold;
         margin-top: 20px;
      }
   </style>
</head>

<body>
   <div class="loading-container">
      <div class="loader"></div> <!-- Círculo de carregamento -->
      <div class="loading-text" id="loading-text">Carregando as informações.</div> <!-- Frase com reticências -->
   </div>

   <script>
      // Função para adicionar as reticências de forma dinâmica
      let loadingText = document.getElementById("loading-text");
      let dots = 0;

      function updateLoadingText() {
         dots = (dots + 1) % 4; // Adiciona até 3 pontos e volta
         loadingText.textContent = "Carregando as informações" + ".".repeat(dots);
      }

      setInterval(updateLoadingText, 500); // Atualiza a cada 500ms

      // Redireciona após 3 segundos
      setTimeout(function() {
         window.location.href = '../home.php'; // Redireciona para home após o tempo de loading
      }, 3000);
   </script>
</body>

</html>