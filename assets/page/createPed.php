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
   <link rel="stylesheet" href="../../styles/modal-custom.css" />
   <link rel="stylesheet" href="../../styles/pedido.css" />
   <title>Criar Pedido</title>
</head>

<body>
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="container">
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="pedido-container">
         <div class="pedido-content">
            <div class="split-layout">
               <!-- Formulário de Pedido (Lado Esquerdo) -->
               <div class="form-panel">
                  <form id="pedidoForm" class="pedido-form">
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
                                 autocomplete="off" />
                              <div id="cliente-results" class="search-results"></div>
                           </div>
                        </div>
                        <div id="cliente-info" class="cliente-info-container">
                           <div class="form-row">
                              <div class="form-group">
                                 <label for="cliente-nome">Nome</label>
                                 <input type="text" id="cliente-nome" disabled />
                                 <input type="hidden" id="cliente-id" />
                              </div>
                              <div class="form-group">
                                 <label for="cliente-cnpj">CNPJ</label>
                                 <input type="text" id="cliente-cnpj" disabled />
                              </div>
                           </div>

                           <div class="form-row">
                              <div class="form-group">
                                 <label for="cliente-telefone">Telefone</label>
                                 <input type="text" id="cliente-telefone" disabled />
                              </div>
                              <div class="form-group">
                                 <label for="cliente-cidade">Cidade/UF</label>
                                 <input type="text" id="cliente-cidade" disabled />
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
                              <input type="text" id="transportadora" name="transportadora" required />
                           </div>
                           <div class="form-group">
                              <label for="forma-pagamento">Forma de Pagamento*</label>
                              <input type="text" id="forma-pagamento" name="forma_pagamento" required />
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
                              <!-- <input type="hidden" id="vendedor-id" value="<?php echo $_SESSION['id']; ?>" /> -->
                           </div>
                        </div>

                        <div class="form-group">
                           <label for="observacoes">Observações</label>
                           <textarea id="observacoes" name="observacoes" rows="3" placeholder="Informações adicionais sobre o pedido"></textarea>
                        </div>
                     </section>

                     <div class="form-actions">
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

                  <div class="pedido-totais">
                     <div class="total-items">
                        <span>Itens:</span>
                        <span id="total-itens">0</span>
                     </div>
                     <div class="total-valor">
                        <span>Total:</span>
                        <span id="total-valor" class="valor-destaque">R$ 0,00</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Modal para adicionar produto -->
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

   <script src="./Js/pedido.js"></script>
   <script src="./Js/modal-custom.js"></script>
</body>

</html>
<?php ob_end_flush(); ?>