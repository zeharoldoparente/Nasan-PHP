<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

require_once(__DIR__ . '/../controllers/ClienteController.php');

// Verifica se o ID foi enviado
if (!isset($_GET['id']) || empty($_GET['id'])) {
   http_response_code(400);
   echo json_encode(['erro' => 'ID do cliente não fornecido']);
   exit();
}

$clienteController = new ClienteController();
$cliente = $clienteController->getClientePorId($_GET['id']);

if ($cliente) {
   header('Content-Type: application/json');
   echo json_encode($cliente);
} else {
   http_response_code(404);
   echo json_encode(['erro' => 'Cliente não encontrado']);
}
exit();
