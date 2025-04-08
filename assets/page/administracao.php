<?php
include __DIR__ . '/config/config.php';

if (isset($_GET['acao']) && $_GET['acao'] === 'listar_usuarios') {
   $sql = "SELECT id, usuario, nome, senha, admin FROM usuarios";
   $result = $conn->query($sql);

   $usuarios = [];

   while ($row = $result->fetch_assoc()) {
      $usuarios[] = $row;
   }

   header('Content-Type: application/json');
   echo json_encode($usuarios);
   exit;
}
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
   <link rel="stylesheet" href="../../styles/admin.css" />
   <title>Administração</title>
</head>

<body>
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="container">
      <h2>
         <?php include __DIR__ . '/config/page_header.php'; ?>
      </h2>
      <div class="admin-container">
         <div class="user-list"></div>
         <div class="user-details">
            <div class="details-user" id="details-user">
               <div class="details-placeholder" id="details-placeholder">
                  <p>Clique em um usuário para obter os detalhes</p>
               </div>

               <form id="user-form" class="user-form hidden">
                  <h3>Detalhes do Usuário</h3>

                  <label for="id">ID:</label>
                  <input type="text" id="id" name="id" disabled />

                  <label for="usuario">Usuário:</label>
                  <input type="text" id="usuario" name="usuario" />

                  <label for="nome">Nome:</label>
                  <input type="text" id="nome" name="nome" />

                  <label for="senha">Senha:</label>
                  <input type="password" id="senha" name="senha" />

                  <label>Administrador?</label>
                  <div class="admin-radio-group">
                     <input
                        type="radio"
                        id="admin-nao"
                        name="admin"
                        value="0" />
                     <label for="admin-nao" class="radio-nao">❌ Não</label>

                     <input
                        type="radio"
                        id="admin-sim"
                        name="admin"
                        value="1" />
                     <label for="admin-sim" class="radio-sim">✔️ Sim</label>
                  </div>
                  <button type="submit">Salvar Alterações</button>
               </form>
            </div>
         </div>
      </div>
   </div>
   <div id="user-modal" class="modal">
      <div class="modal-content">
         <span class="close-modal">&times;</span>
         <div id="modal-content"></div>
      </div>
   </div>
   <script src="./Js/admin.js"></script>
</body>

</html>
<?php ob_end_flush(); ?>