<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once 'config/config.php';

header('Content-Type: application/json');

if (!isset($_GET['sql']) || empty($_GET['sql'])) {
   echo json_encode(['status' => 'error', 'message' => 'Consulta SQL não fornecida']);
   exit;
}

$sql = urldecode($_GET['sql']);

if (!preg_match('/^SELECT.*FROM\s+(clientes|produtos)\s+WHERE/i', $sql)) {
   echo json_encode(['status' => 'error', 'message' => 'Consulta não permitida']);
   exit;
}

$result = $conn->query($sql);

if (!$result) {
   echo json_encode(['status' => 'error', 'message' => 'Erro ao executar consulta: ' . $conn->error]);
   exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
   $data[] = $row;
}

$conn->close();

echo json_encode(['status' => 'success', 'data' => $data]);
