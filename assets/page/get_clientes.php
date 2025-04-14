<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}

include_once(__DIR__ . '/config/config.php');

// Verificar se o usuário é administrador
$isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] == 1;
$usuario = $_SESSION['usuario'];

// Query de seleção baseada no tipo de usuário
if ($isAdmin) {
   // Administradores veem todos os clientes
   $sql = "SELECT id, razao_social, telefone FROM clientes ORDER BY razao_social";
   $result = $conn->query($sql);
} else {
   // Usuários comuns veem apenas seus próprios clientes
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

// Retorna resposta em JSON
header('Content-Type: application/json');
echo json_encode($clientes);
