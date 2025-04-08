<?php
// Arquivo: assets/page/api_usuarios.php

// Iniciar sessão para verificar autenticação
session_start();

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['erro' => 'Usuário não autenticado']);
   exit;
}

// Incluir arquivos necessários
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/controllers/UsuarioController.php';

// Criar instância do controlador
$controller = new UsuarioController($conn);

// Processar a requisição
header('Content-Type: application/json');
echo $controller->processarRequisicao();
