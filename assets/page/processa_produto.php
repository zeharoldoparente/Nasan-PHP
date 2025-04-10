<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

require_once(__DIR__ . '/../controllers/ProdutoController.php');

$produtoController = new ProdutoController();
$resultado = $produtoController->processarProduto();

// Retornar resultado como JSON para ser processado pelo JavaScript
header('Content-Type: application/json');
echo json_encode($resultado);
exit();
