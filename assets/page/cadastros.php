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
   <link rel="stylesheet" href="../../styles/cadastros.css">
   <title>Cadastros</title>

</head>

<body>
   <div class="container">
      <?php include __DIR__ . '/config/navbar.php'; ?>
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="cadastro-container">
         <div class="cadastro-content">
            <div class="tabs-container">
               <div class="tabs-nav">
                  <button class="tab-button active" data-tab="clientes">Cadastro de Clientes</button>
                  <button class="tab-button" data-tab="produtos">Cadastro de Produtos</button>
               </div>

               <!-- Tab de Cadastro de Clientes -->
               <div id="clientes-tab" class="tab-content active">
                  <div class="form-header">
                     <h2 class="form-title-main">Cadastro de Cliente</h2>
                     <div class="id-display">
                        <span class="id-label">ID:</span>
                        <span class="id-value">Automático</span>
                     </div>
                  </div>

                  <form id="clienteForm" class="pedido-form" method="post" action="processa_cliente.php">
                     <section class="form-section">
                        <h3 class="form-title">Dados da Empresa</h3>
                        <div class="form-group">
                           <label for="empresa">Razão social*</label>
                           <input type="text" id="empresa" name="empresa" placeholder="Digite a razão social" required />
                        </div>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="cnpj">CPF/CNPJ*</label>
                              <input type="text" id="cnpj" name="cnpj" placeholder="Digite o CPF/CNPJ" required />
                           </div>
                           <div class="form-group">
                              <label for="ie">IE</label>
                              <input type="text" id="ie" name="ie" placeholder="Digite a Inscrição Estadual" />
                           </div>
                        </div>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="email">E-mail</label>
                              <input type="email" id="email" name="email" placeholder="Digite o e-mail" />
                           </div>
                           <div class="form-group">
                              <label for="telefone">Telefone*</label>
                              <input type="text" id="telefone" name="telefone" placeholder="Digite o telefone" required />
                           </div>
                        </div>
                     </section>

                     <section class="form-section">
                        <h3 class="form-title">Endereço</h3>
                        <div class="form-row">
                           <div class="form-group cep-group">
                              <label for="cep">CEP*</label>
                              <div class="input-with-icon">
                                 <input type="text" id="cep" name="cep" class="input-small" placeholder="Digite o CEP" maxlength="9" required />
                                 <button type="button" id="buscar-cep" class="btn-icon">
                                    <i class="bi bi-search"></i>
                                 </button>
                              </div>
                              <div id="cep-status" class="field-status"></div>
                           </div>
                        </div>
                        <div class="form-row">
                           <div class="form-group flex-grow-2">
                              <label for="rua">Rua*</label>
                              <input type="text" id="rua" name="rua" placeholder="Nome da rua" required />
                           </div>
                           <div class="form-group">
                              <label for="numero">Número*</label>
                              <input type="text" id="numero" name="numero" placeholder="Nº" required />
                           </div>
                        </div>
                        <div class="form-group">
                           <label for="bairro">Bairro*</label>
                           <input type="text" id="bairro" name="bairro" placeholder="Bairro" required />
                        </div>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="complemento">Complemento</label>
                              <input type="text" id="complemento" name="complemento" placeholder="Apto, Sala, etc." />
                           </div>
                        </div>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="cidade">Cidade*</label>
                              <input type="text" id="cidade" name="cidade" placeholder="Digite a cidade" required />
                           </div>
                           <div class="form-group">
                              <label for="estado">Estado*</label>
                              <input type="text" id="estado" name="estado" placeholder="UF" maxlength="2" required />
                           </div>
                        </div>
                     </section>

                     <section class="form-section">
                        <h3 class="form-title">Informações Adicionais</h3>
                        <div class="form-group">
                           <label for="observacoes">Observações</label>
                           <textarea id="observacoes" name="observacoes" rows="3" placeholder="Informações adicionais sobre o cliente"></textarea>
                        </div>
                     </section>

                     <div id="status-cliente" class="status-message"></div>

                     <div class="form-actions">
                        <button type="button" class="btn-cancel">Limpar</button>
                        <button type="submit" class="btn-save">Salvar Cliente</button>
                     </div>
                  </form>
               </div>

               <!-- Tab de Cadastro de Produtos -->
               <div id="produtos-tab" class="tab-content">
                  <div class="form-header">
                     <h2 class="form-title-main">Cadastro de Produto</h2>
                     <div class="id-display">
                        <span class="id-label">ID:</span>
                        <span class="id-value">Automático</span>
                     </div>
                  </div>

                  <form id="produtoForm" class="pedido-form produto-form" method="post" action="processa_produto.php" enctype="multipart/form-data">
                     <section class="form-section">
                        <h3 class="form-title">Informações Básicas</h3>

                        <div class="upload-area">
                           <div class="produto-imagem-preview">
                              <i class="bi bi-image"></i>
                           </div>
                           <div class="upload-instructions">
                              <h4 class="upload-title">Imagem do Produto</h4>
                              <p class="upload-description">Carregue uma imagem do produto (opcional)</p>
                              <input type="file" id="produto-imagem" name="produto-imagem" style="display: none;" accept="image/*" />
                              <label for="produto-imagem" class="btn-upload">Escolher arquivo</label>
                           </div>
                        </div>

                        <div class="form-group">
                           <label for="nome-produto">Nome do Produto*</label>
                           <input type="text" id="nome-produto" name="nome-produto" placeholder="Digite o nome do produto" required />
                        </div>

                        <div class="form-row">
                           <div class="form-group">
                              <label for="codigo">Código/SKU*</label>
                              <input type="text" id="codigo" name="codigo" placeholder="Digite o código ou SKU" required />
                           </div>
                           <div class="form-group">
                              <label for="codigo-barras">Código de Barras</label>
                              <input type="text" id="codigo-barras" name="codigo-barras" placeholder="Digite o código de barras" />
                           </div>
                        </div>
                     </section>

                     <section class="form-section">
                        <h3 class="form-title">Preços e Estoque</h3>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="preco-custo">Preço de Custo (R$)*</label>
                              <input type="number" id="preco-custo" name="preco-custo" placeholder="0,00" step="0.01" min="0" required />
                           </div>
                           <div class="form-group">
                              <label for="preco-venda">Preço de Venda (R$)*</label>
                              <input type="number" id="preco-venda" name="preco-venda" placeholder="0,00" step="0.01" min="0" required />
                           </div>
                        </div>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="estoque">Estoque Atual*</label>
                              <input type="number" id="estoque" name="estoque" placeholder="0" min="0" required />
                           </div>
                           <div class="form-group">
                              <label for="estoque-minimo">Estoque Mínimo</label>
                              <input type="number" id="estoque-minimo" name="estoque-minimo" placeholder="0" min="0" />
                           </div>
                        </div>
                     </section>

                     <section class="form-section">
                        <h3 class="form-title">Categorização</h3>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="categoria">Categoria*</label>
                              <select id="categoria" name="categoria" required>
                                 <option value="" disabled selected>Selecione uma categoria</option>
                                 <option value="1">Eletrônicos</option>
                                 <option value="2">Móveis</option>
                                 <option value="3">Roupas</option>
                                 <option value="4">Acessórios</option>
                                 <option value="5">Outros</option>
                              </select>
                           </div>
                           <div class="form-group">
                              <label for="fornecedor">Fornecedor*</label>
                              <select id="fornecedor" name="fornecedor" required>
                                 <option value="" disabled selected>Selecione um fornecedor</option>
                                 <option value="1">Fornecedor A</option>
                                 <option value="2">Fornecedor B</option>
                                 <option value="3">Fornecedor C</option>
                              </select>
                           </div>
                        </div>
                     </section>

                     <section class="form-section">
                        <h3 class="form-title">Especificações do Produto</h3>
                        <div class="form-row">
                           <div class="form-group">
                              <label for="peso">Peso (kg)</label>
                              <input type="number" id="peso" name="peso" placeholder="0,00" step="0.01" min="0" />
                           </div>
                           <div class="form-group">
                              <label for="unidade">Unidade de Medida*</label>
                              <select id="unidade" name="unidade" required>
                                 <option value="" disabled selected>Selecione</option>
                                 <option value="un">Unidade (un)</option>
                                 <option value="kg">Quilograma (kg)</option>
                                 <option value="g">Grama (g)</option>
                                 <option value="l">Litro (l)</option>
                                 <option value="ml">Mililitro (ml)</option>
                                 <option value="m">Metro (m)</option>
                                 <option value="cm">Centímetro (cm)</option>
                              </select>
                           </div>
                        </div>
                        <div class="form-group">
                           <label for="descricao">Descrição do Produto</label>
                           <textarea id="descricao" name="descricao" rows="4" placeholder="Descreva o produto"></textarea>
                        </div>
                     </section>

                     <div id="status-produto" class="status-message"></div>

                     <div class="form-actions">
                        <button type="button" class="btn-cancel">Limpar</button>
                        <button type="submit" class="btn-save">Salvar Produto</button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   </div>

   <script src="./Js/cadastros.js"></script>
</body>

</html>
<?php ob_end_flush(); ?>