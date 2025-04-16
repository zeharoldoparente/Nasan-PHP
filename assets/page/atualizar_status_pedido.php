<?php
// Arquivo: atualizar_status_pedido.php
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
   echo json_encode(['success' => false, 'message' => 'Permissão negada: somente administradores podem alterar o status de pedidos']);
   exit;
}

// Receber dados JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verificar se os dados necessários foram recebidos
if (!isset($data['pedido_id']) || !isset($data['status'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
   exit;
}

// Validar status permitidos
$status_permitidos = ['Pendente', 'Aprovado', 'Aprovado com Alteração', 'Enviado', 'Pago', 'Pago Parcial'];
if (!in_array($data['status'], $status_permitidos)) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Status inválido']);
   exit;
}

// Atualizar o status do pedido
$sql = "UPDATE pedidos SET status = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $data['status'], $data['pedido_id']);

try {
   $result = $stmt->execute();

   if ($result) {
      // Obter ID do usuário para o log
      $sql_user_id = "SELECT id FROM usuarios WHERE usuario = ?";
      $stmt_user_id = $conn->prepare($sql_user_id);
      $stmt_user_id->bind_param("s", $usuario_logado);
      $stmt_user_id->execute();
      $result_user_id = $stmt_user_id->get_result();
      $usuario_id = $result_user_id->fetch_assoc()['id'];
      $stmt_user_id->close();

      // Registrar log de alteração
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
