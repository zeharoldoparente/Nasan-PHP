<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

require_once(__DIR__ . '/../controllers/ProdutoController.php');

$produtoController = new ProdutoController();
$produtos = $produtoController->listarProdutos();

// Retorna lista de produtos como JSON
header('Content-Type: application/json');
echo json_encode($produtos);
exit();
