<?php
session_start();

if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não está logado']);
   exit;
}

if (!isset($_POST['nome']) || empty($_POST['nome'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Nome não fornecido']);
   exit;
}

$usuarioLogado = $_SESSION['usuario'];
$novoNome = $_POST['nome'];

require_once(__DIR__ . "/config.php");

$sql = "UPDATE usuarios SET nome = ? WHERE usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $novoNome, $usuarioLogado);
$result = $stmt->execute();
$linhasAfetadas = $stmt->affected_rows;

if ($result) {
   $_SESSION['nome'] = $novoNome;
}

$stmt->close();
$conn->close();

if ($result && $linhasAfetadas > 0) {
   header('Content-Type: application/json');
   echo json_encode(['success' => true, 'message' => 'Nome atualizado com sucesso']);
} else {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Nenhuma alteração realizada. Verifique se o usuário existe.']);
}
