<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}
ob_start();

include_once 'config/config.php';

$is_admin = false;
$usuario_logado = $_SESSION['usuario'];
$usuario_id = null;

$sql_user = "SELECT id, admin FROM usuarios WHERE usuario = ?";
$stmt_user = $conn->prepare($sql_user);
$stmt_user->bind_param("s", $usuario_logado);
$stmt_user->execute();
$result_user = $stmt_user->get_result();

if ($result_user->num_rows > 0) {
   $user_data = $result_user->fetch_assoc();
   $is_admin = $user_data['admin'] == 1;
   $usuario_id = $user_data['id'];
}
$stmt_user->close();
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet" />
   <link
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
      rel="stylesheet" />
   <link rel="icon" href="../image/logo.png" type="image/x-icon" />
   <link rel="stylesheet" href="../../styles/global.css" />
   <link rel="stylesheet" href="../../styles/navbar.css" />
   <link rel="stylesheet" href="../../styles/pedido.css" />
   <link rel="stylesheet" href="../../styles/listaPedidos.css" />
   <title>Lista de Pedidos</title>
   <style>
      .btn-pdf {
         background-color: #f97316;
         color: white;
         border: none;
         border-radius: 4px;
         width: 32px;
         height: 32px;
         display: inline-flex;
         justify-content: center;
         align-items: center;
         margin-right: 5px;
         cursor: pointer;
         transition: background-color 0.2s;
      }

      .btn-pdf:hover {
         background-color: #ea580c;
      }
   </style>
</head>

<body data-is-admin="<?php echo $is_admin ? 'true' : 'false'; ?>">
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="container">
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="pedidos-container">
         <div class="pedidos-header">
            <h2 class="pedidos-title">Lista de Pedidos</h2>
            <a href="createPed.php" class="btn-add">
               <i class="bi bi-plus-lg"></i> Novo Pedido
            </a>
         </div>

         <div class="pedidos-filtros">
            <div class="filtro-grupo">
               <label class="filtro-label" for="filtro-pedido">Nº Pedido</label>
               <input type="text" id="filtro-pedido" class="filtro-input" placeholder="Número do pedido">
            </div>
            <div class="filtro-grupo">
               <label class="filtro-label" for="filtro-cliente">Cliente</label>
               <input type="text" id="filtro-cliente" class="filtro-input" placeholder="Nome do cliente">
            </div>
            <?php if ($is_admin): ?>
               <div class="filtro-grupo">
                  <label class="filtro-label" for="filtro-vendedor">Vendedor</label>
                  <input type="text" id="filtro-vendedor" class="filtro-input" placeholder="Nome do vendedor">
               </div>
            <?php endif; ?>
            <div class="filtro-grupo">
               <label class="filtro-label" for="filtro-status">Status</label>
               <select id="filtro-status" class="filtro-input">
                  <option value="">Todos</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Aprovado com Alteração">Aprovado com Alteração</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Pago">Pago</option>
                  <option value="Pago Parcial">Pago Parcial</option>
               </select>
            </div>
            <div class="filtro-grupo">
               <label class="filtro-label" for="filtro-data-inicio">Data Início</label>
               <input type="date" id="filtro-data-inicio" class="filtro-input filtro-data">
            </div>
            <div class="filtro-grupo">
               <label class="filtro-label" for="filtro-data-fim">Data Fim</label>
               <input type="date" id="filtro-data-fim" class="filtro-input filtro-data">
            </div>
            <button id="btn-filtrar" class="btn-filtrar">
               <i class="bi bi-search"></i> Filtrar
            </button>
         </div>

         <div class="tabela-responsive">
            <table class="tabela-pedidos" id="tabela-pedidos">
               <thead>
                  <tr>
                     <th>Nº Pedido</th>
                     <th>Cliente</th>
                     <th>Vendedor</th>
                     <th>Forma Pagamento</th>
                     <th>Valor Líquido</th>
                     <th>Data</th>
                     <th>Status</th>
                     <th>Ações</th>
                  </tr>
               </thead>
               <tbody id="lista-pedidos">
                  <?php
                  $sql_pedidos = "SELECT p.id, p.cliente_id, p.usuario_id, p.forma_pagamento, 
                                    p.valor_total, p.data_pedido, p.status,
                                    c.razao_social as cliente_nome,
                                    u.nome as vendedor_nome
                                FROM pedidos p
                                INNER JOIN clientes c ON p.cliente_id = c.id
                                INNER JOIN usuarios u ON p.usuario_id = u.id";

                  if (!$is_admin) {
                     $sql_pedidos .= " WHERE p.usuario_id = ?";
                  }

                  $sql_pedidos .= " ORDER BY p.data_pedido DESC LIMIT 50";

                  $stmt_pedidos = $conn->prepare($sql_pedidos);

                  if (!$is_admin) {
                     $stmt_pedidos->bind_param("i", $usuario_id);
                  }

                  $stmt_pedidos->execute();
                  $result_pedidos = $stmt_pedidos->get_result();

                  if ($result_pedidos->num_rows > 0) {
                     while ($pedido = $result_pedidos->fetch_assoc()) {
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

                        $data_formatada = date('d/m/Y', strtotime($pedido['data_pedido']));

                        $valor_formatado = 'R$ ' . number_format($pedido['valor_total'], 2, ',', '.');

                        echo "<tr data-id='{$pedido['id']}'>";
                        echo "<td>{$pedido['id']}</td>";
                        echo "<td>{$pedido['cliente_nome']}</td>";
                        echo "<td>{$pedido['vendedor_nome']}</td>";
                        echo "<td>{$pedido['forma_pagamento']}</td>";
                        echo "<td>{$valor_formatado}</td>";
                        echo "<td>{$data_formatada}</td>";
                        if ($is_admin) {
                           echo "<td>";
                           echo "<div class='status-dropdown' data-pedido-id='{$pedido['id']}'>";
                           echo "<span class='status-badge {$status_class}'>{$pedido['status']}</span>";
                           echo "<div class='status-options' id='status-options-{$pedido['id']}'>";
                           echo "<div class='status-option' data-status='Pendente'>Pendente</div>";
                           echo "<div class='status-option' data-status='Aprovado'>Aprovado</div>";
                           echo "<div class='status-option' data-status='Aprovado com Alteração'>Aprovado com Alteração</div>";
                           echo "<div class='status-option' data-status='Enviado'>Enviado</div>";
                           echo "<div class='status-option' data-status='Pago'>Pago</div>";
                           echo "<div class='status-option' data-status='Pago Parcial'>Pago Parcial</div>";
                           echo "</div>";
                           echo "</div>";
                           echo "</td>";
                           echo "<td class='actions-column'>";
                           echo "<a href='gerarPDF.php?id={$pedido['id']}' class='btn-pdf' title='Gerar PDF' target='_blank'>";
                           echo "<i class='bi bi-file-earmark-pdf'></i>";
                           echo "</a>";
                           echo "<button class='btn-delete' data-id='{$pedido['id']}'>";
                           echo "<i class='bi bi-trash'></i>";
                           echo "</button>";
                           echo "</td>";
                        } else {
                           echo "<td><span class='status-badge {$status_class}'>{$pedido['status']}</span></td>";
                           echo "<td class='actions-column'>";
                           echo "<a href='gerarPDF.php?id={$pedido['id']}' class='btn-pdf' title='Gerar PDF' target='_blank'>";
                           echo "<i class='bi bi-file-earmark-pdf'></i>";
                           echo "</a>";
                           echo "</td>";
                        }

                        echo "</tr>";
                     }
                  } else {
                     echo "<tr><td colspan='8' class='sem-pedidos'>Nenhum pedido encontrado</td></tr>";
                  }

                  $stmt_pedidos->close();
                  ?>
               </tbody>
            </table>
         </div>
         <div class="pagination" id="pagination">
         </div>
      </div>
   </div>

   <div id="modal-aviso" class="modal-overlay">
      <div class="modal-container">
         <div class="modal-header">
            <h3 id="modal-titulo">Aviso</h3>
            <button class="btn-close-modal">
               <i class="bi bi-x-lg"></i>
            </button>
         </div>
         <div class="modal-content" id="modal-conteudo">
         </div>
         <div class="modal-footer">
            <button class="btn-cancel btn-close-modal">Fechar</button>
         </div>
      </div>
   </div>

   <script src="Js/modal-custom.js"></script>
   <script src="Js/listaPedidos.js"></script>

   <script>
      document.addEventListener('DOMContentLoaded', function() {
         const filtroStatus = localStorage.getItem('filtro_status');
         if (filtroStatus) {
            const selectStatus = document.getElementById('filtro-status');
            if (selectStatus) {
               selectStatus.value = filtroStatus;

               setTimeout(function() {
                  document.getElementById('btn-filtrar').click();
               }, 100);

               localStorage.removeItem('filtro_status');
            }
         }

         const urlParams = new URLSearchParams(window.location.search);
         const statusParam = urlParams.get('status');
         if (statusParam) {
            const selectStatus = document.getElementById('filtro-status');
            if (selectStatus) {
               selectStatus.value = statusParam;

               setTimeout(function() {
                  document.getElementById('btn-filtrar').click();
               }, 100);
            }
         }
      });
   </script>
</body>

</html>
<?php ob_end_flush(); ?>