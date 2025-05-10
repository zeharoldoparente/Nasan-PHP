<?php
session_start();
if (!isset($_SESSION['usuario'])) {
    header("Location: ../../index.php");
    exit();
}

include_once 'config/config.php';
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50; // 50 produtos por página
$offset = ($page - 1) * $limit;
$countSql = "SELECT COUNT(*) as total FROM produtos";
$countResult = $conn->query($countSql);
$totalProdutos = 0;

if ($countResult && $countResult->num_rows > 0) {
    $totalProdutos = $countResult->fetch_assoc()['total'];
}
$sql = "SELECT id, preco_venda, codigo_barras, nome FROM produtos ORDER BY nome LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$produtos = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $produtos[] = $row;
    }
}

$conn->close();
$response = [
    'produtos' => $produtos,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $totalProdutos,
        'totalPages' => ceil($totalProdutos / $limit)
    ]
];

header('Content-Type: application/json');
echo json_encode($response);
