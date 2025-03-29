<?php
session_start(); // Inicia a sessão para armazenar dados temporários

if (isset($_POST["submit"]) && !empty($_POST["usuario"]) && !empty($_POST["senha"])) {
   include_once(__DIR__ . "/config.php");

   $usuario = $_POST['usuario'];
   $senha = $_POST['senha'];

   // Conexão segura usando prepared statements
   $sql = "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?";
   $stmt = $conn->prepare($sql);
   $stmt->bind_param("ss", $usuario, $senha);
   $stmt->execute();
   $result = $stmt->get_result();

   if ($result->num_rows > 0) {
      // Usuário encontrado, inicia sessão e redireciona para página de loading
      $_SESSION['usuario'] = $usuario;
      header('Location: loading.php'); // Página de loading
   } else {
      // Falha no login, redireciona de volta ao index com erro
      header('Location: ../../../index.php?erro=1');
   }

   $stmt->close();
   $conn->close();
} else {
   header('Location: ../../../index.php?erro=1');
}
