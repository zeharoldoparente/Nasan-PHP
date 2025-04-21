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
   <link rel="stylesheet" href="../../styles/modal-custom.css" />
   <title>Administração de Usuários</title>
</head>

<body>
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="container">
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="admin-container">
         <div class="admin-header">
            <h2 class="admin-title">Gerenciamento de Usuários</h2>
            <div class="admin-actions">
               <button id="btn-novo-usuario" class="btn-action btn-novo">
                  <i class="bi bi-person-plus"></i> Novo Usuário
               </button>
            </div>
         </div>

         <div class="split-layout">
            <!-- Lista de Usuários (Lado Esquerdo) -->
            <div class="user-list">
               <!-- Os usuários serão carregados pelo JavaScript -->
               <div class="no-users-message" id="no-users-message" style="display: none;">
                  <p>Nenhum usuário encontrado</p>
               </div>
            </div>

            <!-- Detalhes do Usuário (Lado Direito) - Visível apenas em desktop -->
            <div class="user-details">
               <div class="details-user" id="details-user">
                  <div class="details-placeholder" id="details-placeholder">
                     <p>Selecione um usuário para visualizar os detalhes</p>
                  </div>

                  <form id="user-form" class="user-form hidden">
                     <h3 id="form-title">Detalhes do Usuário</h3>

                     <div class="form-row">
                        <div class="form-group">
                           <label for="id">ID:</label>
                           <input type="text" id="id" name="id" disabled />
                        </div>
                        <div class="form-group">
                           <label for="usuario">Usuário:</label>
                           <input type="text" id="usuario" name="usuario" required />
                        </div>
                     </div>

                     <div class="form-row">
                        <div class="form-group">
                           <label for="nome">Nome:</label>
                           <input type="text" id="nome" name="nome" required />
                        </div>
                        <div class="form-group">
                           <label for="senha">Senha:</label>
                           <input type="password" id="senha" name="senha" placeholder="Deixe em branco para manter a senha atual" />
                        </div>
                     </div>

                     <div class="form-group">
                        <label>Administrador?</label>
                        <div class="admin-radio-group">
                           <input
                              type="radio"
                              id="admin-nao"
                              name="admin"
                              value="0" />
                           <label for="admin-nao">
                              <i class="bi bi-person-fill"></i> Usuário comum
                           </label>

                           <input
                              type="radio"
                              id="admin-sim"
                              name="admin"
                              value="1" />
                           <label for="admin-sim">
                              <i class="bi bi-person-fill-gear"></i> Administrador
                           </label>
                        </div>
                     </div>

                     <!-- Status do Usuário (Ativo/Inativo) -->
                     <div class="form-group">
                        <label>Status do Usuário:</label>
                        <div class="status-radio-group">
                           <input
                              type="radio"
                              id="ativo-sim"
                              name="ativo"
                              value="1" />
                           <label for="ativo-sim">
                              <i class="bi bi-person-check"></i> Ativo
                           </label>

                           <input
                              type="radio"
                              id="ativo-nao"
                              name="ativo"
                              value="0" />
                           <label for="ativo-nao">
                              <i class="bi bi-person-fill-slash"></i> Inativo
                           </label>
                        </div>
                     </div>

                     <div class="form-actions">
                        <button type="button" id="btn-cancelar" class="btn-cancel">
                           <i class="bi bi-x-lg"></i> Cancelar
                        </button>
                        <button type="submit" id="btn-salvar">
                           <i class="bi bi-check-lg"></i> Salvar Alterações
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Modal para dispositivos móveis -->
   <div id="user-modal" class="modal-overlay">
      <div class="modal-container">
         <div class="modal-header">
            <h3>Detalhes do Usuário</h3>
            <button class="btn-close-modal">
               <i class="bi bi-x-lg"></i>
            </button>
         </div>
         <div class="modal-content" id="modal-content">
            <!-- Conteúdo será carregado via JavaScript -->
         </div>
      </div>
   </div>

   <!-- Modal de confirmação de exclusão -->
   <div id="modal-confirmar-exclusao" class="modal-overlay">
      <div class="modal-container" style="max-width: 400px;">
         <div class="modal-header">
            <h3>Confirmar Exclusão</h3>
            <button class="btn-close-modal">
               <i class="bi bi-x-lg"></i>
            </button>
         </div>
         <div class="modal-content confirm-modal-content">
            <p>Tem certeza que deseja excluir este usuário?</p>
            <p>Esta ação não poderá ser desfeita.</p>
            <div class="confirm-actions">
               <button type="button" class="btn-cancel btn-close-modal">Cancelar</button>
               <button type="button" id="btn-confirmar-exclusao" class="btn-delete">Excluir</button>
            </div>
         </div>
      </div>
   </div>

   <script src="./Js/admin.js"></script>
   <script src="./Js/modal-custom.js"></script>
</body>

</html>
<?php ob_end_flush(); ?>