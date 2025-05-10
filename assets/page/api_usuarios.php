<?php
session_start();

if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['erro' => 'Usuário não autenticado']);
   exit;
}

require_once 'config/config.php';
require_once 'controllers/UsuarioController.php';

$controller = new UsuarioController($conn);

header('Content-Type: application/json');
echo $controller->processarRequisicao();
