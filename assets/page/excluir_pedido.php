<?php
// Arquivo: excluir_pedido.php
session_start();

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
   exit;
}

// Verificar se o usuário é administrador
$is_admin = false;
$usuario_logado = $_SESSION['usuario'];

// Incluir a conexão com o banco de dados
include_once(__DIR__ . '/config/config.php');

// Verificar permissões do usuário
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

// Se não for administrador, negar acesso
if (!$is_admin) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Permissão negada: somente administradores podem excluir pedidos']);
   exit;
}

// Receber dados JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verificar se os dados necessários foram recebidos
if (!isset($data['pedido_id'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'ID do pedido não fornecido']);
   exit;
}

// Iniciar transação
$conn->begin_transaction();

try {
   // Primero excluir registros relacionados (itens do pedido)
   $sql_delete_itens = "DELETE FROM itens_pedido WHERE pedido_id = ?";
   $stmt_delete_itens = $conn->prepare($sql_delete_itens);
   $stmt_delete_itens->bind_param("i", $data['pedido_id']);
   $stmt_delete_itens->execute();
   $stmt_delete_itens->close();

   // Excluir registros de logs (se existirem)
   $sql_delete_logs = "DELETE FROM logs_pedidos WHERE pedido_id = ?";
   $stmt_delete_logs = $conn->prepare($sql_delete_logs);
   $stmt_delete_logs->bind_param("i", $data['pedido_id']);
   $stmt_delete_logs->execute();
   $stmt_delete_logs->close();

   // Excluir o pedido
   $sql_delete_pedido = "DELETE FROM pedidos WHERE id = ?";
   $stmt_delete_pedido = $conn->prepare($sql_delete_pedido);
   $stmt_delete_pedido->bind_param("i", $data['pedido_id']);
   $stmt_delete_pedido->execute();

   if ($stmt_delete_pedido->affected_rows === 0) {
      throw new Exception("Pedido não encontrado ou já foi excluído");
   }

   $stmt_delete_pedido->close();

   // Commit da transação
   $conn->commit();

   header('Content-Type: application/json');
   echo json_encode(['success' => true, 'message' => 'Pedido excluído com sucesso']);
} catch (Exception $e) {
   // Rollback em caso de erro
   $conn->rollback();

   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
