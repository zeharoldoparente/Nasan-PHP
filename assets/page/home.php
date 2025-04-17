<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}
ob_start();

// Incluir a conexão com o banco de dados
include_once(__DIR__ . '/config/config.php');

// Verificar se o usuário é administrador
$is_admin = false;
$usuario_logado = $_SESSION['usuario'];
$usuario_id = null;

$sql_user = "SELECT id, admin, nome FROM usuarios WHERE usuario = ?";
$stmt_user = $conn->prepare($sql_user);
$stmt_user->bind_param("s", $usuario_logado);
$stmt_user->execute();
$result_user = $stmt_user->get_result();

if ($result_user->num_rows > 0) {
   $user_data = $result_user->fetch_assoc();
   $is_admin = $user_data['admin'] == 1;
   $usuario_id = $user_data['id'];
   $usuario_nome = $user_data['nome'] ?? $usuario_logado;
}
$stmt_user->close();

// Função para obter a contagem de pedidos por status
function getStatusCount($conn, $status, $usuario_id = null, $is_admin = false)
{
   // Para diagnóstico: imprimir no console PHP os parâmetros recebidos
   error_log("Buscando contagem para status: '{$status}', usuario_id: {$usuario_id}, is_admin: " . ($is_admin ? 'true' : 'false'));

   $sql = "SELECT COUNT(*) as total FROM pedidos WHERE status = ?";

   // Se não for admin, filtrar apenas os pedidos do usuário
   if (!$is_admin && $usuario_id) {
      $sql .= " AND usuario_id = ?";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("si", $status, $usuario_id);
   } else {
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("s", $status);
   }

   $stmt->execute();
   $result = $stmt->get_result();
   $count = $result->fetch_assoc()['total'];
   $stmt->close();

   // Para diagnóstico: imprimir a contagem obtida
   error_log("Contagem para status '{$status}': {$count}");

   return $count;
}

// Obter estatísticas de pedidos
$total_pedidos = 0;
$valor_total = 0.00;
$pedidos_pendentes = 0;
$pedidos_aprovados = 0;
$pedidos_alterados = 0;
$pedidos_enviados = 0;
$pedidos_pagos = 0;
$pedidos_pagos_parcial = 0;

// Verificação direta dos dados de status no banco para diagnóstico
$sql_verificar_status = "SELECT status, COUNT(*) as total FROM pedidos GROUP BY status";
$result_verificar = $conn->query($sql_verificar_status);
if ($result_verificar) {
   error_log("---- Verificação direta dos status no banco ----");
   while ($row = $result_verificar->fetch_assoc()) {
      error_log("Status: '" . $row['status'] . "', Quantidade: " . $row['total']);
   }
   error_log("----------------------------------------------");
}

// Consulta base para estatísticas
if ($is_admin) {
   // Admin vê todos os pedidos
   $sql_total = "SELECT COUNT(*) as total, SUM(valor_total) as valor_total FROM pedidos";
   $stmt_total = $conn->prepare($sql_total);
} else {
   // Usuário comum vê apenas seus pedidos
   $sql_total = "SELECT COUNT(*) as total, SUM(valor_total) as valor_total FROM pedidos WHERE usuario_id = ?";
   $stmt_total = $conn->prepare($sql_total);
   $stmt_total->bind_param("i", $usuario_id);
}

$stmt_total->execute();
$result_total = $stmt_total->get_result();

if ($result_total->num_rows > 0) {
   $data_total = $result_total->fetch_assoc();
   $total_pedidos = $data_total['total'];
   $valor_total = $data_total['valor_total'] ?? 0;
}
$stmt_total->close();

// Obter contagem por status
$pedidos_pendentes = getStatusCount($conn, 'Pendente', $usuario_id, $is_admin);
$pedidos_aprovados = getStatusCount($conn, 'Aprovado', $usuario_id, $is_admin);
$pedidos_alterados = getStatusCount($conn, 'Aprovado com Alteraç', $usuario_id, $is_admin);
$pedidos_enviados = getStatusCount($conn, 'Enviado', $usuario_id, $is_admin);
$pedidos_pagos = getStatusCount($conn, 'Pago', $usuario_id, $is_admin);
$pedidos_pagos_parcial = getStatusCount($conn, 'Pago Parcial', $usuario_id, $is_admin);

// Obter pedidos recentes
if ($is_admin) {
   $sql_recentes = "SELECT p.id, p.data_pedido, p.valor_total, p.status, c.razao_social as cliente_nome, u.nome as vendedor_nome 
                     FROM pedidos p
                     INNER JOIN clientes c ON p.cliente_id = c.id
                     INNER JOIN usuarios u ON p.usuario_id = u.id
                     ORDER BY p.data_pedido DESC LIMIT 5";
   $stmt_recentes = $conn->prepare($sql_recentes);
} else {
   $sql_recentes = "SELECT p.id, p.data_pedido, p.valor_total, p.status, c.razao_social as cliente_nome, u.nome as vendedor_nome 
                     FROM pedidos p
                     INNER JOIN clientes c ON p.cliente_id = c.id
                     INNER JOIN usuarios u ON p.usuario_id = u.id
                     WHERE p.usuario_id = ?
                     ORDER BY p.data_pedido DESC LIMIT 5";
   $stmt_recentes = $conn->prepare($sql_recentes);
   $stmt_recentes->bind_param("i", $usuario_id);
}

$stmt_recentes->execute();
$result_recentes = $stmt_recentes->get_result();
$pedidos_recentes = [];

while ($row = $result_recentes->fetch_assoc()) {
   $pedidos_recentes[] = $row;
}
$stmt_recentes->close();

// Para admin: verificar vendedores com mais pedidos
$top_vendedores = [];
if ($is_admin) {
   $sql_vendedores = "SELECT u.nome, COUNT(p.id) as total_pedidos, SUM(p.valor_total) as valor_total
                      FROM pedidos p
                      INNER JOIN usuarios u ON p.usuario_id = u.id
                      GROUP BY p.usuario_id
                      ORDER BY total_pedidos DESC
                      LIMIT 5";
   $stmt_vendedores = $conn->prepare($sql_vendedores);
   $stmt_vendedores->execute();
   $result_vendedores = $stmt_vendedores->get_result();

   while ($row = $result_vendedores->fetch_assoc()) {
      $top_vendedores[] = $row;
   }
   $stmt_vendedores->close();
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
   <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet" />
   <link rel="icon" href="../image/logo.png" type="image/x-icon" />
   <link rel="stylesheet" href="../../styles/global.css" />
   <link rel="stylesheet" href="../../styles/navbar.css" />
   <link rel="stylesheet" href="../../styles/dashboard.css" />
   <title>Dashboard - Sistema de Pedidos</title>

</head>

<body>
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="container">
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="dashboard-container">
         <!-- Mensagem de boas-vindas -->
         <div class="dashboard-welcome">
            <h2>Olá, <?php echo $usuario_nome; ?>!</h2>
            <p>Bem-vindo ao painel de controle do sistema de pedidos.</p>
         </div>

         <!-- Alerta de pedidos pendentes (apenas para admin) -->
         <?php if ($is_admin && $pedidos_pendentes > 0): ?>
            <div class="alerta-pendentes">
               <h3><i class="bi bi-exclamation-triangle-fill"></i> Atenção!</h3>
               <p>Existem <strong><?php echo $pedidos_pendentes; ?> pedidos pendentes</strong> que precisam de aprovação.
                  <a href="listPed.php?status=Pendente">Visualizar pedidos pendentes</a>
               </p>
            </div>
         <?php endif; ?>

         <!-- Cards de estatísticas -->
         <div class="dashboard-cards">
            <!-- Total de pedidos -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-total">
                     <i class="bi bi-receipt"></i>
                  </div>
                  <p class="card-title">Total de Pedidos</p>
               </div>
               <h3 class="card-value"><?php echo $total_pedidos; ?></h3>
               <p class="card-subtitle"><?php echo $is_admin ? 'Todos os pedidos' : 'Seus pedidos'; ?></p>
            </div>

            <!-- Valor total -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-valor">
                     <i class="bi bi-currency-dollar"></i>
                  </div>
                  <p class="card-title">Valor Total</p>
               </div>
               <h3 class="card-value">R$ <?php echo number_format($valor_total, 2, ',', '.'); ?></h3>
               <p class="card-subtitle"><?php echo $is_admin ? 'Todos os pedidos' : 'Seus pedidos'; ?></p>
            </div>

            <!-- Pedidos pendentes -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-pendente">
                     <i class="bi bi-hourglass-split"></i>
                  </div>
                  <p class="card-title">Pendentes</p>
               </div>
               <h3 class="card-value"><?php echo $pedidos_pendentes; ?></h3>
               <p class="card-subtitle">Aguardando aprovação</p>
            </div>

            <!-- Pedidos aprovados -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-aprovado">
                     <i class="bi bi-check-circle"></i>
                  </div>
                  <p class="card-title">Aprovados</p>
               </div>
               <h3 class="card-value"><?php echo $pedidos_aprovados; ?></h3>
               <p class="card-subtitle">Pedidos aprovados</p>
            </div>

            <!-- Pedidos com alteração -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-alteracao">
                     <i class="bi bi-pencil-square"></i>
                  </div>
                  <p class="card-title">Com Alteração</p>
               </div>
               <h3 class="card-value"><?php echo $pedidos_alterados; ?></h3>
               <p class="card-subtitle">Aprovados com alteração</p>
            </div>

            <!-- Pedidos enviados -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-enviado">
                     <i class="bi bi-truck"></i>
                  </div>
                  <p class="card-title">Enviados</p>
               </div>
               <h3 class="card-value"><?php echo $pedidos_enviados; ?></h3>
               <p class="card-subtitle">Em transporte</p>
            </div>

            <!-- Pedidos pagos -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-pago">
                     <i class="bi bi-cash-coin"></i>
                  </div>
                  <p class="card-title">Pagos</p>
               </div>
               <h3 class="card-value"><?php echo $pedidos_pagos; ?></h3>
               <p class="card-subtitle">Pagamento completo</p>
            </div>

            <!-- Pedidos pagos parcialmente -->
            <div class="card">
               <div class="card-header">
                  <div class="card-icon bg-pago-parcial">
                     <i class="bi bi-credit-card"></i>
                  </div>
                  <p class="card-title">Pagos Parcial</p>
               </div>
               <h3 class="card-value"><?php echo $pedidos_pagos_parcial; ?></h3>
               <p class="card-subtitle">Pagamento parcial</p>
            </div>
         </div>

         <!-- Seção de tabelas -->
         <div class="dashboard-tables">
            <!-- Tabela de pedidos recentes -->
            <div class="table-container">
               <div class="table-header">
                  <h3 class="table-title">Pedidos Recentes</h3>
                  <a href="listPed.php" class="see-all">Ver todos</a>
               </div>
               <table class="dashboard-table">
                  <thead>
                     <tr>
                        <th>Nº</th>
                        <th>Cliente</th>
                        <?php if ($is_admin): ?><th>Vendedor</th><?php endif; ?>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     <?php if (empty($pedidos_recentes)): ?>
                        <tr>
                           <td colspan="<?php echo $is_admin ? 6 : 5; ?>" style="text-align: center;">Nenhum pedido encontrado</td>
                        </tr>
                     <?php else: ?>
                        <?php foreach ($pedidos_recentes as $pedido):
                           // Determinar classe de status
                           $status_class = '';
                           switch ($pedido['status']) {
                              case 'Pendente':
                                 $status_class = 'status-pendente';
                                 break;
                              case 'Aprovado':
                                 $status_class = 'status-aprovado';
                                 break;
                              case 'Aprovado com Alteração':
                                 $status_class = 'status-alteracao';
                                 break;
                              case 'Enviado':
                                 $status_class = 'status-enviado';
                                 break;
                              case 'Pago':
                                 $status_class = 'status-pago';
                                 break;
                              case 'Pago Parcial':
                                 $status_class = 'status-pago-parcial';
                                 break;
                              default:
                                 $status_class = 'status-pendente';
                           }

                           // Formatar data
                           $data_formatada = date('d/m/Y', strtotime($pedido['data_pedido']));

                           // Formatar valor
                           $valor_formatado = 'R$ ' . number_format($pedido['valor_total'], 2, ',', '.');
                        ?>
                           <tr onclick="window.location.href='createPed.php?id=<?php echo $pedido['id']; ?>'" style="cursor: pointer;">
                              <td>#<?php echo $pedido['id']; ?></td>
                              <td><?php echo $pedido['cliente_nome']; ?></td>
                              <?php if ($is_admin): ?><td><?php echo $pedido['vendedor_nome']; ?></td><?php endif; ?>
                              <td><?php echo $data_formatada; ?></td>
                              <td><?php echo $valor_formatado; ?></td>
                              <td><span class="status-badge <?php echo $status_class; ?>"><?php echo $pedido['status']; ?></span></td>
                           </tr>
                        <?php endforeach; ?>
                     <?php endif; ?>
                  </tbody>
               </table>
            </div>

            <?php if ($is_admin && !empty($top_vendedores)): ?>
               <!-- Tabela de vendedores (apenas para admin) -->
               <div class="table-container">
                  <div class="table-header">
                     <h3 class="table-title">Top Vendedores</h3>
                  </div>
                  <table class="dashboard-table">
                     <thead>
                        <tr>
                           <th>Vendedor</th>
                           <th>Pedidos</th>
                           <th>Valor Total</th>
                        </tr>
                     </thead>
                     <tbody>
                        <?php foreach ($top_vendedores as $vendedor):
                           $valor_formatado = 'R$ ' . number_format($vendedor['valor_total'], 2, ',', '.');
                        ?>
                           <tr>
                              <td><?php echo $vendedor['nome']; ?></td>
                              <td><?php echo $vendedor['total_pedidos']; ?></td>
                              <td><?php echo $valor_formatado; ?></td>
                           </tr>
                        <?php endforeach; ?>
                     </tbody>
                  </table>
               </div>
            <?php endif; ?>
         </div>
      </div>
   </div>

   <script>
      document.addEventListener('DOMContentLoaded', function() {
         // Adicionar funcionalidade de clique nas linhas da tabela
         document.querySelectorAll('.dashboard-table tbody tr').forEach(row => {
            row.addEventListener('click', function() {
               const pedidoId = this.querySelector('td:first-child').textContent.replace('#', '');
               if (pedidoId) {
                  window.location.href = `createPed.php?id=${pedidoId}`;
               }
            });
         });
      });
   </script>
</body>

</html>
<?php ob_end_flush(); ?>