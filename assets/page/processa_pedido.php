<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

// Habilitar exibição de erros para debug
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// Receber os dados do pedido
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
   http_response_code(400);
   echo json_encode([
      'status' => 'error',
      'message' => 'Dados inválidos',
      'input' => $input
   ]);
   exit;
}

// Verificar campos obrigatórios
if (!isset($data['cliente_id']) || !isset($data['usuario_id']) || !isset($data['produtos']) || empty($data['produtos'])) {
   http_response_code(400);
   echo json_encode([
      'status' => 'error',
      'message' => 'Campos obrigatórios ausentes',
      'data' => $data
   ]);
   exit;
}

// Iniciar transação
$conn->begin_transaction();

try {
   // Validar se o usuário existe
   $checkUser = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
   $checkUser->bind_param("i", $data['usuario_id']);
   $checkUser->execute();
   $userResult = $checkUser->get_result();

   if ($userResult->num_rows === 0) {
      throw new Exception("Usuário com ID " . $data['usuario_id'] . " não existe no banco de dados");
   }

   // Validar se o cliente existe
   $checkCliente = $conn->prepare("SELECT id FROM clientes WHERE id = ?");
   $checkCliente->bind_param("i", $data['cliente_id']);
   $checkCliente->execute();
   $clienteResult = $checkCliente->get_result();

   if ($clienteResult->num_rows === 0) {
      throw new Exception("Cliente com ID " . $data['cliente_id'] . " não existe no banco de dados");
   }

   // Inserir o pedido
   $sql = "INSERT INTO pedidos (cliente_id, usuario_id, transportadora, forma_pagamento, observacoes, regiao, valor_total, data_pedido, status) 
            VALUES (?, ?, ?, ?, ?, 'Não especificada', ?, NOW(), 'Pendente')";

   $stmt = $conn->prepare($sql);

   if (!$stmt) {
      throw new Exception("Erro ao preparar a consulta: " . $conn->error);
   }

   // Converter para os tipos corretos
   $cliente_id = (int)$data['cliente_id'];
   $usuario_id = (int)$data['usuario_id'];
   $valor_total = (float)$data['valor_total'];

   $stmt->bind_param(
      "iisssd",
      $cliente_id,
      $usuario_id,
      $data['transportadora'],
      $data['forma_pagamento'],
      $data['observacoes'],
      $valor_total
   );

   if (!$stmt->execute()) {
      throw new Exception("Erro ao inserir pedido: " . $stmt->error);
   }

   // Obter o ID do pedido recém-inserido
   $pedidoId = $conn->insert_id;

   // Inserir os itens do pedido
   $stmtItems = $conn->prepare("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");

   if (!$stmtItems) {
      throw new Exception("Erro ao preparar a consulta de itens: " . $conn->error);
   }

   foreach ($data['produtos'] as $produto) {
      $produto_id = (int)$produto['id'];
      $quantidade = (int)$produto['quantidade'];
      $valor = (float)$produto['valor'];

      $stmtItems->bind_param("iiid", $pedidoId, $produto_id, $quantidade, $valor);

      if (!$stmtItems->execute()) {
         throw new Exception("Erro ao inserir item do pedido: " . $stmtItems->error);
      }
   }

   // Confirmar a transação
   $conn->commit();

   // Retornar sucesso
   echo json_encode([
      'status' => 'success',
      'message' => 'Pedido cadastrado com sucesso',
      'pedido_id' => $pedidoId
   ]);
} catch (Exception $e) {
   // Desfazer a transação em caso de erro
   $conn->rollback();

   // Retornar erro
   http_response_code(500);
   echo json_encode([
      'status' => 'error',
      'message' => $e->getMessage()
   ]);
}

// Fechar conexão
if (isset($checkUser)) $checkUser->close();
if (isset($checkCliente)) $checkCliente->close();
if (isset($stmtItems)) $stmtItems->close();
if (isset($stmt)) $stmt->close();
$conn->close();
