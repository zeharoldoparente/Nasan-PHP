<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once 'config/config.php';

header('Content-Type: application/json');

if (isset($_GET['nome']) && !empty($_GET['nome'])) {
   $termo = '%' . $_GET['nome'] . '%';
   $sql = "SELECT id, razao_social, cpf_cnpj, telefone, cidade, estado 
            FROM clientes 
            WHERE razao_social LIKE ? 
            ORDER BY razao_social 
            LIMIT 10";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param("s", $termo);
} elseif (isset($_GET['cnpj']) && !empty($_GET['cnpj'])) {
   $termo = '%' . $_GET['cnpj'] . '%';
   $sql = "SELECT id, razao_social, cpf_cnpj, telefone, cidade, estado 
            FROM clientes 
            WHERE cpf_cnpj LIKE ? 
            ORDER BY razao_social 
            LIMIT 10";

   $stmt = $conn->prepare($sql);
   $stmt->bind_param("s", $termo);
} else {
   echo json_encode([]);
   exit;
}

$stmt->execute();
$result = $stmt->get_result();

$clientes = [];
while ($row = $result->fetch_assoc()) {
   $clientes[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($clientes);
