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

// Verificar se um ID foi passado para carregar os dados do pedido
$pedido_id = isset($_GET['id']) ? intval($_GET['id']) : null;
$pedido = null;
$itens_pedido = [];

if ($pedido_id) {
   // Consulta para obter dados básicos do pedido
   $sql_pedido = "SELECT p.*, c.razao_social as cliente_nome, c.id as cliente_id, 
   c.cpf_cnpj as cliente_cnpj, c.telefone as cliente_telefone,
   CONCAT(c.cidade, '/', c.estado) as cliente_cidade
FROM pedidos p
INNER JOIN clientes c ON p.cliente_id = c.id
WHERE p.id = ?";

   $stmt_pedido = $conn->prepare($sql_pedido);
   $stmt_pedido->bind_param("i", $pedido_id);
   $stmt_pedido->execute();
   $result_pedido = $stmt_pedido->get_result();

   if ($result_pedido->num_rows > 0) {
      $pedido = $result_pedido->fetch_assoc();

      // Verificar permissão - usuários normais só podem ver seus próprios pedidos
      if (!$is_admin && $pedido['usuario_id'] != $usuario_id) {
         // Redirecionar ou mostrar erro
         header("Location: listPed.php");
         exit();
      }

      // Buscar os itens do pedido
      $sql_itens = "SELECT ip.*, p.nome as produto_nome, p.codigo_barras as produto_codigo
                       FROM itens_pedido ip
                       INNER JOIN produtos p ON ip.produto_id = p.id
                       WHERE ip.pedido_id = ?";

      $stmt_itens = $conn->prepare($sql_itens);
      $stmt_itens->bind_param("i", $pedido_id);
      $stmt_itens->execute();
      $result_itens = $stmt_itens->get_result();

      while ($item = $result_itens->fetch_assoc()) {
         $itens_pedido[] = $item;
      }

      $stmt_itens->close();
   }
   $stmt_pedido->close();
}
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
   <link rel="stylesheet" href="../../styles/modal-custom.css" />
   <link rel="stylesheet" href="../../styles/pedido.css" />
   <title><?php echo $pedido_id ? 'Editar Pedido #' . $pedido_id : 'Criar Pedido'; ?></title>
   <style>
      /* Estilos para os campos de desconto */
      input:disabled {
         background-color: #f8fafc;
         color: #64748b;
         cursor: not-allowed;
      }

      .valor-desconto {
         color: #dc2626;
         font-weight: 500;
      }

      .valor-destaque-verde {
         color: #16a34a;
         font-weight: 600;
      }

      /* Estilos para os totais do pedido */
      .pedido-totais-detalhados {
         display: flex;
         flex-direction: column;
         gap: 8px;
         padding: 15px;
         background-color: #f8fafc;
         border-top: 1px solid #e2e8f0;
      }

      .total-row {
         display: flex;
         justify-content: space-between;
         align-items: center;
      }

      .total-label {
         font-size: 14px;
         color: #475569;
      }

      .total-valor-bruto {
         font-size: 15px;
         color: #24265d;
      }

      .total-valor-desconto {
         font-size: 15px;
         color: #dc2626;
      }

      .total-valor-liquido {
         font-size: 16px;
         font-weight: 600;
         color: #16a34a;
      }

      /* Estilo para o botão de exclusão (para administradores) */
      .btn-delete-pedido {
         background-color: #f87171;
         color: white;
         border: none;
         border-radius: 6px;
         padding: 8px 15px;
         font-size: 14px;
         font-weight: 500;
         cursor: pointer;
         margin-right: 10px;
      }

      .btn-delete-pedido:hover {
         background-color: #ef4444;
      }
   </style>
</head>

<body data-is-admin="<?php echo $is_admin ? 'true' : 'false'; ?>">
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="container">
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="pedido-container">
         <div class="pedido-content">
            <div class="split-layout">
               <!-- Formulário de Pedido (Lado Esquerdo) -->
               <div class="form-panel">
                  <form id="pedidoForm" class="pedido-form">
                     <?php if ($pedido_id): ?>
                        <input type="hidden" id="pedido-id" value="<?php echo $pedido_id; ?>" />
                     <?php endif; ?>

                     <section class="form-section">
                        <h3 class="form-title">Dados do Cliente</h3>
                        <div class="form-group">
                           <label for="cliente-search">Cliente (Nome ou CNPJ)*</label>
                           <div class="search-cliente">
                              <input
                                 type="text"
                                 id="cliente-search"
                                 placeholder="Digite o nome ou CNPJ do cliente"
                                 required
                                 autocomplete="off"
                                 value="<?php echo $pedido ? $pedido['cliente_nome'] : ''; ?>" />
                              <div id="cliente-results" class="search-results"></div>
                           </div>
                        </div>
                        <div id="cliente-info" class="cliente-info-container" <?php echo $pedido ? 'style="display: block;"' : ''; ?>>
                           <div class="form-row">
                              <div class="form-group">
                                 <label for="cliente-nome">Nome</label>
                                 <input type="text" id="cliente-nome" disabled value="<?php echo $pedido ? $pedido['cliente_nome'] : ''; ?>" />
                                 <input type="hidden" id="cliente-id" value="<?php echo $pedido ? $pedido['cliente_id'] : ''; ?>" />
                              </div>
                              <div class="form-group">
                                 <label for="cliente-cnpj">CNPJ</label>
                                 <input type="text" id="cliente-cnpj" disabled value="<?php echo $pedido ? $pedido['cliente_cnpj'] : ''; ?>" />
                              </div>
                           </div>

                           <div class="form-row">
                              <div class="form-group">
                                 <label for="cliente-telefone">Telefone</label>
                                 <input type="text" id="cliente-telefone" disabled value="<?php echo $pedido ? $pedido['cliente_telefone'] : ''; ?>" />
                              </div>
                              <div class="form-group">
                                 <label for="cliente-cidade">Cidade/UF</label>
                                 <input type="text" id="cliente-cidade" disabled value="<?php echo $pedido ? $pedido['cliente_cidade'] : ''; ?>" />
                              </div>
                           </div>

                           <div class="no-cliente-warning">
                              <p>Cliente não encontrado? <a href="cadastros.php" target="_blank">Cadastre um novo cliente</a></p>
                           </div>
                        </div>
                     </section>

                     <section class="form-section">
                        <h3 class="form-title">Informações do Pedido</h3>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="transportadora">Transportadora*</label>
                              <input type="text" id="transportadora" name="transportadora" required value="<?php echo $pedido ? $pedido['transportadora'] : ''; ?>" />
                           </div>
                           <div class="form-group">
                              <label for="forma-pagamento">Forma de Pagamento*</label>
                              <input type="text" id="forma-pagamento" name="forma_pagamento" required value="<?php echo $pedido ? $pedido['forma_pagamento'] : ''; ?>" />
                           </div>
                        </div>

                        <div class="form-row">
                           <div class="form-group">
                              <label for="vendedor">Vendedor</label>
                              <input
                                 type="text"
                                 id="vendedor"
                                 value="<?php echo isset($_SESSION['nome']) ? $_SESSION['nome'] : $_SESSION['usuario']; ?>"
                                 disabled />
                              <input type="hidden" id="vendedor-id" value="<?php echo $usuario_id; ?>" />
                           </div>
                           <?php if ($pedido): ?>
                              <div class="form-group">
                                 <label for="status-pedido">Status</label>
                                 <input type="text" id="status-pedido" value="<?php echo $pedido['status']; ?>" disabled />
                              </div>
                           <?php endif; ?>
                        </div>

                        <div class="form-group">
                           <label for="observacoes">Observações</label>
                           <textarea id="observacoes" name="observacoes" rows="3" placeholder="Informações adicionais sobre o pedido"><?php echo $pedido ? $pedido['observacoes'] : ''; ?></textarea>
                        </div>
                     </section>

                     <div class="form-actions">
                        <?php if ($pedido_id && $is_admin): ?>
                           <button type="button" id="btn-delete-pedido" class="btn-delete-pedido">
                              <i class="bi bi-trash"></i> Excluir Pedido
                           </button>
                        <?php endif; ?>
                        <button type="submit" class="btn-submit">
                           <i class="bi bi-check-lg"></i> Salvar Pedido
                        </button>
                     </div>
                  </form>
               </div>

               <!-- Tabela de Produtos (Lado Direito) -->
               <div class="produtos-panel">
                  <div class="produtos-header">
                     <h3>Produtos do Pedido</h3>
                     <div class="produtos-actions">
                        <div class="search-produto">
                           <input
                              type="text"
                              id="produto-search"
                              placeholder="Buscar produto..." />
                           <i class="bi bi-search"></i>
                           <div id="produto-results" class="search-results"></div>
                        </div>
                        <button id="add-produto" class="btn-add">
                           <i class="bi bi-plus-lg"></i> Adicionar Produto
                        </button>
                     </div>
                  </div>

                  <div class="produtos-container">
                     <table id="tabela-produtos" class="tabela-produtos">
                        <thead>
                           <tr>
                              <th>Código</th>
                              <th>Produto</th>
                              <th>Valor Unit.</th>
                              <th>Qtd.</th>
                              <th>Desconto</th>
                              <th>Subtotal</th>
                              <th>Ações</th>
                           </tr>
                        </thead>
                        <tbody id="produtos-lista">
                           <!-- Os produtos serão adicionados aqui pelo JavaScript -->
                        </tbody>
                     </table>

                     <div id="sem-produtos" class="sem-produtos">
                        <p>Nenhum produto adicionado ao pedido.</p>
                        <p>Use a busca acima para adicionar produtos.</p>
                     </div>
                  </div>

                  <div class="pedido-totais-detalhados">
                     <div class="total-row">
                        <div class="total-items">
                           <span>Itens:</span>
                           <span id="total-itens">0</span>
                        </div>
                     </div>
                     <div class="total-row">
                        <div class="total-label">Total Bruto:</div>
                        <div id="total-valor-bruto" class="total-valor-bruto">R$ 0,00</div>
                     </div>
                     <div class="total-row">
                        <div class="total-label">Total Descontos:</div>
                        <div id="total-valor-desconto" class="total-valor-desconto">R$ 0,00</div>
                     </div>
                     <div class="total-row">
                        <div class="total-label">Total Líquido:</div>
                        <div id="total-valor" class="total-valor-liquido">R$ 0,00</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Modal para adicionar produto (Simplificado) -->
   <div id="modal-produto" class="modal-overlay">
      <div class="modal-container">
         <div class="modal-header">
            <h3>Adicionar Produto</h3>
            <button class="btn-close-modal">
               <i class="bi bi-x-lg"></i>
            </button>
         </div>
         <div class="modal-content">
            <form id="form-add-produto">
               <div class="form-group">
                  <label for="modal-produto-id">Produto</label>
                  <select id="modal-produto-id" required>
                     <option value="">Selecione um produto</option>
                     <!-- Opções serão carregadas via JavaScript -->
                  </select>
               </div>
               <div class="form-row">
                  <div class="form-group">
                     <label for="modal-produto-valor">Valor Unitário (R$)</label>
                     <input type="number" id="modal-produto-valor" min="0" step="0.01" required />
                  </div>
                  <div class="form-group">
                     <label for="modal-produto-qtd">Quantidade</label>
                     <input type="number" id="modal-produto-qtd" min="1" value="1" required />
                  </div>
               </div>
               <div class="form-group">
                  <label for="modal-produto-desconto">Desconto (%)</label>
                  <input type="number" id="modal-produto-desconto" min="0" max="100" value="0" step="0.1" />
               </div>
               <div class="form-group">
                  <label for="modal-produto-subtotal">Subtotal (R$)</label>
                  <input type="text" id="modal-produto-subtotal" disabled />
               </div>
               <div class="form-actions">
                  <button type="button" class="btn-cancel btn-close-modal">Cancelar</button>
                  <button type="submit" class="btn-submit">Adicionar</button>
               </div>
            </form>
         </div>
      </div>
   </div>

   <!-- Modal para mobile quando necessário -->
   <div id="form-modal" class="modal-overlay">
      <div class="modal-container">
         <div class="modal-header">
            <h3 id="modal-title">Detalhes</h3>
            <button class="btn-close-modal">
               <i class="bi bi-x-lg"></i>
            </button>
         </div>
         <div class="modal-content" id="modal-content">
            <!-- Conteúdo será adicionado via JavaScript -->
         </div>
      </div>
   </div>

   <!-- Modal de confirmação de exclusão -->
   <div id="modal-confirmar-exclusao" class="modal-overlay">
      <div class="modal-container" style="max-width: 400px;">
         <div class="modal-header">
            <h3>Confirmar Exclusão</h3>
            <button class="btn-close-modal">
               <i class="bi bi-x-lg"></i>
            </button>
         </div>
         <div class="modal-content">
            <p>Tem certeza que deseja excluir este pedido?</p>
            <p>Esta ação não poderá ser desfeita.</p>
            <div class="form-actions" style="margin-top: 20px;">
               <button type="button" class="btn-cancel btn-close-modal">Cancelar</button>
               <button type="button" id="btn-confirmar-exclusao" class="btn-delete-pedido">Excluir</button>
            </div>
         </div>
      </div>
   </div>

   <script src="./Js/pedido.js"></script>
   <script src="./Js/modal-custom.js"></script>

   <?php if (!empty($itens_pedido)): ?>
      <script>
         document.addEventListener('DOMContentLoaded', function() {
            // Limpar a lista de produtos existente
            produtosPedido = [];

            // Carregar os produtos do pedido
            const produtosCarregados = <?php echo json_encode($itens_pedido); ?>;

            produtosCarregados.forEach(item => {
               // Calcular valores
               const subtotalBruto = parseFloat(item.preco_unitario) * parseInt(item.quantidade);
               const valorDesconto = parseFloat(item.valor_desconto);
               const subtotalLiquido = subtotalBruto - valorDesconto;

               // Adicionar produto ao array global
               produtosPedido.push({
                  id: item.produto_id,
                  codigo: item.produto_codigo || "Sem código",
                  nome: item.produto_nome,
                  valor: parseFloat(item.preco_unitario),
                  quantidade: parseInt(item.quantidade),
                  desconto: parseFloat(item.desconto_percentual),
                  valorDesconto: valorDesconto,
                  subtotalBruto: subtotalBruto,
                  subtotal: subtotalLiquido
               });
            });

            // Atualizar a tabela de produtos
            atualizarTabelaProdutos();
         });
      </script>
   <?php endif; ?>