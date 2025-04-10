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
   <link rel="stylesheet" href="../../styles/cadastros.css" />
   <title>Cadastros</title>
</head>

<body>
   <?php include __DIR__ . '/config/navbar.php'; ?>
   <div class="container">

      <?php include __DIR__ . '/config/page_header.php'; ?>
      <div class="cadastro-container">
         <div class="cadastro-content">
            <div class="tabs-container">
               <div class="tabs-nav">
                  <button class="tab-button active" data-tab="clientes">
                     Cadastro de Clientes
                  </button>
                  <button class="tab-button" data-tab="produtos">
                     Cadastro de Produtos
                  </button>
               </div>

               <!-- Tab de Cadastro de Clientes -->
               <div id="clientes-tab" class="tab-content active">
                  <div class="split-layout">
                     <!-- Lista de Clientes (Lado Esquerdo) -->
                     <div class="list-panel">
                        <div class="list-header">
                           <h3>Lista de Clientes</h3>
                           <button class="btn-add" id="add-cliente">
                              <i class="bi bi-plus-lg"></i> Novo Cliente
                           </button>
                        </div>
                        <div class="search-bar">
                           <input
                              type="text"
                              placeholder="Buscar cliente..."
                              id="busca-cliente" />
                           <i class="bi bi-search"></i>
                        </div>
                        <div class="list-content" id="lista-clientes">
                           <!-- Clientes serão adicionados dinamicamente pelo JS -->
                           <div class="list-item cliente-item" data-id="1">
                              <div class="list-item-content">
                                 <h4>Empresa ABC Ltda</h4>
                                 <p>(11) 3456-7890</p>
                              </div>
                           </div>
                           <div class="list-item cliente-item" data-id="2">
                              <div class="list-item-content">
                                 <h4>Tech Solutions S.A.</h4>
                                 <p>(21) 98765-4321</p>
                              </div>
                           </div>
                           <!-- Exemplo de itens da lista - remova em produção -->
                        </div>
                     </div>

                     <!-- Formulário de Cliente (Lado Direito) -->
                     <div class="form-panel" id="form-cliente-panel">
                        <div class="form-header">
                           <h2 class="form-title-main">
                              Cadastro de Cliente
                           </h2>
                           <div class="id-display">
                              <span class="id-label">ID:</span>
                              <span class="id-value" id="cliente-id">Automático</span>
                           </div>
                        </div>

                        <form
                           id="clienteForm"
                           class="pedido-form"
                           method="post"
                           action="processa_cliente.php">
                           <section class="form-section">
                              <h3 class="form-title">Dados da Empresa</h3>
                              <div class="form-group">
                                 <label for="empresa">Razão social*</label>
                                 <input
                                    type="text"
                                    id="empresa"
                                    name="empresa"
                                    placeholder="Digite a razão social"
                                    required />
                              </div>
                              <div class="form-row">
                                 <div class="form-group">
                                    <label for="cnpj">CPF/CNPJ*</label>
                                    <input
                                       type="text"
                                       id="cnpj"
                                       name="cnpj"
                                       placeholder="Digite o CPF/CNPJ"
                                       required />
                                 </div>
                                 <div class="form-group">
                                    <label for="ie">IE</label>
                                    <input
                                       type="text"
                                       id="ie"
                                       name="ie"
                                       placeholder="Digite a Inscrição Estadual" />
                                 </div>
                              </div>
                              <div class="form-row">
                                 <div class="form-group">
                                    <label for="email">E-mail</label>
                                    <input
                                       type="email"
                                       id="email"
                                       name="email"
                                       placeholder="Digite o e-mail" />
                                 </div>
                                 <div class="form-group">
                                    <label for="telefone">Telefone*</label>
                                    <input
                                       type="text"
                                       id="telefone"
                                       name="telefone"
                                       placeholder="Digite o telefone"
                                       required />
                                 </div>
                              </div>
                           </section>

                           <section class="form-section">
                              <h3 class="form-title">Endereço</h3>
                              <div class="form-row">
                                 <div class="form-group cep-group">
                                    <label for="cep">CEP*</label>
                                    <div class="input-with-icon">
                                       <input
                                          type="text"
                                          id="cep"
                                          name="cep"
                                          class="input-small"
                                          placeholder="Digite o CEP"
                                          maxlength="9"
                                          required />
                                       <button
                                          type="button"
                                          id="buscar-cep"
                                          class="btn-icon">
                                          <i class="bi bi-search"></i>
                                       </button>
                                    </div>
                                    <div
                                       id="cep-status"
                                       class="field-status"></div>
                                 </div>
                              </div>
                              <div class="form-row">
                                 <div class="form-group flex-grow-2">
                                    <label for="rua">Rua*</label>
                                    <input
                                       type="text"
                                       id="rua"
                                       name="rua"
                                       placeholder="Nome da rua"
                                       required />
                                 </div>
                                 <div class="form-group">
                                    <label for="numero">Número*</label>
                                    <input
                                       type="text"
                                       id="numero"
                                       name="numero"
                                       placeholder="Nº"
                                       required />
                                 </div>
                              </div>
                              <div class="form-group">
                                 <label for="bairro">Bairro*</label>
                                 <input
                                    type="text"
                                    id="bairro"
                                    name="bairro"
                                    placeholder="Bairro"
                                    required />
                              </div>
                              <div class="form-row">
                                 <div class="form-group">
                                    <label for="complemento">Complemento</label>
                                    <input
                                       type="text"
                                       id="complemento"
                                       name="complemento"
                                       placeholder="Apto, Sala, etc." />
                                 </div>
                              </div>
                              <div class="form-row">
                                 <div class="form-group">
                                    <label for="cidade">Cidade*</label>
                                    <input
                                       type="text"
                                       id="cidade"
                                       name="cidade"
                                       placeholder="Digite a cidade"
                                       required />
                                 </div>
                                 <div class="form-group">
                                    <label for="estado">Estado*</label>
                                    <input
                                       type="text"
                                       id="estado"
                                       name="estado"
                                       placeholder="UF"
                                       maxlength="2"
                                       required />
                                 </div>
                              </div>
                           </section>

                           <section class="form-section">
                              <h3 class="form-title">
                                 Informações Adicionais
                              </h3>
                              <div class="form-group">
                                 <label for="observacoes">Observações</label>
                                 <textarea
                                    id="observacoes"
                                    name="observacoes"
                                    rows="3"
                                    placeholder="Informações adicionais sobre o cliente"></textarea>
                              </div>
                           </section>

                           <div
                              id="status-cliente"
                              class="status-message"></div>

                           <div class="form-actions">
                              <button type="button" class="btn-cancel">
                                 Limpar
                              </button>
                              <button type="submit" class="btn-save">
                                 Salvar Cliente
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>

               <!-- Tab de Cadastro de Produtos -->
               <div id="produtos-tab" class="tab-content">
                  <div class="split-layout">
                     <!-- Lista de Produtos (Lado Esquerdo) -->
                     <div class="list-panel">
                        <div class="list-header">
                           <h3>Lista de Produtos</h3>
                           <button class="btn-add" id="add-produto">
                              <i class="bi bi-plus-lg"></i> Novo Produto
                           </button>
                        </div>
                        <div class="search-bar">
                           <input
                              type="text"
                              placeholder="Buscar produto..."
                              id="busca-produto" />
                           <i class="bi bi-search"></i>
                        </div>
                        <div class="list-content" id="lista-produtos">
                           <!-- Produtos serão adicionados dinamicamente pelo JS -->
                           <div class="list-item produto-item" data-id="1">
                              <div class="list-item-content">
                                 <h4>Monitor 24"</h4>
                                 <p>R$ 999,00</p>
                              </div>
                           </div>
                           <div class="list-item produto-item" data-id="2">
                              <div class="list-item-content">
                                 <h4>Teclado sem fio</h4>
                                 <p>R$ 189,90</p>
                              </div>
                           </div>
                           <!-- Exemplo de itens da lista - remova em produção -->
                        </div>
                     </div>

                     <!-- Formulário de Produto (Lado Direito) -->
                     <div class="form-panel" id="form-produto-panel">
                        <div class="form-header">
                           <h2 class="form-title-main">
                              Cadastro de Produto
                           </h2>
                           <div class="id-display">
                              <span class="id-label">ID:</span>
                              <span class="id-value" id="produto-id">Automático</span>
                           </div>
                        </div>

                        <form
                           id="produtoForm"
                           class="pedido-form produto-form"
                           method="post"
                           action="processa_produto.php"
                           enctype="multipart/form-data">
                           <section class="form-section">
                              <h3 class="form-title">Informações</h3>
                              <div class="form-group">
                                 <label for="codigo-barras">Código do Produto</label>
                                 <input
                                    type="text"
                                    id="codigo-barras"
                                    name="codigo-barras"
                                    placeholder="Digite o código do Produto" />
                              </div>
                              <div class="form-group">
                                 <label for="nome-produto">Nome do Produto*</label>
                                 <input
                                    type="text"
                                    id="nome-produto"
                                    name="nome-produto"
                                    placeholder="Digite o nome do produto"
                                    required />
                              </div>
                              <div class="form-group">
                                 <label for="unidade">Unidade de Medida*</label>
                                 <input type="text"
                                    id="unidade"
                                    name="unidade"
                                    placeholder=" EX: 5 Kg"
                                    required />
                              </div>
                              <div class="form-group">
                                 <label for="preco-venda">Preço de Venda (R$)*</label>
                                 <input
                                    type="number"
                                    id="preco-venda"
                                    name="preco-venda"
                                    placeholder="0,00"
                                    step="0.01"
                                    min="0"
                                    required />
                              </div>
                           </section>

                           <div
                              id="status-produto"
                              class="status-message"></div>

                           <div class="form-actions">
                              <button type="button" class="btn-cancel">
                                 Limpar
                              </button>
                              <button type="submit" class="btn-save">
                                 Salvar Produto
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Modal para Mobile -->
   <div class="modal-overlay" id="form-modal">
      <div class="modal-container">
         <div class="modal-header">
            <h3 id="modal-title">Detalhes</h3>
            <button class="btn-close-modal">
               <i class="bi bi-x-lg"></i>
            </button>
         </div>
         <div class="modal-content" id="modal-content">
            <!-- O formulário será clonado aqui pelo JavaScript -->
         </div>
      </div>
   </div>
   <script src="./Js/cadastro.js"></script>
</body>

</html>
<?php ob_end_flush(); ?>