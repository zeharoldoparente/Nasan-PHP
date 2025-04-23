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
         // Verificar se o usuário está ativo
         if ($user['ativo'] == 0) {
            // Usuário inativo, redirecionar com erro específico
            header('Location: ../../../index.php?erro=2');
            exit();
         }

         // Senha correta e usuário ativo, inicia sessão
         $_SESSION['usuario'] = $usuario;

         // Armazenar status de administrador na sessão
         $_SESSION['admin'] = $user['admin'] ?? 0;

         // Verificar se existe a coluna 'nome' na tabela e se tem valor
         if (isset($user['nome']) && !empty($user['nome'])) {
            $_SESSION['nome'] = $user['nome'];
         } else {
            // Se não existir ou estiver vazio, usar o nome de usuário como padrão
            $_SESSION['nome'] = $usuario;
         }

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
