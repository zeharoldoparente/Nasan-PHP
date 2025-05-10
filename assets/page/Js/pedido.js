let produtosPedido = [];
let clienteSelecionado = null;
let produtosDisponiveis = [];
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
document.addEventListener("DOMContentLoaded", function () {
   carregarProdutos();
   setupEventListeners();
   atualizarTabelaProdutos();
});
function parseNumero(valor) {
   if (valor === null || valor === undefined || valor === "") return 0;
   if (typeof valor === "number") return valor;
   const numeroLimpo = valor.toString().replace(/[^\d.,]/g, "");
   if (numeroLimpo === "") return 0;
   const numeroFinal = parseFloat(numeroLimpo.replace(",", "."));

   return isNaN(numeroFinal) ? 0 : numeroFinal;
}
function carregarProdutos() {
   const timestamp = new Date().getTime();
   
   fetch(`get_produtos.php?nocache=${timestamp}`)
      .then(response => {
         if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
         }
         return response.text();
      })
      .then(text => {
         console.log(`Resposta recebida (${text.length} caracteres)`);
         
         if (!text.trim()) {
            console.warn("Resposta vazia recebida");
            return [];
         }
         
         try {
            const data = JSON.parse(text);
            if (data.produtos) {
               return data.produtos;
            }
            
            return data;
         } catch (e) {
            console.error("Erro ao processar JSON:", e);
            console.log("Primeiros 100 caracteres da resposta:", text.substring(0, 100));
            throw new Error("Falha ao processar dados do servidor");
         }
      })
      .then(produtos => {
         if (!Array.isArray(produtos)) {
            console.error("Dados não são um array:", produtos);
            produtosDisponiveis = [];
            return;
         }
         
         produtosDisponiveis = produtos.map(produto => ({
            id: produto.id,
            codigo_barras: produto.codigo_barras || "",
            nome: produto.nome,
            preco_venda: produto.preco_venda,
            unidade: produto.unidade || "",
         }));
         
         console.log(`${produtosDisponiveis.length} produtos carregados com sucesso`);
         popularSelectProdutos();
      })
      .catch(error => {
         console.error("Erro ao carregar produtos:", error);
         customModal.error("Erro ao carregar lista de produtos. Verifique a conexão com o banco de dados.");
      });
}
function popularSelectProdutos() {
   modalProdutoId.innerHTML = '<option value="">Selecione um produto</option>';

   produtosDisponiveis.forEach((produto) => {
      const option = document.createElement("option");
      option.value = produto.id;
      option.textContent = `${
         produto.codigo_barras ? produto.codigo_barras + " - " : ""
      }${produto.nome}`;
      option.setAttribute("data-preco", produto.preco_venda);
      option.setAttribute("data-codigo", produto.codigo_barras || ""); // Armazenar código de barras no option
      modalProdutoId.appendChild(option);
   });
}
function setupEventListeners() {
   clienteSearch.addEventListener("input", function () {
      const termo = this.value.trim();

      if (termo.length < 2) {
         clienteResults.innerHTML = "";
         clienteResults.classList.remove("active");
         return;
      }

      buscarClientes(termo);
   });
   produtoSearch.addEventListener("input", function () {
      const termo = this.value.trim();

      if (termo.length < 2) {
         produtoResults.innerHTML = "";
         produtoResults.classList.remove("active");
         return;
      }

      filtrarProdutos(termo);
   });
   document
      .getElementById("add-produto")
      .addEventListener("click", function () {
         abrirModalProduto();
      });
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
   modalProdutoQtd.addEventListener("input", atualizarCalculosModal);
   modalProdutoValor.addEventListener("input", atualizarCalculosModal);
   modalProdutoDesconto.addEventListener("input", atualizarCalculosModal);
   formAddProduto.addEventListener("submit", function (e) {
      e.preventDefault();
      adicionarProdutoAoPedido();
   });
   document.querySelectorAll(".btn-close-modal").forEach((btn) => {
      btn.addEventListener("click", function () {
         document.querySelectorAll(".modal-overlay").forEach((modal) => {
            modal.classList.remove("active");
         });
      });
   });
   pedidoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      salvarPedido();
   });
}
function atualizarCalculosModal() {
   try {
      const valor = parseNumero(modalProdutoValor.value);
      const quantidade = parseInt(modalProdutoQtd.value) || 0;
      const desconto = parseNumero(modalProdutoDesconto.value);
      if (isNaN(valor) || valor <= 0) {
         modalProdutoSubtotal.value = "R$ 0,00";
         return;
      }
      const subtotalBruto = valor * quantidade;
      const valorDesconto = subtotalBruto * (desconto / 100);
      const subtotalLiquido = subtotalBruto - valorDesconto;
      modalProdutoSubtotal.value = subtotalLiquido.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });
   } catch (error) {
      console.error("Erro ao calcular valores:", error);
      modalProdutoSubtotal.value = "R$ 0,00";
   }
}
function buscarClientes(termo) {
    const apenasNumeros = /^\d+$/.test(termo);
    let sql;
   if (apenasNumeros) {
      sql = `SELECT id, razao_social, cpf_cnpj, telefone, cidade, estado FROM clientes WHERE cpf_cnpj LIKE '%${termo}%' ORDER BY razao_social LIMIT 10`;
   } else {
      sql = `SELECT id, razao_social, cpf_cnpj, telefone, cidade, estado FROM clientes WHERE razao_social LIKE '%${termo}%' ORDER BY razao_social LIMIT 10`;
   }
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
function selecionarCliente(cliente) {
   clienteSelecionado = cliente;
   clienteSearch.value = cliente.razao_social;
   document.getElementById("cliente-id").value = cliente.id;
   document.getElementById("cliente-nome").value = cliente.razao_social;
   document.getElementById("cliente-cnpj").value = cliente.cpf_cnpj;
   document.getElementById("cliente-telefone").value =
      cliente.telefone || "Não informado";
   document.getElementById("cliente-cidade").value = cliente.cidade
      ? `${cliente.cidade}/${cliente.estado}`
      : "Não informado";
      clienteResults.innerHTML = "";
   clienteResults.classList.remove("active");
}
function filtrarProdutos(termo) {
   const resultados = produtosDisponiveis.filter((produto) => {
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
         abrirModalProduto();
         produtoResults.innerHTML = "";
         produtoResults.classList.remove("active");
      });

      produtoResults.appendChild(item);
   });

   produtoResults.classList.add("active");
}
function abrirModalProduto() {
   modalProduto.classList.add("active");
}
function fecharModalProduto() {
   modalProduto.classList.remove("active");
   formAddProduto.reset();
   const modalTitle = document.querySelector("#modal-produto .modal-header h3");
   if (modalTitle) {
      modalTitle.textContent = "Adicionar Produto";
   }
   if (modalProdutoId.disabled) {
      modalProdutoId.disabled = false;
   }
   const submitButton = formAddProduto.querySelector('button[type="submit"]');
   if (submitButton) {
      submitButton.textContent = "Adicionar";
   }
   formAddProduto.removeAttribute("data-edit-index");
}
function adicionarProdutoAoPedido() {
   const produtoId = modalProdutoId.value;
   if (!produtoId) {
      customModal.error("Selecione um produto");
      return;
   }
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
   }const subtotalBruto = valor * quantidade;
   const valorDesconto = subtotalBruto * (desconto / 100);
   const subtotalLiquido = subtotalBruto - valorDesconto;
   const produtoExistente = produtosPedido.findIndex((p) => p.id === produtoId);

   if (produtoExistente >= 0) {
      produtosPedido[produtoExistente].quantidade = quantidade;
      produtosPedido[produtoExistente].valor = valor;
      produtosPedido[produtoExistente].desconto = desconto;
      produtosPedido[produtoExistente].valorDesconto = valorDesconto;
      produtosPedido[produtoExistente].subtotalBruto = subtotalBruto;
      produtosPedido[produtoExistente].subtotal = subtotalLiquido;
   } else {
      const selectOption = modalProdutoId.options[modalProdutoId.selectedIndex];
      const produtoNome = selectOption.textContent.split(" - ").pop();
      const produtoCodigo = selectOption.getAttribute("data-codigo") || "Sem código";
      produtosPedido.push({
         id: produtoId,
         codigo: produtoCodigo,
         nome: produtoNome,
         valor: valor,
         quantidade: quantidade,
         desconto: desconto,
         valorDesconto: valorDesconto,
         subtotalBruto: subtotalBruto,
         subtotal: subtotalLiquido,
      });
   }
   atualizarTabelaProdutos();
   fecharModalProduto();
   produtoSearch.value = "";
   produtoResults.innerHTML = "";
   produtoResults.classList.remove("active");
   customModal.success("Produto adicionado ao pedido");
}
function atualizarTabelaProdutos() {
   produtosLista.innerHTML = "";

   if (produtosPedido.length === 0) {
      semProdutosDiv.style.display = "flex";
      document.getElementById("total-itens").textContent = "0";
      document.getElementById("total-valor-bruto").textContent = "R$ 0,00";
      document.getElementById("total-valor-desconto").textContent = "R$ 0,00";
      document.getElementById("total-valor").textContent = "R$ 0,00";
      return;
   }

   semProdutosDiv.style.display = "none";
   produtosPedido.forEach((produto, index) => {
      const tr = document.createElement("tr");
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
   atualizarTotais();
}
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
function editarProduto(index) {
   const produto = produtosPedido[index];
   console.log("Produto para edição:", produto);
   const modalTitle = document.querySelector("#modal-produto .modal-header h3");
   if (modalTitle) {
      modalTitle.textContent = "Editar Produto";
   }
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
   if (modalProdutoId.selectedIndex === 0 && produtoIdString !== "") {
      console.log("Produto não encontrado na lista: " + produtoIdString);
      modalProdutoId.disabled = true;
   }
   modalProdutoValor.value = Number(produto.valor).toFixed(2);
   modalProdutoQtd.value = produto.quantidade;
   modalProdutoDesconto.value = Number(produto.desconto).toFixed(2);
   atualizarCalculosModal();
   const submitButton = formAddProduto.querySelector('button[type="submit"]');
   if (submitButton) {
      submitButton.textContent = "Atualizar";
   }
   formAddProduto.setAttribute("data-edit-index", index);
   const originalSubmitHandler = formAddProduto.onsubmit;

   formAddProduto.onsubmit = function (e) {
      e.preventDefault();

      try {
         const editIndex = parseInt(this.getAttribute("data-edit-index"));

         const valor = parseNumero(modalProdutoValor.value);
         const quantidade = parseNumero(modalProdutoQtd.value);
         const desconto = parseNumero(modalProdutoDesconto.value);
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
   abrirModalProduto();
}
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
function salvarPedido() {
   const pedidoId = document.getElementById("pedido-id")
      ? document.getElementById("pedido-id").value
      : null;
   const isEdicao = !!pedidoId;
   if (isEdicao && !clienteSelecionado) {
      const clienteId = document.getElementById("cliente-id").value;
      const clienteNome = document.getElementById("cliente-nome").value;
      const clienteCnpj = document.getElementById("cliente-cnpj").value;
      const clienteTelefone = document.getElementById("cliente-telefone").value;
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
   if (!clienteSelecionado) {
      customModal.error("Selecione um cliente para o pedido");
      return;
   }
   if (produtosPedido.length === 0) {
      customModal.error("Adicione pelo menos um produto ao pedido");
      return;
   }
   const transportadora = document.getElementById("transportadora").value;
   const formaPagamento = document.getElementById("forma-pagamento").value;

   if (!transportadora || !formaPagamento) {
      customModal.error("Preencha todos os campos obrigatórios");
      return;
   }
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
   fetch("get_session_user_id.php")
      .then((response) => response.json())
      .then((data) => {
         if (!data.success) {
            throw new Error(data.message || "Erro ao obter ID do usuário");
         }
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
         if (isEdicao) {
            dadosPedido.pedido_id = pedidoId;
         }

         console.log("Dados do pedido a serem enviados:", dadosPedido);
         customModal.alert(
            "Salvando pedido, aguarde...",
            "Processando",
            "info"
         );
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
               return JSON.parse(text);
            } catch (e) {
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
function limparFormularioPedido() {
   clienteSelecionado = null;
   clienteSearch.value = "";
   document.getElementById("cliente-id").value = "";
   document.getElementById("cliente-nome").value = "";
   document.getElementById("cliente-cnpj").value = "";
   document.getElementById("cliente-telefone").value = "";
   document.getElementById("cliente-cidade").value = "";
   document.getElementById("produto-search").value = "";
   document.getElementById("transportadora").value = "";
   document.getElementById("forma-pagamento").value = "";
   document.getElementById("observacoes").value = "";
   produtosPedido = [];
   atualizarTabelaProdutos();
}
