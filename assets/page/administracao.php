<?php
// Arquivo: assets/page/administracao.php


require_once __DIR__ . '/config/config.php';

session_start();
// Verificar se o usuário está logado e é admin
if (!isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
   // Redirecionar para a página inicial ou exibir erro
   header('Location: home.php');
   exit;
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
         <div class="admin-actions">
            <button id="btn-novo-usuario" class="btn-action btn-novo">
               <i class="bi bi-person-plus"></i> Novo Usuário
            </button>
         </div>

         <div class="user-list"></div>

         <div class="user-details">
            <div class="details-user" id="details-user">
               <div class="details-placeholder" id="details-placeholder">
                  <p>Clique em um usuário para obter os detalhes</p>
               </div>

               <form id="user-form" class="user-form hidden">
                  <h3 id="form-title">Detalhes do Usuário</h3>
                  <div class="form-group">
                     <label for="id">ID:</label>
                     <input type="text" id="id" name="id" disabled />
                  </div>

                  <div class="form-group">
                     <label for="usuario">Usuário:</label>
                     <input type="text" id="usuario" name="usuario" required />
                  </div>

                  <div class="form-group">
                     <label for="nome">Nome:</label>
                     <input type="text" id="nome" name="nome" required />
                  </div>

                  <div class="form-group">
                     <label for="senha">Senha:</label>
                     <input type="password" id="senha" name="senha" placeholder="Deixe em branco para manter a senha atual" />
                  </div>

                  <div class="form-group">
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
                  </div>

                  <div class="form-actions">
                     <button type="submit" id="btn-salvar">Salvar Alterações</button>
                     <button type="button" id="btn-cancelar" class="btn-cancel">Cancelar</button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   </div>

   <!-- Modal para mobile -->
   <div id="user-modal" class="modal">
      <div class="modal-content">
         <span class="close-modal">&times;</span>
         <div id="modal-content"></div>
      </div>
   </div>

   <!-- Modal de confirmação para exclusão -->
   <div id="confirm-modal" class="modal">
      <div class="modal-content confirm-modal-content">
         <h3>Confirmar Exclusão</h3>
         <p>Tem certeza que deseja excluir este usuário?</p>
         <div class="confirm-actions">
            <button id="btn-confirm-delete" class="btn-delete">Sim, Excluir</button>
            <button id="btn-cancel-delete" class="btn-cancel">Cancelar</button>
         </div>
      </div>
   </div>

   <!-- Modal de mensagens -->
   <div id="message-modal" class="modal">
      <div class="modal-content message-modal-content">
         <span class="close-message-modal">&times;</span>
         <div id="message-content"></div>
      </div>
   </div>

   <script src="./Js/admin.js"></script>
</body>

</html>
<?php ob_end_flush(); ?>