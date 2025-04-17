// Array para armazenar os produtos do pedido
let produtosPedido = [];
let clienteSelecionado = null;
let produtosDisponiveis = [];

// Elementos DOM
const clienteSearch = document.getElementById("cliente-search");
const clienteResults = document.getElementById("cliente-results");
const produtoSearch = document.getElementById("produto-search");
const produtoResults = document.getElementById("produto-results");
const produtosLista = document.getElementById("produtos-lista");
const semProdutosDiv = document.getElementById("sem-produtos");
const modalProduto = document.getElementById("modal-produto");
const formAddProduto = document.getElementById("form-add-produto");
const modalProdutoId = document.getElementById("modal-produto-id");
const modalProdutoValor = document.getElementById("modal-produto-valor");
const modalProdutoQtd = document.getElementById("modal-produto-qtd");
const modalProdutoDesconto = document.getElementById("modal-produto-desconto");
const modalProdutoSubtotal = document.getElementById("modal-produto-subtotal");
const pedidoForm = document.getElementById("pedidoForm");

function encontrarProdutoPorId(produtoId) {
   return produtosDisponiveis.find((p) => p.id === produtoId);
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
   // Carregar produtos disponíveis
   carregarProdutos();

   // Setup de event listeners
   setupEventListeners();

   // Inicializar state da UI
   atualizarTabelaProdutos();
});

// Função auxiliar para converter string para número
function parseNumero(valor) {
   if (valor === null || valor === undefined || valor === "") return 0;

   // Verifica se já é um número
   if (typeof valor === "number") return valor;

   // Remove tudo que não é número, ponto ou vírgula
   const numeroLimpo = valor.toString().replace(/[^\d.,]/g, "");

   // Se estiver vazio após limpeza
   if (numeroLimpo === "") return 0;

   // Substitui vírgula por ponto para garantir formato numérico válido
   const numeroFinal = parseFloat(numeroLimpo.replace(",", "."));

   return isNaN(numeroFinal) ? 0 : numeroFinal;
}

// Carregar produtos disponíveis
function carregarProdutos() {
   fetch("get_produtos.php")
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao carregar produtos");
         }
         return response.json();
      })
      .then((produtos) => {
         // Garantir que os produtos estão no formato esperado
         produtosDisponiveis = produtos.map((produto) => ({
            id: produto.id,
            codigo_barras: produto.codigo_barras || "",
            nome: produto.nome,
            preco_venda: produto.preco_venda,
            unidade: produto.unidade || "",
         }));

         // Preencher o select de produtos no modal
         popularSelectProdutos();
      })
      .catch((error) => {
         console.error("Erro ao carregar produtos:", error);
         customModal.error(
            "Erro ao carregar lista de produtos. Verifique a conexão com o banco de dados."
         );
      });
}

// Preencher o select de produtos no modal
function popularSelectProdutos() {
   modalProdutoId.innerHTML = '<option value="">Selecione um produto</option>';

   produtosDisponiveis.forEach((produto) => {
      const option = document.createElement("option");
      option.value = produto.id;
      option.textContent = `${
         produto.codigo_barras ? produto.codigo_barras + " - " : ""
      }${produto.nome}`;
      option.setAttribute("data-preco", produto.preco_venda);
      modalProdutoId.appendChild(option);
   });
}

// Setup de todos os event listeners
function setupEventListeners() {
   // Busca de clientes
   clienteSearch.addEventListener("input", function () {
      const termo = this.value.trim();

      if (termo.length < 2) {
         clienteResults.innerHTML = "";
         clienteResults.classList.remove("active");
         return;
      }

      buscarClientes(termo);
   });

   // Busca de produtos
   produtoSearch.addEventListener("input", function () {
      const termo = this.value.trim();

      if (termo.length < 2) {
         produtoResults.innerHTML = "";
         produtoResults.classList.remove("active");
         return;
      }

      filtrarProdutos(termo);
   });

   // Botão adicionar produto
   document
      .getElementById("add-produto")
      .addEventListener("click", function () {
         abrirModalProduto();
      });

   // Modal produto - select de produto
   modalProdutoId.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption.value) {
         const preco = selectedOption.getAttribute("data-preco");
         modalProdutoValor.value = preco;
         atualizarCalculosModal();
      } else {
         modalProdutoValor.value = "";
         modalProdutoSubtotal.value = "";
      }
   });

   // Modal produto - input de quantidade, valor e desconto
   modalProdutoQtd.addEventListener("input", atualizarCalculosModal);
   modalProdutoValor.addEventListener("input", atualizarCalculosModal);
   modalProdutoDesconto.addEventListener("input", atualizarCalculosModal);

   // Form de adicionar produto
   formAddProduto.addEventListener("submit", function (e) {
      e.preventDefault();
      adicionarProdutoAoPedido();
   });

   // Fechar modais
   document.querySelectorAll(".btn-close-modal").forEach((btn) => {
      btn.addEventListener("click", function () {
         document.querySelectorAll(".modal-overlay").forEach((modal) => {
            modal.classList.remove("active");
         });
      });
   });

   // Form do pedido
   pedidoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      salvarPedido();
   });
}

// Função para atualizar os cálculos no modal
function atualizarCalculosModal() {
   try {
      const valor = parseNumero(modalProdutoValor.value);
      const quantidade = parseInt(modalProdutoQtd.value) || 0;
      const desconto = parseNumero(modalProdutoDesconto.value);

      // Verificar se os valores são válidos
      if (isNaN(valor) || valor <= 0) {
         modalProdutoSubtotal.value = "R$ 0,00";
         return;
      }

      // Calcular subtotal bruto (sem desconto)
      const subtotalBruto = valor * quantidade;

      // Calcular valor do desconto
      const valorDesconto = subtotalBruto * (desconto / 100);

      // Calcular subtotal líquido (com desconto)
      const subtotalLiquido = subtotalBruto - valorDesconto;

      // Atualizar apenas o campo de subtotal
      modalProdutoSubtotal.value = subtotalLiquido.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });
   } catch (error) {
      console.error("Erro ao calcular valores:", error);
      modalProdutoSubtotal.value = "R$ 0,00";
   }
}

// Função para buscar clientes pelo nome ou CNPJ
function buscarClientes(termo) {
   // Verificar se é um termo numérico (possível CNPJ)
   const apenasNumeros = /^\d+$/.test(termo);

   // Usar SQL LIKE para pesquisar
   let sql;
   if (apenasNumeros) {
      sql = `SELECT id, razao_social, cpf_cnpj, telefone, cidade, estado FROM clientes WHERE cpf_cnpj LIKE '%${termo}%' ORDER BY razao_social LIMIT 10`;
   } else {
      sql = `SELECT id, razao_social, cpf_cnpj, telefone, cidade, estado FROM clientes WHERE razao_social LIKE '%${termo}%' ORDER BY razao_social LIMIT 10`;
   }

   // Codificar a consulta SQL para a URL
   const sqlEncoded = encodeURIComponent(sql);
   const url = `executar_sql.php?sql=${sqlEncoded}`;

   fetch(url)
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao buscar clientes");
         }
         return response.json();
      })
      .then((result) => {
         if (result.status === "success") {
            mostrarResultadosClientes(result.data);
         } else {
            throw new Error("Erro na busca de clientes: " + result.message);
         }
      })
      .catch((error) => {
         console.error("Erro ao buscar clientes:", error);
         clienteResults.innerHTML =
            '<div class="search-result-item"><p>Erro ao buscar clientes</p></div>';
         clienteResults.classList.add("active");
      });
}

// Exibir resultados da busca de clientes
function mostrarResultadosClientes(clientes) {
   clienteResults.innerHTML = "";

   if (clientes.length === 0) {
      clienteResults.innerHTML = `
            <div class="search-result-item">
                <p>Nenhum cliente encontrado</p>
                <p><a href="cadastros.php">Cadastrar novo cliente</a></p>
            </div>
        `;
      clienteResults.classList.add("active");
      return;
   }

   clientes.forEach((cliente) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
            <p class="item-title">${cliente.razao_social}</p>
            <p class="item-subtitle">CNPJ: ${cliente.cpf_cnpj}</p>
        `;

      item.addEventListener("click", function () {
         selecionarCliente(cliente);
         produtoSearch.value = "";
         clienteResults.innerHTML = "";
         clienteResults.classList.remove("active");
      });

      clienteResults.appendChild(item);
   });

   clienteResults.classList.add("active");
}

// Selecionar um cliente
function selecionarCliente(cliente) {
   clienteSelecionado = cliente;

   // Preencher os campos
   clienteSearch.value = cliente.razao_social;
   document.getElementById("cliente-id").value = cliente.id;
   document.getElementById("cliente-nome").value = cliente.razao_social;
   document.getElementById("cliente-cnpj").value = cliente.cpf_cnpj;
   document.getElementById("cliente-telefone").value =
      cliente.telefone || "Não informado";
   document.getElementById("cliente-cidade").value = cliente.cidade
      ? `${cliente.cidade}/${cliente.estado}`
      : "Não informado";

   // Ocultar resultados de pesquisa
   clienteResults.innerHTML = "";
   clienteResults.classList.remove("active");
}

// Filtrar produtos para adicionar ao pedido
function filtrarProdutos(termo) {
   const resultados = produtosDisponiveis.filter((produto) => {
      // Buscar por código de barras, nome ou ID
      return (
         (produto.codigo_barras &&
            produto.codigo_barras
               .toLowerCase()
               .includes(termo.toLowerCase())) ||
         produto.nome.toLowerCase().includes(termo.toLowerCase()) ||
         produto.id.toString() === termo
      );
   });

   mostrarResultadosProdutos(resultados);
}

// Exibir resultados da busca de produtos
function mostrarResultadosProdutos(produtos) {
   produtoResults.innerHTML = "";

   if (produtos.length === 0) {
      produtoResults.innerHTML = `
            <div class="search-result-item">
                <p>Nenhum produto encontrado</p>
            </div>
        `;
      produtoResults.classList.add("active");
      return;
   }

   produtos.forEach((produto) => {
      const item = document.createElement("div");
      item.className = "search-result-item";

      // Formatar o preço
      const preco = parseFloat(produto.preco_venda).toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });

      item.innerHTML = `
            <p class="item-title">${produto.nome}</p>
            <p class="item-subtitle">${
               produto.codigo_barras || "Sem código"
            } - ${preco}</p>
        `;

      item.addEventListener("click", function () {
         // Preencher os dados no modal
         for (let i = 0; i < modalProdutoId.options.length; i++) {
            if (modalProdutoId.options[i].value == produto.id) {
               modalProdutoId.selectedIndex = i;
               break;
            }
         }

         modalProdutoValor.value = produto.preco_venda;
         modalProdutoQtd.value = 1;
         modalProdutoDesconto.value = 0;
         atualizarCalculosModal();

         // Abrir o modal
         abrirModalProduto();

         // Esconder os resultados
         produtoResults.innerHTML = "";
         produtoResults.classList.remove("active");
      });

      produtoResults.appendChild(item);
   });

   produtoResults.classList.add("active");
}

// Abrir modal para adicionar produto
function abrirModalProduto() {
   modalProduto.classList.add("active");
}

// Fechar modal
function fecharModalProduto() {
   modalProduto.classList.remove("active");
   formAddProduto.reset();

   // Restaurar estado padrão
   const modalTitle = document.querySelector("#modal-produto .modal-header h3");
   if (modalTitle) {
      modalTitle.textContent = "Adicionar Produto";
   }

   // Habilitar o dropdown se estiver desabilitado
   if (modalProdutoId.disabled) {
      modalProdutoId.disabled = false;
   }

   // Restaurar texto do botão de submit
   const submitButton = formAddProduto.querySelector('button[type="submit"]');
   if (submitButton) {
      submitButton.textContent = "Adicionar";
   }

   // Remover atributos especiais
   formAddProduto.removeAttribute("data-edit-index");
}

// Adicionar produto ao pedido
function adicionarProdutoAoPedido() {
   const produtoId = modalProdutoId.value;
   if (!produtoId) {
      customModal.error("Selecione um produto");
      return;
   }

   // Usar a função parseNumero para validação consistente
   const quantidade = parseInt(modalProdutoQtd.value);
   if (isNaN(quantidade) || quantidade <= 0) {
      customModal.error("Informe uma quantidade válida");
      return;
   }

   const valor = parseNumero(modalProdutoValor.value);
   if (isNaN(valor) || valor <= 0) {
      customModal.error("Informe um valor válido");
      return;
   }

   const desconto = parseNumero(modalProdutoDesconto.value);
   if (isNaN(desconto) || desconto < 0 || desconto > 100) {
      customModal.error("Informe um desconto válido (0-100%)");
      return;
   }

   // Calcular valores
   const subtotalBruto = valor * quantidade;
   const valorDesconto = subtotalBruto * (desconto / 100);
   const subtotalLiquido = subtotalBruto - valorDesconto;

   // Verificar se o produto já está no pedido
   const produtoExistente = produtosPedido.findIndex((p) => p.id === produtoId);

   if (produtoExistente >= 0) {
      // Atualizar quantidade, valor e desconto
      produtosPedido[produtoExistente].quantidade = quantidade;
      produtosPedido[produtoExistente].valor = valor;
      produtosPedido[produtoExistente].desconto = desconto;
      produtosPedido[produtoExistente].valorDesconto = valorDesconto;
      produtosPedido[produtoExistente].subtotalBruto = subtotalBruto;
      produtosPedido[produtoExistente].subtotal = subtotalLiquido;
   } else {
      // Buscar informações do produto
      const produtoInfo = produtosDisponiveis.find((p) => p.id === produtoId);

      // Adicionar novo produto
      produtosPedido.push({
         id: produtoId,
         codigo: produtoInfo.codigo_barras || "Sem código",
         nome: produtoInfo.nome,
         valor: valor,
         quantidade: quantidade,
         desconto: desconto,
         valorDesconto: valorDesconto,
         subtotalBruto: subtotalBruto,
         subtotal: subtotalLiquido,
      });
   }

   // Atualizar a tabela
   atualizarTabelaProdutos();

   // Fechar o modal
   fecharModalProduto();

   // Limpar o campo de busca de produtos
   produtoSearch.value = "";

   // Limpar os resultados da pesquisa
   produtoResults.innerHTML = "";
   produtoResults.classList.remove("active");

   // Mostrar mensagem de sucesso
   customModal.success("Produto adicionado ao pedido");
}

// Atualizar a tabela de produtos
function atualizarTabelaProdutos() {
   produtosLista.innerHTML = "";

   if (produtosPedido.length === 0) {
      semProdutosDiv.style.display = "flex";
      // Zerar os totais
      document.getElementById("total-itens").textContent = "0";
      document.getElementById("total-valor-bruto").textContent = "R$ 0,00";
      document.getElementById("total-valor-desconto").textContent = "R$ 0,00";
      document.getElementById("total-valor").textContent = "R$ 0,00";
      return;
   }

   semProdutosDiv.style.display = "none";

   // Adicionar cada produto à tabela
   produtosPedido.forEach((produto, index) => {
      const tr = document.createElement("tr");

      // Formatar valores
      const valorUnitario = produto.valor.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });

      const descontoFormatado =
         produto.desconto > 0 ? `${produto.desconto}%` : "0%";

      const subtotal = produto.subtotal.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });

      tr.innerHTML = `
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>${valorUnitario}</td>
            <td>${produto.quantidade}</td>
            <td>${descontoFormatado}</td>
            <td>${subtotal}</td>
            <td>
                <div class="acoes">
                    <button type="button" class="btn-icon btn-icon-edit" data-index="${index}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="btn-icon btn-icon-delete" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;

      // Adicionar event listeners para os botões
      tr.querySelector(".btn-icon-edit").addEventListener("click", function () {
         editarProduto(index);
      });

      tr.querySelector(".btn-icon-delete").addEventListener(
         "click",
         function () {
            excluirProduto(index);
         }
      );

      produtosLista.appendChild(tr);
   });

   // Atualizar totais
   atualizarTotais();
}

// Atualizar totais do pedido
function atualizarTotais() {
   const totalItens = produtosPedido.reduce(
      (sum, produto) => sum + produto.quantidade,
      0
   );

   const valorTotalBruto = produtosPedido.reduce(
      (sum, produto) => sum + produto.subtotalBruto,
      0
   );

   const valorTotalDesconto = produtosPedido.reduce(
      (sum, produto) => sum + produto.valorDesconto,
      0
   );

   const valorTotalLiquido = produtosPedido.reduce(
      (sum, produto) => sum + produto.subtotal,
      0
   );

   document.getElementById("total-itens").textContent = totalItens;

   document.getElementById("total-valor-bruto").textContent =
      valorTotalBruto.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });

   document.getElementById("total-valor-desconto").textContent =
      valorTotalDesconto.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });

   document.getElementById("total-valor").textContent =
      valorTotalLiquido.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });
}

// Editar produto
function editarProduto(index) {
   const produto = produtosPedido[index];
   console.log("Produto para edição:", produto); // Para depuração

   // Definir o título do modal
   const modalTitle = document.querySelector("#modal-produto .modal-header h3");
   if (modalTitle) {
      modalTitle.textContent = "Editar Produto";
   }

   // IMPORTANTE: Garantir que os IDs sejam do mesmo tipo para comparação
   const produtoIdString = String(produto.id);

   console.log("Verificando opções disponíveis no dropdown:");
   for (let i = 0; i < modalProdutoId.options.length; i++) {
      const optionValue = modalProdutoId.options[i].value;
      console.log(
         `Opção ${i}: valor="${optionValue}", comparando com produto.id="${produtoIdString}"`
      );

      if (optionValue === produtoIdString) {
         console.log("MATCH ENCONTRADO! Selecionando índice: " + i);
         modalProdutoId.selectedIndex = i;
         break;
      }
   }

   // Se não encontrou o produto, desabilitar o dropdown
   if (modalProdutoId.selectedIndex === 0 && produtoIdString !== "") {
      console.log("Produto não encontrado na lista: " + produtoIdString);
      modalProdutoId.disabled = true;
   }

   // Preencher os demais campos
   modalProdutoValor.value = Number(produto.valor).toFixed(2);
   modalProdutoQtd.value = produto.quantidade;
   modalProdutoDesconto.value = Number(produto.desconto).toFixed(2);

   // Atualizar o subtotal no modal
   atualizarCalculosModal();

   // Modificar o texto do botão de submit
   const submitButton = formAddProduto.querySelector('button[type="submit"]');
   if (submitButton) {
      submitButton.textContent = "Atualizar";
   }

   // Guardar o índice do produto para uso no submit
   formAddProduto.setAttribute("data-edit-index", index);

   // Modificar o handler do formulário para atualizar em vez de adicionar
   const originalSubmitHandler = formAddProduto.onsubmit;

   formAddProduto.onsubmit = function (e) {
      e.preventDefault();

      try {
         const editIndex = parseInt(this.getAttribute("data-edit-index"));

         const valor = parseNumero(modalProdutoValor.value);
         const quantidade = parseNumero(modalProdutoQtd.value);
         const desconto = parseNumero(modalProdutoDesconto.value);

         // if (isNaN(valor) || valor <= 0) {
         //    throw new Error("Informe um valor válido");
         // }

         if (isNaN(quantidade) || quantidade <= 0) {
            throw new Error("Informe uma quantidade válida");
         }

         if (isNaN(desconto) || desconto < 0 || desconto > 100) {
            throw new Error("Informe um desconto válido (0-100%)");
         }

         const subtotalBruto = valor * quantidade;
         const valorDesconto = subtotalBruto * (desconto / 100);
         const subtotalLiquido = subtotalBruto - valorDesconto;

         produtosPedido[editIndex] = {
            ...produtosPedido[editIndex],
            valor,
            quantidade,
            desconto,
            valorDesconto,
            subtotalBruto,
            subtotal: subtotalLiquido,
         };

         formAddProduto.removeAttribute("data-edit-index");
         if (modalProdutoId.disabled) modalProdutoId.disabled = false;

         const submitButton = formAddProduto.querySelector(
            'button[type="submit"]'
         );
         if (submitButton) submitButton.textContent = "Adicionar";

         atualizarTabelaProdutos();
         fecharModalProduto();

         formAddProduto.onsubmit = originalSubmitHandler;

         customModal.success("Produto atualizado");
      } catch (error) {
         customModal.error(error.message);
      }
   };

   // Abrir modal
   abrirModalProduto();
}

// Excluir produto
function excluirProduto(index) {
   customModal
      .confirm(
         "Tem certeza que deseja remover este produto do pedido?",
         "Confirmar exclusão",
         "warning"
      )
      .then((confirmado) => {
         if (confirmado) {
            produtosPedido.splice(index, 1);
            atualizarTabelaProdutos();
            customModal.success("Produto removido do pedido");
         }
      });
}

// Função para salvar o pedido
function salvarPedido() {
   // Verificar se é uma edição ou novo pedido
   const pedidoId = document.getElementById("pedido-id")
      ? document.getElementById("pedido-id").value
      : null;
   const isEdicao = !!pedidoId;

   // Se for edição, obter o cliente do campo hidden
   if (isEdicao && !clienteSelecionado) {
      const clienteId = document.getElementById("cliente-id").value;
      const clienteNome = document.getElementById("cliente-nome").value;
      const clienteCnpj = document.getElementById("cliente-cnpj").value;
      const clienteTelefone = document.getElementById("cliente-telefone").value;

      // Cidade/UF pode estar em formato "Cidade/UF"
      let clienteCidade = "";
      let clienteEstado = "";
      const cidadeUf = document.getElementById("cliente-cidade").value;
      if (cidadeUf && cidadeUf !== "Não informado") {
         const partes = cidadeUf.split("/");
         if (partes.length === 2) {
            clienteCidade = partes[0];
            clienteEstado = partes[1];
         }
      }

      // Criar objeto clienteSelecionado com dados dos campos
      clienteSelecionado = {
         id: clienteId,
         razao_social: clienteNome,
         cpf_cnpj: clienteCnpj,
         telefone: clienteTelefone,
         cidade: clienteCidade,
         estado: clienteEstado,
      };

      console.log("Cliente reconstruído para edição:", clienteSelecionado);
   }

   // Validar cliente
   if (!clienteSelecionado) {
      customModal.error("Selecione um cliente para o pedido");
      return;
   }

   // Validar produtos
   if (produtosPedido.length === 0) {
      customModal.error("Adicione pelo menos um produto ao pedido");
      return;
   }

   // Validar campos obrigatórios
   const transportadora = document.getElementById("transportadora").value;
   const formaPagamento = document.getElementById("forma-pagamento").value;

   if (!transportadora || !formaPagamento) {
      customModal.error("Preencha todos os campos obrigatórios");
      return;
   }

   // Calcular totais para envio
   const valorTotalBruto = produtosPedido.reduce(
      (sum, produto) => sum + produto.subtotalBruto,
      0
   );

   const valorTotalDesconto = produtosPedido.reduce(
      (sum, produto) => sum + produto.valorDesconto,
      0
   );

   const valorTotalLiquido = produtosPedido.reduce(
      (sum, produto) => sum + produto.subtotal,
      0
   );

   // Obter usuário
   fetch("get_session_user_id.php")
      .then((response) => response.json())
      .then((data) => {
         if (!data.success) {
            throw new Error(data.message || "Erro ao obter ID do usuário");
         }

         // Preparar dados para envio
         const dadosPedido = {
            cliente_id: clienteSelecionado.id,
            transportadora: transportadora,
            forma_pagamento: formaPagamento,
            usuario_id: data.usuario_id,
            observacoes: document.getElementById("observacoes").value,
            produtos: produtosPedido.map((p) => ({
               id: p.id,
               quantidade: p.quantidade,
               valor: p.valor,
               desconto: p.desconto,
               valor_desconto: p.valorDesconto,
            })),
            valor_total_bruto: valorTotalBruto,
            valor_total_desconto: valorTotalDesconto,
            valor_total: valorTotalLiquido,
         };

         // Se for edição, adicionar o ID do pedido
         if (isEdicao) {
            dadosPedido.pedido_id = pedidoId;
         }

         console.log("Dados do pedido a serem enviados:", dadosPedido);

         // Exibir indicador de carregamento
         customModal.alert(
            "Salvando pedido, aguarde...",
            "Processando",
            "info"
         );

         // Enviar para o servidor
         return fetch("processa_pedido.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosPedido),
         });
      })
      .then((response) => {
         console.log("Resposta recebida:", response);
         return response.text().then((text) => {
            try {
               // Tentar analisar como JSON
               return JSON.parse(text);
            } catch (e) {
               // Se não for JSON, mostrar a resposta bruta
               console.error("Resposta não é JSON válido:", text);
               throw new Error("Resposta não é JSON válido: " + text);
            }
         });
      })
      .then((data) => {
         console.log("Dados de resposta:", data);
         if (data.status === "success") {
            customModal
               .success("Pedido #" + data.pedido_id + " salvo com sucesso!")
               .then(() => {
                  // Redirecionar para a lista de pedidos após o sucesso
                  window.location.href = "listPed.php";
               });
         } else {
            throw new Error(data.message || "Erro ao salvar pedido");
         }
      })
      .catch((error) => {
         console.error("Erro ao salvar pedido:", error);
         customModal.error("Erro ao salvar pedido: " + error.message);
      });
}

// Limpar o formulário para um novo pedido
function limparFormularioPedido() {
   // Limpar cliente
   clienteSelecionado = null;
   clienteSearch.value = "";
   document.getElementById("cliente-id").value = "";
   document.getElementById("cliente-nome").value = "";
   document.getElementById("cliente-cnpj").value = "";
   document.getElementById("cliente-telefone").value = "";
   document.getElementById("cliente-cidade").value = "";
   document.getElementById("produto-search").value = "";

   // Limpar campos do pedido
   document.getElementById("transportadora").value = "";
   document.getElementById("forma-pagamento").value = "";
   document.getElementById("observacoes").value = "";

   // Limpar produtos
   produtosPedido = [];
   atualizarTabelaProdutos();
}
