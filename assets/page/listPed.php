<?php
session_start();
if (!isset($_SESSION['usuario'])) {
   header("Location: ../../index.php");
   exit();
}
ob_start();
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
   <link rel="stylesheet" href="../../styles/listPed.css" />
   <title>Lista de Pedidos</title>
</head>

<body>
   <div class="container">
      <?php include __DIR__ . '/config/navbar.php'; ?>
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="pedidos-container">
         <div class="header-actions">
            <div class="search-container">
               <div class="input-with-icon">
                  <input type="text" id="search-pedido" placeholder="Buscar pedido..." />
                  <button type="button" class="btn-icon">
                     <i class="bi bi-search"></i>
                  </button>
               </div>
            </div>
            <div class="filter-container">
               <select id="filter-status">
                  <option value="">Status do Pedido</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
               </select>
               <select id="filter-payment">
                  <option value="">Forma de Pagamento</option>
                  <option value="boleto">Boleto</option>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="transferencia">Transferência Bancária</option>
               </select>
               <button type="button" class="btn-add-pedido" onclick="window.location.href='createPed.php'">
                  <i class="bi bi-plus-circle"></i> Novo Pedido
               </button>
            </div>
         </div>

         <div class="pedidos-list-container">
            <div class="pedidos-table">
               <div class="table-header">
                  <div class="th-codigo">Código</div>
                  <div class="th-data">Data/Hora</div>
                  <div class="th-cliente">Cliente</div>
                  <div class="th-vendedor">Vendedor</div>
                  <div class="th-pagamento">Pagamento</div>
                  <div class="th-valor">Valor</div>
                  <div class="th-acoes">Ações</div>
               </div>

               <!-- Itens de exemplo, substituir pelo loop PHP posteriormente -->
               <div class="table-row">
                  <div class="td-codigo">#1001</div>
                  <div class="td-data">31/03/2025 10:30</div>
                  <div class="td-cliente">Empresa ABC Ltda</div>
                  <div class="td-vendedor">Carlos Silva</div>
                  <div class="td-pagamento">Boleto</div>
                  <div class="td-valor">R$ 2.500,00</div>
                  <div class="td-acoes">
                     <button class="btn-edit" onclick="editarPedido(1001)">
                        <i class="bi bi-pencil-square"></i>
                     </button>
                     <button class="btn-delete" onclick="confirmarExclusao(1001)">
                        <i class="bi bi-trash"></i>
                     </button>
                  </div>
               </div>

               <div class="table-row">
                  <div class="td-codigo">#1002</div>
                  <div class="td-data">30/03/2025 14:45</div>
                  <div class="td-cliente">Indústria XYZ S.A.</div>
                  <div class="td-vendedor">Ana Oliveira</div>
                  <div class="td-pagamento">PIX</div>
                  <div class="td-valor">R$ 4.750,00</div>
                  <div class="td-acoes">
                     <button class="btn-edit" onclick="editarPedido(1002)">
                        <i class="bi bi-pencil-square"></i>
                     </button>
                     <button class="btn-delete" onclick="confirmarExclusao(1002)">
                        <i class="bi bi-trash"></i>
                     </button>
                  </div>
               </div>

               <div class="table-row">
                  <div class="td-codigo">#1003</div>
                  <div class="td-data">29/03/2025 09:15</div>
                  <div class="td-cliente">Comércio Rápido Ltda</div>
                  <div class="td-vendedor">Roberto Almeida</div>
                  <div class="td-pagamento">Cartão de Crédito</div>
                  <div class="td-valor">R$ 1.875,50</div>
                  <div class="td-acoes">
                     <button class="btn-edit" onclick="editarPedido(1003)">
                        <i class="bi bi-pencil-square"></i>
                     </button>
                     <button class="btn-delete" onclick="confirmarExclusao(1003)">
                        <i class="bi bi-trash"></i>
                     </button>
                  </div>
               </div>

               <div class="table-row">
                  <div class="td-codigo">#1004</div>
                  <div class="td-data">28/03/2025 16:20</div>
                  <div class="td-cliente">Distribuidora Norte Sul</div>
                  <div class="td-vendedor">Fernanda Lima</div>
                  <div class="td-pagamento">Transferência Bancária</div>
                  <div class="td-valor">R$ 3.250,75</div>
                  <div class="td-acoes">
                     <button class="btn-edit" onclick="editarPedido(1004)">
                        <i class="bi bi-pencil-square"></i>
                     </button>
                     <button class="btn-delete" onclick="confirmarExclusao(1004)">
                        <i class="bi bi-trash"></i>
                     </button>
                  </div>
               </div>

               <div class="table-row">
                  <div class="td-codigo">#1005</div>
                  <div class="td-data">27/03/2025 11:05</div>
                  <div class="td-cliente">Lojas Everest</div>
                  <div class="td-vendedor">Paulo Santos</div>
                  <div class="td-pagamento">Boleto</div>
                  <div class="td-valor">R$ 5.800,00</div>
                  <div class="td-acoes">
                     <button class="btn-edit" onclick="editarPedido(1005)">
                        <i class="bi bi-pencil-square"></i>
                     </button>
                     <button class="btn-delete" onclick="confirmarExclusao(1005)">
                        <i class="bi bi-trash"></i>
                     </button>
                  </div>
               </div>
            </div>

            <div class="pagination">
               <button class="pag-btn active">1</button>
               <button class="pag-btn">2</button>
               <button class="pag-btn">3</button>
               <button class="pag-btn next">
                  <i class="bi bi-chevron-right"></i>
               </button>
            </div>
         </div>
      </div>
   </div>

   <!-- Modal de confirmação para exclusão -->
   <div id="modal-exclusao" class="modal">
      <div class="modal-content">
         <div class="modal-header">
            <h3>Confirmar Exclusão</h3>
            <button class="btn-close" onclick="fecharModal()">
               <i class="bi bi-x"></i>
            </button>
         </div>
         <div class="modal-body">
            <p>Tem certeza que deseja excluir o pedido <span id="pedido-exclusao"></span>?</p>
            <p class="warning-text">Esta ação não pode ser desfeita!</p>
         </div>
         <div class="modal-footer">
            <button class="btn-cancel" onclick="fecharModal()">Cancelar</button>
            <button class="btn-confirm-delete" onclick="excluirPedido()">Confirmar Exclusão</button>
         </div>
      </div>
   </div>

   <script src="./Js/listPed.js">
   </script>
</body>

</html>
<?php ob_end_flush(); ?>