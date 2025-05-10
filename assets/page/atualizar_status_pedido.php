<?php
session_start();

if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
   exit;
}

$is_admin = false;
$usuario_logado = $_SESSION['usuario'];

include_once 'config/config.php';

$sql_user = "SELECT admin FROM usuarios WHERE usuario = ?";
$stmt_user = $conn->prepare($sql_user);
$stmt_user->bind_param("s", $usuario_logado);
$stmt_user->execute();
$result_user = $stmt_user->get_result();

if ($result_user->num_rows > 0) {
   $user_data = $result_user->fetch_assoc();
   $is_admin = $user_data['admin'] == 1;
}
$stmt_user->close();

if (!$is_admin) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Permissão negada: somente administradores podem alterar o status de pedidos']);
   exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['pedido_id']) || !isset($data['status'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
   exit;
}

$status_permitidos = ['Pendente', 'Aprovado', 'Aprovado com Alteração', 'Enviado', 'Pago', 'Pago Parcial'];
if (!in_array($data['status'], $status_permitidos)) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Status inválido']);
   exit;
}

$sql = "UPDATE pedidos SET status = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $data['status'], $data['pedido_id']);

try {
   $result = $stmt->execute();

   if ($result) {
      $sql_user_id = "SELECT id FROM usuarios WHERE usuario = ?";
      $stmt_user_id = $conn->prepare($sql_user_id);
      $stmt_user_id->bind_param("s", $usuario_logado);
      $stmt_user_id->execute();
      $result_user_id = $stmt_user_id->get_result();
      $usuario_id = $result_user_id->fetch_assoc()['id'];
      $stmt_user_id->close();

      $acao = "Status alterado para: " . $data['status'];
      $sql_log = "INSERT INTO logs_pedidos (pedido_id, usuario_id, acao, data_hora) 
                    VALUES (?, ?, ?, NOW())";
      $stmt_log = $conn->prepare($sql_log);
      $stmt_log->bind_param("iis", $data['pedido_id'], $usuario_id, $acao);
      $stmt_log->execute();
      $stmt_log->close();

      header('Content-Type: application/json');
      echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso']);
   } else {
      throw new Exception("Erro ao atualizar status: " . $stmt->error);
   }
} catch (Exception $e) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
