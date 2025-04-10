<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

require_once(__DIR__ . '/../controllers/ClienteController.php');

$clienteController = new ClienteController();
$resultado = $clienteController->processarCliente();

// Retorna o resultado como JSON
header('Content-Type: application/json');
echo json_encode($resultado);
exit();
