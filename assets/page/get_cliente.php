<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once 'config/config.php';

if (isset($_GET['id']) && !empty($_GET['id'])) {
   $id = $_GET['id'];

   $sql = "SELECT * FROM clientes WHERE id = ?";
   $stmt = $conn->prepare($sql);
   $stmt->bind_param("i", $id);
   $stmt->execute();

   $result = $stmt->get_result();

   if ($result->num_rows > 0) {
      $cliente = $result->fetch_assoc();
      $response = ['status' => 'success', 'data' => $cliente];
   } else {
      $response = ['status' => 'error', 'message' => 'Cliente não encontrado'];
   }

   $stmt->close();
} else {
   $response = ['status' => 'error', 'message' => 'ID do cliente não fornecido'];
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($response);
