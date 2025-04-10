<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

require_once(__DIR__ . '/../config/config.php');
require_once(__DIR__ . '/../controllers/ProdutoController.php');

try {
   $produtoController = new ProdutoController();
   $produtos = $produtoController->listarProdutos();

   // Retorna lista de produtos como JSON
   header('Content-Type: application/json');
   echo json_encode($produtos);
   exit();
} catch (Exception $e) {
   // Log do erro (você pode substituir por um sistema de log mais robusto)
   error_log('Erro ao listar produtos: ' . $e->getMessage());

   // Retorna erro como JSON
   header('Content-Type: application/json');
   http_response_code(500);
   echo json_encode([
      'erro' => 'Erro ao carregar produtos',
      'detalhes' => $e->getMessage()
   ]);
   exit();
}
