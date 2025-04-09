<?php
// Iniciar sessão
session_start();

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Usuário não está logado']);
   exit;
}

// Verificar se o nome foi enviado
if (!isset($_POST['nome']) || empty($_POST['nome'])) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Nome não fornecido']);
   exit;
}

// Obter dados
$usuarioLogado = $_SESSION['usuario'];
$novoNome = $_POST['nome'];

// Conexão com banco de dados
$servidor = "localhost";
$usuario = "root";
$senha = "";
$banco = "nasam";

$conn = new mysqli($servidor, $usuario, $senha, $banco);

if ($conn->connect_error) {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados']);
   exit;
}

// Executar UPDATE
$sql = "UPDATE usuarios SET nome = ? WHERE usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $novoNome, $usuarioLogado);
$result = $stmt->execute();
$linhasAfetadas = $stmt->affected_rows;

// Atualizar a sessão se o banco foi atualizado
if ($result) {
   $_SESSION['nome'] = $novoNome;
}

// Fechar conexões
$stmt->close();
$conn->close();

// Responder ao cliente
if ($result && $linhasAfetadas > 0) {
   header('Content-Type: application/json');
   echo json_encode(['success' => true, 'message' => 'Nome atualizado com sucesso']);
} else {
   header('Content-Type: application/json');
   echo json_encode(['success' => false, 'message' => 'Nenhuma alteração realizada. Verifique se o usuário existe.']);
}
