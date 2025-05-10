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
   echo json_encode(['success' => false, 'message' => 'Permissão negada: somente administradores podem excluir pedidos']);
   exit;
}
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['pedido_id'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'ID do pedido não fornecido']);
   exit;
}
$conn->begin_transaction();

try {
   $sql_delete_itens = "DELETE FROM itens_pedido WHERE pedido_id = ?";
   $stmt_delete_itens = $conn->prepare($sql_delete_itens);
   $stmt_delete_itens->bind_param("i", $data['pedido_id']);
   $stmt_delete_itens->execute();
   $stmt_delete_itens->close();

   $sql_delete_logs = "DELETE FROM logs_pedidos WHERE pedido_id = ?";
   $stmt_delete_logs = $conn->prepare($sql_delete_logs);
   $stmt_delete_logs->bind_param("i", $data['pedido_id']);
   $stmt_delete_logs->execute();
   $stmt_delete_logs->close();

   $sql_delete_pedido = "DELETE FROM pedidos WHERE id = ?";
   $stmt_delete_pedido = $conn->prepare($sql_delete_pedido);
   $stmt_delete_pedido->bind_param("i", $data['pedido_id']);
   $stmt_delete_pedido->execute();

   if ($stmt_delete_pedido->affected_rows === 0) {
      throw new Exception("Pedido não encontrado ou já foi excluído");
   }

   $stmt_delete_pedido->close();

   $conn->commit();

   header('Content-Type: application/json');
   echo json_encode(['success' => true, 'message' => 'Pedido excluído com sucesso']);
} catch (Exception $e) {
   $conn->rollback();

   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
