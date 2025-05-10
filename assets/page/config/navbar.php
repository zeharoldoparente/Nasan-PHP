<?php
if (session_status() == PHP_SESSION_NONE) {
   session_start();
}

$usuarioLogado = isset($_SESSION['usuario']) ? $_SESSION['usuario'] : 'Visitante';

$nomeUsuario = $usuarioLogado;
if (isset($_SESSION['nome'])) {
   $nomeUsuario = $_SESSION['nome'];
}
$isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] == 1;
$debug = false;
if ($debug) {
   echo "<pre style='position:fixed;top:100px;right:10px;background:white;z-index:9999;padding:10px;border:1px solid black;'>";
   echo "SESSION: ";
   print_r($_SESSION);
   echo "</pre>";
}
?>

<nav class="navbar">
   <div class="logo">
      <a href="../page/home.php">
         <img src="../image/logo.png" alt="Logo Nasam" />
      </a>
      <div class="h2">
         <img src="../image/nome.png" alt="">
      </div>
   </div>
   <div class="links">
      <a href="../page/home.php">Home</a>
      <?php if ($isAdmin): ?>
         <a href="../page/administracao.php">Administração</a>
      <?php endif; ?>
      <a href="../page/cadastros.php">Cadastros</a>

      <div class="dropdown">
         <a href="#">Pedidos</a>
         <i class="bi bi-arrow-down-short"></i>
         <div class="menu">
            <a href="../page/createPed.php">Criar Pedido</a>
            <a href="../page/listPed.php">Lista de Pedidos</a>
         </div>
      </div>
      <a href="../page/sobre.php">Sobre</a>
   </div>
   <div class="navbar-right">
      <div class="hamburger-menu" onclick="toggleMenu()">
         <i class="bi bi-list"></i>
      </div>
      <div class="avatar-dropdown">
         <img src="../image/avatar.png" alt="Avatar" class="avatar" onclick="toggleUserMenu()" />
         <div class="user-menu" id="user-menu">
            <div class="user-info">
               <p id="user-name"><?php echo htmlspecialchars($nomeUsuario); ?></p>
               <span class="user-email"><?php echo htmlspecialchars($usuarioLogado); ?></span>
            </div>
            <button class="edit-button" onclick="openEditModal()">Editar perfil</button>
            <hr />
            <div class="logout">
               <img src="../image/logout.svg" alt="Sair" />
               <a href="../page/config/logout.php">Sair</a>
            </div>
         </div>
      </div>
   </div>
   <div class="mobile-menu">
      <a href="../page/home.php">Home</a>
      <?php if ($isAdmin): ?>
         <a href="../page/administracao.php">Administração</a>
      <?php endif; ?>
      <a href="../page/cadastros.php">Cadastros</a>

      <div class="dropdown">
         <a href="#">Pedidos</a>
         <i class="bi bi-arrow-down-short"></i>
         <div class="menu">
            <a href="../page/createPed.php">Criar Pedido</a>
            <a href="../page/listPed.php">Lista de Pedidos</a>
         </div>
      </div>
      <a href="../page/sobre.php">Sobre</a>
   </div>
</nav>
<div id="edit-modal" class="modal">
   <div class="modal-content">
      <span class="close" onclick="closeEditModal()">&times;</span>
      <h2>Editar Perfil</h2>
      <form id="edit-form" action="../page/config/update_user.php" method="post">
         <div class="form-group">
            <label for="edit-name">Nome:</label>
            <input type="text" id="edit-name" name="nome" value="<?php echo htmlspecialchars($nomeUsuario); ?>" required>
         </div>
         <button type="submit" class="save-button">Salvar</button>
      </form>
   </div>
</div>

<script>
   <?php include __DIR__ . '/../Js/navBar.js'; ?>
</script>