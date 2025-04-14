<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

// Verificar se o usuário é administrador
$isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] == 1;
$usuarioLogado = $_SESSION['usuario'];

// Prevenção contra envios duplicados usando tokens
if (!isset($_SESSION['form_token']) || !isset($_POST['form_token']) || $_SESSION['form_token'] !== $_POST['form_token']) {
   // Gerar um novo token
   $_SESSION['form_token'] = md5(uniqid(mt_rand(), true));
} else {
   // Este é um envio duplicado, responda com um erro
   $response = ['status' => 'error', 'message' => 'Envio duplicado detectado'];
   header('Content-Type: application/json');
   echo json_encode($response);
   exit();
}

// Resetar o token após o processamento
$_SESSION['form_token'] = md5(uniqid(mt_rand(), true));

// Verificar se o CNPJ já existe para novos cadastros
if (!isset($_POST['id']) && isset($_POST['cnpj'])) {
   $cnpj = $_POST['cnpj'];
   $checkSql = "SELECT id FROM clientes WHERE cpf_cnpj = ?";
   $checkStmt = $conn->prepare($checkSql);
   $checkStmt->bind_param("s", $cnpj);
   $checkStmt->execute();
   $checkResult = $checkStmt->get_result();

   if ($checkResult->num_rows > 0) {
      $response = ['status' => 'error', 'message' => 'CNPJ já cadastrado no sistema'];
      header('Content-Type: application/json');
      echo json_encode($response);
      $checkStmt->close();
      exit();
   }
   $checkStmt->close();
}

// Verifica se é uma edição ou novo cadastro
if (isset($_POST['id']) && !empty($_POST['id'])) {
   // EDIÇÃO
   $id = $_POST['id'];

   // Verificar se o usuário não-admin tem permissão para editar este cliente
   if (!$isAdmin) {
      $checkOwnerSql = "SELECT usuario_cadastro FROM clientes WHERE id = ?";
      $checkOwnerStmt = $conn->prepare($checkOwnerSql);
      $checkOwnerStmt->bind_param("i", $id);
      $checkOwnerStmt->execute();
      $checkOwnerResult = $checkOwnerStmt->get_result();

      if ($checkOwnerResult->num_rows > 0) {
         $cliente = $checkOwnerResult->fetch_assoc();
         if ($cliente['usuario_cadastro'] !== $usuarioLogado) {
            $response = ['status' => 'error', 'message' => 'Você não tem permissão para editar este cliente'];
            header('Content-Type: application/json');
            echo json_encode($response);
            $checkOwnerStmt->close();
            exit();
         }
      }
      $checkOwnerStmt->close();
   }

   $empresa = $_POST['empresa'];
   $cnpj = $_POST['cnpj'];
   $ie = isset($_POST['ie']) ? $_POST['ie'] : '';
   $email = isset($_POST['email']) ? $_POST['email'] : '';
   $telefone = $_POST['telefone'];
   $cep = $_POST['cep'];
   $rua = $_POST['rua'];
   $numero = $_POST['numero'];
   $bairro = $_POST['bairro'];
   $complemento = isset($_POST['complemento']) ? $_POST['complemento'] : '';
   $cidade = $_POST['cidade'];
   $estado = $_POST['estado'];
   $observacoes = isset($_POST['observacoes']) ? $_POST['observacoes'] : '';

   $sql = "UPDATE clientes SET 
            razao_social = ?, 
            cpf_cnpj = ?, 
            inscricao_estadual = ?, 
            email = ?, 
            telefone = ?, 
            cep = ?, 
            rua = ?, 
            numero = ?, 
            bairro = ?, 
            complemento = ?, 
            cidade = ?, 
            estado = ?, 
            observacoes = ? 
            WHERE id = ?";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param("sssssssssssssi", $empresa, $cnpj, $ie, $email, $telefone, $cep, $rua, $numero, $bairro, $complemento, $cidade, $estado, $observacoes, $id);
} else {
   // NOVO CADASTRO
   $empresa = $_POST['empresa'];
   $cnpj = $_POST['cnpj'];
   $ie = isset($_POST['ie']) ? $_POST['ie'] : '';
   $email = isset($_POST['email']) ? $_POST['email'] : '';
   $telefone = $_POST['telefone'];
   $cep = $_POST['cep'];
   $rua = $_POST['rua'];
   $numero = $_POST['numero'];
   $bairro = $_POST['bairro'];
   $complemento = isset($_POST['complemento']) ? $_POST['complemento'] : '';
   $cidade = $_POST['cidade'];
   $estado = $_POST['estado'];
   $observacoes = isset($_POST['observacoes']) ? $_POST['observacoes'] : '';

   // Incluir o usuário que está cadastrando
   $sql = "INSERT INTO clientes (razao_social, cpf_cnpj, inscricao_estadual, email, telefone, cep, rua, numero, bairro, complemento, cidade, estado, observacoes, usuario_cadastro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param("ssssssssssssss", $empresa, $cnpj, $ie, $email, $telefone, $cep, $rua, $numero, $bairro, $complemento, $cidade, $estado, $observacoes, $usuarioLogado);
}

// Executa a query
if ($stmt->execute()) {
   $response = ['status' => 'success', 'message' => 'Cliente salvo com sucesso!'];
   if (!isset($_POST['id'])) {
      $response['id'] = $conn->insert_id; // Retorna o ID do cliente recém-inserido
   } else {
      $response['id'] = $_POST['id'];
   }
} else {
   $response = ['status' => 'error', 'message' => 'Erro ao salvar cliente: ' . $conn->error];
}

$stmt->close();
$conn->close();

// Retorna resposta em JSON
header('Content-Type: application/json');
echo json_encode($response);
