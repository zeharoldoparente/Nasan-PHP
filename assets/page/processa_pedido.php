<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once 'config/config.php';

$is_admin = false;
$usuario_logado = $_SESSION['usuario'];

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

if (!isset($data['cliente_id']) || !isset($data['usuario_id']) || !isset($data['produtos']) || empty($data['produtos'])) {
   http_response_code(400);
   echo json_encode([
      'status' => 'error',
      'message' => 'Campos obrigatórios ausentes',
      'data' => $data
   ]);
   exit;
}

$conn->begin_transaction();

try {
   $is_update = isset($data['pedido_id']) && !empty($data['pedido_id']);
   $pedidoId = $is_update ? $data['pedido_id'] : null;
   $vendedor_original_id = null;
   $status = 'Pendente';

   if ($is_update) {
      $sql_status = "SELECT status, usuario_id FROM pedidos WHERE id = ?";
      $stmt_status = $conn->prepare($sql_status);
      $stmt_status->bind_param("i", $pedidoId);
      $stmt_status->execute();
      $status_result = $stmt_status->get_result();

      if ($status_result->num_rows > 0) {
         $row = $status_result->fetch_assoc();
         $status_atual = $row['status'];

         $vendedor_original_id = $row['usuario_id'];

         if ($is_admin) {
            $status = 'Aprovado com Alteração';
         } else {
            $status = $status_atual;
         }
      }
      $stmt_status->close();
   }

   $usuario_id_validar = $is_update ? $vendedor_original_id : $data['usuario_id'];
   $checkUser = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
   $checkUser->bind_param("i", $usuario_id_validar);
   $checkUser->execute();
   $userResult = $checkUser->get_result();

   if ($userResult->num_rows === 0) {
      throw new Exception("Usuário com ID " . $usuario_id_validar . " não existe no banco de dados");
   }

   $checkCliente = $conn->prepare("SELECT id FROM clientes WHERE id = ?");
   $checkCliente->bind_param("i", $data['cliente_id']);
   $checkCliente->execute();
   $clienteResult = $checkCliente->get_result();

   if ($clienteResult->num_rows === 0) {
      throw new Exception("Cliente com ID " . $data['cliente_id'] . " não existe no banco de dados");
   }

   $cliente_id = (int)$data['cliente_id'];
   $usuario_id = $is_update ? $vendedor_original_id : (int)$data['usuario_id'];
   $valor_total_bruto = isset($data['valor_total_bruto']) ? (float)$data['valor_total_bruto'] : 0;
   $valor_total_desconto = isset($data['valor_total_desconto']) ? (float)$data['valor_total_desconto'] : 0;
   $valor_total = (float)$data['valor_total'];

   if ($is_update) {
      $sql = "UPDATE pedidos SET 
                cliente_id = ?, 
                usuario_id = ?, 
                transportadora = ?, 
                forma_pagamento = ?, 
                observacoes = ?, 
                valor_total_bruto = ?,
                valor_total_desconto = ?,
                valor_total = ?, 
                status = ?
              WHERE id = ?";

      $stmt = $conn->prepare($sql);

      if (!$stmt) {
         throw new Exception("Erro ao preparar a consulta: " . $conn->error);
      }

      $stmt->bind_param(
         "iisssdddsi",
         $cliente_id,
         $usuario_id,
         $data['transportadora'],
         $data['forma_pagamento'],
         $data['observacoes'],
         $valor_total_bruto,
         $valor_total_desconto,
         $valor_total,
         $status,
         $pedidoId
      );

      $delete_itens = $conn->prepare("DELETE FROM itens_pedido WHERE pedido_id = ?");
      $delete_itens->bind_param("i", $pedidoId);
      $delete_itens->execute();
      $delete_itens->close();
   } else {
      $sql = "INSERT INTO pedidos (
                  cliente_id, 
                  usuario_id, 
                  transportadora, 
                  forma_pagamento, 
                  observacoes, 
                  regiao, 
                  valor_total_bruto,
                  valor_total_desconto,
                  valor_total, 
                  data_pedido, 
                  status
               ) 
               VALUES (?, ?, ?, ?, ?, 'Não especificada', ?, ?, ?, NOW(), ?)";

      $stmt = $conn->prepare($sql);

      if (!$stmt) {
         throw new Exception("Erro ao preparar a consulta: " . $conn->error);
      }

      $stmt->bind_param(
         "iisssddds",
         $cliente_id,
         $usuario_id,
         $data['transportadora'],
         $data['forma_pagamento'],
         $data['observacoes'],
         $valor_total_bruto,
         $valor_total_desconto,
         $valor_total,
         $status
      );
   }

   if (!$stmt->execute()) {
      throw new Exception("Erro ao " . ($is_update ? "atualizar" : "inserir") . " pedido: " . $stmt->error);
   }

   if (!$is_update) {
      $pedidoId = $conn->insert_id;
   }

   $stmtItems = $conn->prepare("INSERT INTO itens_pedido (
      pedido_id, 
      produto_id, 
      quantidade, 
      preco_unitario,
      desconto_percentual,
      valor_desconto
   ) VALUES (?, ?, ?, ?, ?, ?)");

   if (!$stmtItems) {
      throw new Exception("Erro ao preparar a consulta de itens: " . $conn->error);
   }

   foreach ($data['produtos'] as $produto) {
      $produto_id = (int)$produto['id'];
      $quantidade = (int)$produto['quantidade'];
      $valor = (float)$produto['valor'];
      $desconto = (float)$produto['desconto'];
      $valor_desconto = (float)$produto['valor_desconto'];

      $stmtItems->bind_param("iiiddd", $pedidoId, $produto_id, $quantidade, $valor, $desconto, $valor_desconto);

      if (!$stmtItems->execute()) {
         throw new Exception("Erro ao inserir item do pedido: " . $stmtItems->error);
      }
   }

   if ($is_update && $is_admin) {
      $sql_user_id = "SELECT id FROM usuarios WHERE usuario = ?";
      $stmt_user_id = $conn->prepare($sql_user_id);
      $stmt_user_id->bind_param("s", $usuario_logado);
      $stmt_user_id->execute();
      $result_user_id = $stmt_user_id->get_result();
      $usuario_id_log = $result_user_id->fetch_assoc()['id'];
      $stmt_user_id->close();

      $acao = "Pedido alterado por administrador. Status alterado para: Aprovado com Alteração";
      $sql_log = "INSERT INTO logs_pedidos (pedido_id, usuario_id, acao, data_hora) 
                  VALUES (?, ?, ?, NOW())";
      $stmt_log = $conn->prepare($sql_log);
      $stmt_log->bind_param("iis", $pedidoId, $usuario_id_log, $acao);
      $stmt_log->execute();
      $stmt_log->close();
   }

   $conn->commit();

   echo json_encode([
      'status' => 'success',
      'message' => 'Pedido ' . ($is_update ? 'atualizado' : 'cadastrado') . ' com sucesso',
      'pedido_id' => $pedidoId
   ]);
} catch (Exception $e) {
   $conn->rollback();

   http_response_code(500);
   echo json_encode([
      'status' => 'error',
      'message' => $e->getMessage()
   ]);
}

if (isset($checkUser)) $checkUser->close();
if (isset($checkCliente)) $checkCliente->close();
if (isset($stmtItems)) $stmtItems->close();
if (isset($stmt)) $stmt->close();
$conn->close();
