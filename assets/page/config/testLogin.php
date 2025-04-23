<?php
session_start();

if (isset($_POST["submit"]) && !empty($_POST["usuario"]) && !empty($_POST["senha"])) {
   require_once(__DIR__ . "/config.php");

   // Obter conexão utilizando o padrão singleton
   $db = Database::getInstance();
   $conn = $db->getConnection();

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
         // Verificar se o usuário está ativo
         if ($user['ativo'] == 0) {
            $stmt->close();
            header('Location: ../../../index.php?erro=2');
            exit();
         }

         $_SESSION['usuario'] = $usuario;
         $_SESSION['admin'] = $user['admin'] ?? 0;
         $_SESSION['nome'] = !empty($user['nome']) ? $user['nome'] : $usuario;

         $stmt->close();
         header('Location: loading.php');
         exit();
      }
   }

   $stmt->close();
   header('Location: ../../../index.php?erro=1');
   exit();
} else {
   header('Location: ../../../index.php?erro=1');
   exit();
}
