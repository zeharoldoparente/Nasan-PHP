<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

// Verifica se é uma edição ou novo cadastro
if (isset($_POST['id']) && !empty($_POST['id'])) {
   // EDIÇÃO
   $id = $_POST['id'];
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

   $sql = "INSERT INTO clientes (razao_social, cpf_cnpj, inscricao_estadual, email, telefone, cep, rua, numero, bairro, complemento, cidade, estado, observacoes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param("sssssssssssss", $empresa, $cnpj, $ie, $email, $telefone, $cep, $rua, $numero, $bairro, $complemento, $cidade, $estado, $observacoes);
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
