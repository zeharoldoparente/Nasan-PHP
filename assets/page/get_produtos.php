<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

// Modificado para incluir o código de barras na consulta
$sql = "SELECT id, nome, preco_venda, codigo_barras FROM produtos ORDER BY nome";
$result = $conn->query($sql);

$produtos = [];
if ($result->num_rows > 0) {
   while ($row = $result->fetch_assoc()) {
      $produtos[] = $row;
   }
}

$conn->close();

// Retorna resposta em JSON
header('Content-Type: application/json');
echo json_encode($produtos);
