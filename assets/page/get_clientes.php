<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

$sql = "SELECT id, razao_social, telefone FROM clientes ORDER BY razao_social";
$result = $conn->query($sql);

$clientes = [];
if ($result->num_rows > 0) {
   while ($row = $result->fetch_assoc()) {
      $clientes[] = $row;
   }
}

$conn->close();

// Retorna resposta em JSON
header('Content-Type: application/json');
echo json_encode($clientes);
