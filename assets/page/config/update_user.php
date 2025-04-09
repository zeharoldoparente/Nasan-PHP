<?php
// Arquivo para processar a atualização do nome do usuário
session_start();

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não está logado']);
   exit;
}

// Verificar se o nome foi enviado
if (!isset($_POST['nome']) || empty($_POST['nome'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Nome não fornecido']);
   exit;
}

// Obter o nome do formulário
$nome = $_POST['nome'];
$usuario = $_SESSION['usuario'];

// Incluir o arquivo de configuração do banco de dados
include_once(__DIR__ . "/config.php");

// Atualizar o nome do usuário no banco de dados
// Nota: Você precisará ajustar esta consulta conforme a estrutura do seu banco de dados
try {
   // Verificar se a tabela tem uma coluna 'nome'
   // Se não tiver, você pode precisar adicionar essa coluna ao seu banco de dados
   $sql = "UPDATE usuarios SET nome = ? WHERE usuario = ?";
   $stmt = $conn->prepare($sql);
   $stmt->bind_param("ss", $nome, $usuario);
   $result = $stmt->execute();

   if ($result) {
      // Atualizar o nome na sessão
      $_SESSION['nome'] = $nome;

      header('Content-Type: application/json');
      echo json_encode(['success' => true]);
   } else {
      header('Content-Type: application/json');
      echo json_encode(['success' => false, 'message' => 'Erro ao atualizar no banco de dados']);
   }

   $stmt->close();
} catch (Exception $e) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}

$conn->close();
