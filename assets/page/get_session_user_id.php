<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não está logado']);
   exit;
}

include_once 'config/config.php';

$usuarioLogado = $_SESSION['usuario'];

$sql = "SELECT id FROM usuarios WHERE usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $usuarioLogado);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
   $row = $result->fetch_assoc();
   $usuario_id = $row['id'];

   header('Content-Type: application/json');
   echo json_encode(['success' => true, 'usuario_id' => $usuario_id]);
} else {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não encontrado no banco de dados']);
}

$stmt->close();
$conn->close();
