<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

require_once(__DIR__ . '/../controllers/ProdutoController.php');

// Verifica se o ID foi enviado
if (!isset($_POST['id']) || empty($_POST['id'])) {
   echo json_encode([
      'sucesso' => false,
      'erros' => ['ID do produto não fornecido']
   ]);
   exit();
}

$produtoController = new ProdutoController();
$resultado = $produtoController->excluirProduto($_POST['id']);

// Retorna o resultado como JSON
header('Content-Type: application/json');
echo json_encode($resultado);
exit();
