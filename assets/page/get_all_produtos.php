<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once 'config/config.php';
$sql = "SELECT id, nome, preco_venda, codigo_barras, unidade FROM produtos ORDER BY nome";
$result = $conn->query($sql);

$produtos = [];
if ($result && $result->num_rows > 0) {
   while ($row = $result->fetch_assoc()) {
      $produtos[] = $row;
   }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($produtos);
