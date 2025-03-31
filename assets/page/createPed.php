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
   <link rel="stylesheet" href="../../styles/createPed.css" />
   <title>Criar Pedido</title>
</head>

<body>
   <div class="container">
      <?php include __DIR__ . '/config/navbar.php'; ?>
      <?php include __DIR__ . '/config/page_header.php'; ?>

      <div class="pedido-container">
         <div class="pedido-column form-column">
            <div class="form-container">
               <form id="pedidoForm" class="pedido-form" method="post" action="processa_pedido.php">
                  <section class="form-section">
                     <h3 class="form-title">Dados do Cliente</h3>
                     <div class="form-group">
                        <label for="empresa">Razão social</label>
                        <input type="text" id="empresa" name="empresa" placeholder="Digite a razão social" />
                     </div>
                     <div class="form-row">
                        <div class="form-group">
                           <label for="cnpj">CPF/CNPJ</label>
                           <input type="text" id="cnpj" name="cnpj" placeholder="Digite o CPF/CNPJ" />
                        </div>
                        <div class="form-group">
                           <label for="ie">IE</label>
                           <input type="text" id="ie" name="ie" placeholder="Digite a Inscrição Estadual" />
                        </div>
                     </div>
                     <div class="form-row">
                        <div class="form-group cep-group">
                           <label for="cep">CEP</label>
                           <div class="input-with-icon">
                              <input type="text" id="cep" name="cep" class="input-small" placeholder="Digite o CEP" maxlength="9" />
                              <button type="button" id="buscar-cep" class="btn-icon">
                                 <i class="bi bi-search"></i>
                              </button>
                           </div>
                           <div id="cep-status" class="field-status"></div>
                        </div>
                     </div>
                     <div class="form-row">
                        <div class="form-group flex-grow-2">
                           <label for="rua">Rua</label>
                           <input type="text" id="rua" name="rua" placeholder="Nome da rua" />
                        </div>
                        <div class="form-group">
                           <label for="numero">Número</label>
                           <input type="text" id="numero" name="numero" placeholder="Nº" />
                        </div>
                     </div>
                     <div class="form-group">
                        <label for="bairro">Bairro</label>
                        <input type="text" id="bairro" name="bairro" placeholder="Bairro" />
                     </div>
                     <div class="form-row">
                        <div class="form-group">
                           <label for="complemento">Complemento</label>
                           <input type="text" id="complemento" name="complemento" placeholder="Apto, Sala, etc." />
                        </div>
                     </div>
                     <div class="form-row">
                        <div class="form-group">
                           <label for="cidade">Cidade</label>
                           <input type="text" id="cidade" name="cidade" placeholder="Digite a cidade" />
                        </div>
                        <div class="form-group">
                           <label for="estado">Estado</label>
                           <input type="text" id="estado" name="estado" placeholder="UF" maxlength="2" />
                        </div>
                     </div>
                  </section>
                  <section class="form-section">
                     <h3 class="form-title">Transportadora</h3>
                     <div class="form-group">
                        <label for="transportadora">Nome da transportadora</label>
                        <input type="text" id="transportadora" name="transportadora" placeholder="Digite o nome da transportadora" />
                     </div>
                  </section>
                  <section class="form-section">
                     <h3 class="form-title">Forma de Pagamento</h3>
                     <div class="form-group">
                        <label for="pagForm">Método de pagamento</label>
                        <select id="pagForm" name="pagForm">
                           <option value="" disabled selected>Selecione a forma de pagamento</option>
                           <option value="boleto">Boleto</option>
                           <option value="pix">PIX</option>
                           <option value="cartao">Cartão de Crédito</option>
                           <option value="transferencia">Transferência Bancária</option>
                        </select>
                     </div>
                  </section>
                  <section class="form-section">
                     <h3 class="form-title">Dados do Vendedor</h3>
                     <div class="form-row">
                        <div class="form-group">
                           <label for="representante">Representante</label>
                           <input type="text" id="representante" name="representante" placeholder="Nome do representante" />
                        </div>
                        <div class="form-group">
                           <label for="regiao">Região</label>
                           <input type="text" id="regiao" name="regiao" placeholder="Região de atuação" />
                        </div>
                     </div>
                  </section>

                  <div class="form-actions">
                     <button type="button" class="btn-cancel">Cancelar</button>
                     <button type="button" id="btnAvancar" class="btn-save">Avançar para Produtos</button>
                     <button type="submit" id="btnSalvar" class="btn-submit" style="display: none;">Salvar Pedido</button>
                  </div>
               </form>
            </div>
         </div>

         <div class="pedido-column products-column">
            <div class="products-container">
               <h3 class="form-title">Lista de Produtos</h3>
               <div class="products-placeholder">
                  <i class="bi bi-box-seam"></i>
                  <p>Preencha os dados do cliente para adicionar produtos</p>
               </div>
               <div id="produtos-area" class="produtos-area" style="display: none;">
                  <div class="produto-header">
                     <button type="button" id="addProduto" class="btn-add-produto">
                        <i class="bi bi-plus-circle"></i> Adicionar Produto
                     </button>
                  </div>
                  <div id="produtos-lista" class="produtos-lista">
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>

   <script src="./Js/createPed.js"></script>
</body>

</html>
<?php ob_end_flush(); ?>