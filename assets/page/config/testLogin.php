<?php
session_start();

if (isset($_POST["submit"]) && !empty($_POST["usuario"]) && !empty($_POST["senha"])) {
   require_once __DIR__ . "/config.php";

   if (!$conn) {
      error_log("Falha na conexão com o banco de dados");
      header('Location: ../../../index.php?erro=3');
      exit();
   }

   $usuario = $_POST['usuario'];
   $senha = $_POST['senha'];

   error_log("Tentativa de login para usuário: " . $usuario);

   $sql = "SELECT * FROM usuarios WHERE usuario = ?";
   $stmt = $conn->prepare($sql);

   if (!$stmt) {
      error_log("Erro na preparação da query: " . $conn->error);
      header('Location: ../../../index.php?erro=3');
      exit();
   }

   $stmt->bind_param("s", $usuario);
   $stmt->execute();
   $result = $stmt->get_result();

   if ($result->num_rows > 0) {
      $user = $result->fetch_assoc();

      if (password_verify($senha, $user['senha'])) {
         if ($user['ativo'] == 0) {
            $stmt->close();
            header(header: 'Location: ../../../index.php?erro=2');
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
