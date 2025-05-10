<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once 'config/config.php';

if (isset($_POST['id']) && !empty($_POST['id'])) {
   $id = $_POST['id'];
   $codigo_barras = isset($_POST['codigo-barras']) ? $_POST['codigo-barras'] : '';
   $nome = $_POST['nome-produto'];
   $unidade = $_POST['unidade'];
   $preco_venda = $_POST['preco-venda'];

   $sql = "UPDATE produtos SET 
            codigo_barras = ?, 
            nome = ?, 
            unidade = ?, 
            preco_venda = ? 
            WHERE id = ?";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param("sssdi", $codigo_barras, $nome, $unidade, $preco_venda, $id);
} else {
   $codigo_barras = isset($_POST['codigo-barras']) ? $_POST['codigo-barras'] : '';
   $nome = $_POST['nome-produto'];
   $unidade = $_POST['unidade'];
   $preco_venda = $_POST['preco-venda'];

   $sql = "INSERT INTO produtos (codigo_barras, nome, unidade, preco_venda) 
            VALUES (?, ?, ?, ?)";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param("sssd", $codigo_barras, $nome, $unidade, $preco_venda);
}
if ($stmt->execute()) {
   $response = ['status' => 'success', 'message' => 'Produto salvo com sucesso!'];
   if (!isset($_POST['id'])) {
      $response['id'] = $conn->insert_id;
   } else {
      $response['id'] = $_POST['id'];
   }
} else {
   $response = ['status' => 'error', 'message' => 'Erro ao salvar produto: ' . $conn->error];
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($response);
