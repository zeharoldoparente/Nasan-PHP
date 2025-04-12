<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

// Receber os dados do pedido
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
   http_response_code(400);
   echo json_encode(['status' => 'error', 'message' => 'Dados inválidos']);
   exit;
}

// Iniciar transação
$conn->begin_transaction();

try {
   // Inserir o pedido
   $sql = "INSERT INTO pedidos (cliente_id, usuario_id, transportadora, forma_pagamento, observacoes, regiao, valor_total, data_pedido, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Pendente')";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param(
      "iissssn",
      $data['cliente_id'],
      $data['usuario_id'],
      $data['transportadora'],
      $data['forma_pagamento'],
      $data['observacoes'],
      $data['regiao'],
      $data['valor_total']
   );

   if (!$stmt->execute()) {
      throw new Exception("Erro ao inserir pedido: " . $stmt->error);
   }

   // Obter o ID do pedido recém-inserido
   $pedidoId = $conn->insert_id;

   // Inserir os itens do pedido
   $stmt = $conn->prepare("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");

   foreach ($data['produtos'] as $produto) {
      $stmt->bind_param("iiid", $pedidoId, $produto['id'], $produto['quantidade'], $produto['valor']);

      if (!$stmt->execute()) {
         throw new Exception("Erro ao inserir item do pedido: " . $stmt->error);
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
$stmt->close();
$conn->close();
