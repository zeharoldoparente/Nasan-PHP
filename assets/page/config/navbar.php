<?php
if (session_status() == PHP_SESSION_NONE) {
   session_start();
}

$usuarioLogado = isset($_SESSION['usuario']) ? htmlspecialchars($_SESSION['usuario']) : 'Visitante';
$nomeUsuario = isset($_SESSION['nome']) ? htmlspecialchars($_SESSION['nome']) : $usuarioLogado;
$isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] == 1;

$debug = false;
?>

<nav class="navbar">
   <div class="logo">
      <a href="/Nasan-PHP/assets/page/home.php">
         <img src="/Nasan-PHP/assets/image/logo.png" alt="Logo Nasam" />
      </a>
      <div class="h2">
         <img src="/Nasan-PHP/assets/image/nome.png" alt="Nasam">
      </div>
   </div>
   <div class="links">
      <a href="/Nasan-PHP/assets/page/home.php">Home</a>
      <?php if ($isAdmin): ?>
         <a href="/Nasan-PHP/assets/page/administracao.php">Administração</a>
      <?php endif; ?>
      <a href="/Nasan-PHP/assets/page/cadastros.php">Cadastros</a>

      <div class="dropdown">
         <a href="#">Pedidos</a>
         <i class="bi bi-arrow-down-short"></i>
         <div class="menu">
            <a href="/Nasan-PHP/assets/page/createPed.php">Criar Pedido</a>
            <a href="/Nasan-PHP/assets/page/listPed.php">Lista de Pedidos</a>
         </div>
      </div>
      <a href="/Nasan-PHP/assets/page/sobre.php">Sobre</a>
   </div>
   <div class="navbar-right">
      <div class="hamburger-menu" onclick="toggleMenu()">
         <i class="bi bi-list"></i>
      </div>
      <!-- Avatar com o dropdown -->
      <div class="avatar-dropdown">
         <img src="/Nasan-PHP/assets/image/avatar.png" alt="Avatar" class="avatar" onclick="toggleUserMenu()" />
         <div class="user-menu" id="user-menu">
            <div class="user-info">
               <p id="user-name"><?php echo $nomeUsuario; ?></p>
               <span class="user-email"><?php echo $usuarioLogado; ?></span>
            </div>
            <button class="edit-button" onclick="openEditModal()">Editar perfil</button>
            <hr />
            <div class="logout">
               <img src="/Nasan-PHP/assets/image/logout.svg" alt="Sair" />
               <a href="/Nasan-PHP/assets/page/config/logout.php">Sair</a>
            </div>
         </div>
      </div>
   </div>
   <div class="mobile-menu">
      <a href="/Nasan-PHP/assets/page/home.php">Home</a>
      <?php if ($isAdmin): ?>
         <a href="/Nasan-PHP/assets/page/administracao.php">Administração</a>
      <?php endif; ?>
      <a href="/Nasan-PHP/assets/page/cadastros.php">Cadastros</a>

      <div class="dropdown">
         <a href="#">Pedidos</a>
         <i class="bi bi-arrow-down-short"></i>
         <div class="menu">
            <a href="/Nasan-PHP/assets/page/createPed.php">Criar Pedido</a>
            <a href="/Nasan-PHP/assets/page/listPed.php">Lista de Pedidos</a>
         </div>
      </div>
      <a href="/Nasan-PHP/assets/page/sobre.php">Sobre</a>
   </div>
</nav>

<!-- Modal para editar perfil -->
<div id="edit-modal" class="modal">
   <div class="modal-content">
      <span class="close" onclick="closeEditModal()">&times;</span>
      <h2>Editar Perfil</h2>
      <form id="edit-form" action="/Nasan-PHP/assets/page/config/update_user.php" method="post">
         <div class="form-group">
            <label for="edit-name">Nome:</label>
            <input type="text" id="edit-name" name="nome" value="<?php echo $nomeUsuario; ?>" required>
         </div>
         <button type="submit" class="save-button">Salvar</button>
      </form>
   </div>
</div>

<script src="/Nasan-PHP/assets/page/JS/navBar.js"></script>

<?php if ($debug): ?>
   <pre style='position:fixed;top:100px;right:10px;background:white;z-index:9999;padding:10px;border:1px solid black;'>
SESSION: <?php print_r($_SESSION); ?>
</pre>
<?php endif; ?>