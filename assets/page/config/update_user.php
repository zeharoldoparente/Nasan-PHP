<?php
session_start();

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não está logado']);
   exit;
}

// Verificar se o nome foi enviado
if (!isset($_POST['nome']) || empty($_POST['nome'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Nome não fornecido']);
   exit;
}

// Obter dados
$usuarioLogado = $_SESSION['usuario'];
$novoNome = $_POST['nome'];

// Incluir config.php que agora fornece $conn
require_once(__DIR__ . "/config.php");

// Executar UPDATE
$sql = "UPDATE usuarios SET nome = ? WHERE usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $novoNome, $usuarioLogado);
$result = $stmt->execute();
$linhasAfetadas = $stmt->affected_rows;

// Atualizar a sessão se o banco foi atualizado
if ($result && $linhasAfetadas > 0) {
   $_SESSION['nome'] = $novoNome;
   $resposta = ['success' => true, 'message' => 'Nome atualizado com sucesso'];
} else {
   $resposta = ['success' => false, 'message' => 'Nenhuma alteração realizada. Verifique se o usuário existe.'];
}

// Fechar a declaração
$stmt->close();

// Responder ao cliente
header('Content-Type: application/json');
echo json_encode($resposta);
