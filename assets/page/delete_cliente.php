<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

// Verificar se o usuário é administrador
$isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] == 1;

// Apenas administradores podem excluir clientes
if (!$isAdmin) {
   $response = ['status' => 'error', 'message' => 'Você não tem permissão para excluir clientes'];
   header('Content-Type: application/json');
   echo json_encode($response);
   exit();
}

if (isset($_POST['id']) && !empty($_POST['id'])) {
   $id = $_POST['id'];

   $sql = "DELETE FROM clientes WHERE id = ?";
   $stmt = $conn->prepare($sql);
   $stmt->bind_param("i", $id);

   if ($stmt->execute()) {
      $response = ['status' => 'success', 'message' => 'Cliente excluído com sucesso!'];
   } else {
      $response = ['status' => 'error', 'message' => 'Erro ao excluir cliente: ' . $conn->error];
   }

   $stmt->close();
} else {
   $response = ['status' => 'error', 'message' => 'ID do cliente não fornecido'];
}

$conn->close();

// Retorna resposta em JSON
header('Content-Type: application/json');
echo json_encode($response);
