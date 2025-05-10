<?php
session_start();

if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
   exit;
}

$is_admin = false;
$usuario_id = null;
$usuario_logado = $_SESSION['usuario'];

include_once 'config/config.php';

$sql_user = "SELECT id, admin FROM usuarios WHERE usuario = ?";
$stmt_user = $conn->prepare($sql_user);
$stmt_user->bind_param("s", $usuario_logado);
$stmt_user->execute();
$result_user = $stmt_user->get_result();

if ($result_user->num_rows > 0) {
   $user_data = $result_user->fetch_assoc();
   $is_admin = $user_data['admin'] == 1;
   $usuario_id = $user_data['id'];
} else {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
   exit;
}
$stmt_user->close();

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$sql = "SELECT p.id, p.cliente_id, p.usuario_id, p.forma_pagamento, 
               p.valor_total, p.data_pedido, p.status,
               c.razao_social as cliente_nome,
               u.nome as vendedor_nome
        FROM pedidos p
        INNER JOIN clientes c ON p.cliente_id = c.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE 1=1";

$params = [];
$types = "";

if (isset($data['numero_pedido']) && !empty($data['numero_pedido'])) {
   $sql .= " AND p.id = ?";
   $params[] = $data['numero_pedido'];
   $types .= "i";
}

if (isset($data['cliente']) && !empty($data['cliente'])) {
   $cliente_busca = '%' . $data['cliente'] . '%';
   $sql .= " AND c.razao_social LIKE ?";
   $params[] = $cliente_busca;
   $types .= "s";
}

if (isset($data['status']) && !empty($data['status'])) {
   $sql .= " AND p.status = ?";
   $params[] = $data['status'];
   $types .= "s";
}

if (isset($data['data_inicio']) && !empty($data['data_inicio'])) {
   $sql .= " AND p.data_pedido >= ?";
   $params[] = $data['data_inicio'];
   $types .= "s";
}

if (isset($data['data_fim']) && !empty($data['data_fim'])) {
   $sql .= " AND p.data_pedido <= ?";
   $params[] = $data['data_fim'] . " 23:59:59";
   $types .= "s";
}

if ($is_admin && isset($data['vendedor']) && !empty($data['vendedor'])) {
   $vendedor_busca = '%' . $data['vendedor'] . '%';
   $sql .= " AND u.nome LIKE ?";
   $params[] = $vendedor_busca;
   $types .= "s";
} elseif (!$is_admin) {
   $sql .= " AND p.usuario_id = ?";
   $params[] = $usuario_id;
   $types .= "i";
}

$sql .= " ORDER BY p.data_pedido DESC LIMIT 100";

$stmt = $conn->prepare($sql);

if (!empty($params)) {
   $stmt->bind_param($types, ...$params);
}

try {
   $stmt->execute();
   $result = $stmt->get_result();
   $pedidos = [];

   while ($row = $result->fetch_assoc()) {
      $pedidos[] = $row;
   }

   header('Content-Type: application/json');
   echo json_encode(['success' => true, 'pedidos' => $pedidos]);
} catch (Exception $e) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Erro ao filtrar pedidos: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
