<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

if (isset($_GET['id']) && !empty($_GET['id'])) {
   $id = $_GET['id'];

   $sql = "SELECT * FROM produtos WHERE id = ?";
   $stmt = $conn->prepare($sql);
   $stmt->bind_param("i", $id);
   $stmt->execute();

   $result = $stmt->get_result();

   if ($result->num_rows > 0) {
      $produto = $result->fetch_assoc();
      $response = ['status' => 'success', 'data' => $produto];
   } else {
      $response = ['status' => 'error', 'message' => 'Produto não encontrado'];
   }

   $stmt->close();
} else {
   $response = ['status' => 'error', 'message' => 'ID do produto não fornecido'];
}

$conn->close();

// Retorna resposta em JSON
header('Content-Type: application/json');
echo json_encode($response);
