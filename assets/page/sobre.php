<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}
ob_start();
function getVersiculoDoDia()
{
   $cacheFile = __DIR__ . '/../../cache/versiculo_diario.json';
   $hoje = date('Y-m-d');

   if (file_exists($cacheFile)) {
      $conteudo = file_get_contents($cacheFile);
      $dados = json_decode($conteudo, true);

      if (isset($dados['data']) && substr($dados['data'], 0, 10) === $hoje) {
         return $dados;
      }
   }

   $token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJUaHUgQXByIDE3IDIwMjUgMTQ6NTI6MDQgR01UKzAwMDAuam9zZWhhcm9sZG9wYXJlbnRlQGdtYWlsLmNvbSIsImlhdCI6MTc0NDkwMTUyNH0.eYluA84Ez_BMQadCVkRvj1l2ZX0nVxvipFDc1_9cohs';
   $apiUrl = 'https://www.abibliadigital.com.br/api/verses/nvi/random';

   $ch = curl_init($apiUrl);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_HTTPHEADER, [
      'Authorization: Bearer ' . $token,
      'Content-Type: application/json'
   ]);

   $response = curl_exec($ch);
   $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
   curl_close($ch);

   if ($httpCode === 200 && $response) {
      $data = json_decode($response, true);

      if ($data && isset($data['text'])) {
         $versiculo = [
            'texto' => $data['text'],
            'referencia' => $data['book']['name'] . ' ' . $data['chapter'] . ':' . $data['number'],
            'data' => date('c')
         ];

         if (!is_dir(dirname($cacheFile))) {
            mkdir(dirname($cacheFile), 0755, true);
         }

         file_put_contents($cacheFile, json_encode($versiculo));

         return $versiculo;
      }
   }

   return [
      'texto' => 'E tenho vos dito estas coisas para que em mim tenham paz, no mundo tereis aflições mas tende bom ânimo, eu venci o mundo.',
      'referencia' => 'João 16:33',
      'data' => date('c')
   ];
}

$versiculo = getVersiculoDoDia();
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
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
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="sobre-modal">
      <div class="sobre-content">
         <h2 id="top">Criado e mantido por</h2>
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
               <p id="verse-text">"<?php echo htmlspecialchars($versiculo['texto']); ?>"</p>
               <p id="verse-reference" class="reference"><?php echo htmlspecialchars($versiculo['referencia']); ?></p>
            </div>
         </div>
      </div>
   </div>
</body>

</html>
<?php ob_end_flush(); ?>