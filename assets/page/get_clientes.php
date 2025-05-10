<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once 'config/config.php';

$isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] == 1;
$usuario = $_SESSION['usuario'];

if ($isAdmin) {
   $sql = "SELECT id, razao_social, telefone FROM clientes ORDER BY razao_social";
   $result = $conn->query($sql);
} else {
   $sql = "SELECT id, razao_social, telefone FROM clientes WHERE usuario_cadastro = ? ORDER BY razao_social";
   $stmt = $conn->prepare($sql);
   $stmt->bind_param("s", $usuario);
   $stmt->execute();
   $result = $stmt->get_result();
}

$clientes = [];
if ($result && $result->num_rows > 0) {
   while ($row = $result->fetch_assoc()) {
      $clientes[] = $row;
   }
}

if (isset($stmt)) {
   $stmt->close();
}
$conn->close();

header('Content-Type: application/json');
echo json_encode($clientes);
