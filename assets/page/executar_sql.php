<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

header('Content-Type: application/json');

// Verificar se a consulta SQL foi fornecida
if (!isset($_GET['sql']) || empty($_GET['sql'])) {
   echo json_encode(['status' => 'error', 'message' => 'Consulta SQL não fornecida']);
   exit;
}

// Obter a consulta SQL
$sql = urldecode($_GET['sql']);

if (!preg_match('/^SELECT.*FROM\s+(clientes|produtos)\s+WHERE/i', $sql)) {
   echo json_encode(['status' => 'error', 'message' => 'Consulta não permitida']);
   exit;
}

// Executar a consulta
$result = $conn->query($sql);

if (!$result) {
   echo json_encode(['status' => 'error', 'message' => 'Erro ao executar consulta: ' . $conn->error]);
   exit;
}

// Obter os resultados
$data = [];
while ($row = $result->fetch_assoc()) {
   $data[] = $row;
}

// Fechar conexão
$conn->close();

// Retornar resultados
echo json_encode(['status' => 'success', 'data' => $data]);
