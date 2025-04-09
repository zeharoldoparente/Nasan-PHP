<?php
session_start(); // Inicia a sessão para armazenar dados temporários

if (isset($_POST["submit"]) && !empty($_POST["usuario"]) && !empty($_POST["senha"])) {
   include_once(__DIR__ . "/config.php");

   $usuario = $_POST['usuario'];
   $senha = $_POST['senha'];

   // Buscar o usuário no banco
   $sql = "SELECT * FROM usuarios WHERE usuario = ?";
   $stmt = $conn->prepare($sql);
   $stmt->bind_param("s", $usuario);
   $stmt->execute();
   $result = $stmt->get_result();

   if ($result->num_rows > 0) {
      $user = $result->fetch_assoc();

      // Verificar a senha usando password_verify
      if (password_verify($senha, $user['senha'])) {
         // Após verificar a senha
         $_SESSION['usuario'] = $usuario;
         $_SESSION['nome'] = $user['nome']; // Adicione esta linha
         header('Location: loading.php'); // Página de loading
         exit();
      }
   }

   // Falha no login, redireciona de volta ao index com erro
   header('Location: ../../../index.php?erro=1');
   exit();

   $stmt->close();
   $conn->close();
} else {
   header('Location: ../../../index.php?erro=1');
   exit();
}
