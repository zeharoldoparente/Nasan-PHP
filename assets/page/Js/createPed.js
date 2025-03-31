document.addEventListener("DOMContentLoaded", function () {
   const pedidoForm = document.getElementById("pedidoForm");
   const btnAvancar = document.getElementById("btnAvancar");
   const btnSalvar = document.getElementById("btnSalvar");
   const btnCancel = document.querySelector(".btn-cancel");
   const produtosPlaceholder = document.querySelector(".products-placeholder");
   const produtosArea = document.getElementById("produtos-area");
   const produtosLista = document.getElementById("produtos-lista");
   const addProdutoBtn = document.getElementById("addProduto");
   const cnpjInput = document.getElementById("cnpj");
   const cepInput = document.getElementById("cep");
   const buscarCepBtn = document.getElementById("buscar-cep");
   const cepStatus = document.getElementById("cep-status");

   let produtos = [];
   if (cnpjInput) {
      cnpjInput.addEventListener("input", function (e) {
         let value = e.target.value.replace(/\D/g, "");

         if (value.length <= 11) {
            if (value.length > 9)
               value = value.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3-");
            else if (value.length > 6)
               value = value.replace(/(\d{3})(\d{3})/, "$1.$2.");
            else if (value.length > 3) value = value.replace(/(\d{3})/, "$1.");
         } else {
            if (value.length > 12)
               value = value.replace(
                  /(\d{2})(\d{3})(\d{3})(\d{4})/,
                  "$1.$2.$3/$4-"
               );
            else if (value.length > 8)
               value = value.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3/");
            else if (value.length > 5)
               value = value.replace(/(\d{2})(\d{3})/, "$1.$2.");
            else if (value.length > 2) value = value.replace(/(\d{2})/, "$1.");
         }

         e.target.value = value;
      });
   }

   if (cepInput) {
      cepInput.addEventListener("input", function (e) {
         let value = e.target.value.replace(/\D/g, "");

         if (value.length > 5) {
            value = value.replace(/(\d{5})(\d{3})/, "$1-$2");
         }

         e.target.value = value;

         if (cepStatus) {
            cepStatus.textContent = "";
            cepStatus.className = "field-status";
         }
      });

      cepInput.addEventListener("keypress", function (e) {
         if (e.key === "Enter") {
            e.preventDefault();
            buscarCEP();
         }
      });
   }

   function buscarCEP() {
      if (!cepInput || !cepStatus) return;

      const cep = cepInput.value.replace(/\D/g, "");

      if (cep.length !== 8) {
         cepStatus.textContent = "CEP inválido. Digite 8 números.";
         cepStatus.className = "field-status error";
         return;
      }

      document.getElementById("rua").value = "";
      document.getElementById("bairro").value = "";
      document.getElementById("cidade").value = "";
      document.getElementById("estado").value = "";

      cepStatus.textContent = "Buscando CEP...";
      cepStatus.className = "field-status loading";

      fetch(`https://viacep.com.br/ws/${cep}/json/`)
         .then((response) => {
            if (!response.ok) {
               throw new Error("Erro na resposta da API");
            }
            return response.json();
         })
         .then((data) => {
            if (data.erro) {
               cepStatus.textContent = "CEP não encontrado.";
               cepStatus.className = "field-status error";
               return;
            }

            document.getElementById("rua").value = data.logradouro;
            document.getElementById("bairro").value = data.bairro;
            document.getElementById("cidade").value = data.localidade;
            document.getElementById("estado").value = data.uf;

            if (data.logradouro) {
               document.getElementById("numero").focus();
            }

            cepStatus.textContent = "Endereço encontrado!";
            cepStatus.className = "field-status success";

            setTimeout(() => {
               cepStatus.textContent = "";
               cepStatus.className = "field-status";
            }, 3000);
         })
         .catch((error) => {
            console.error("Erro ao buscar CEP:", error);
            cepStatus.textContent = "Erro ao buscar CEP. Tente novamente.";
            cepStatus.className = "field-status error";
         });
   }

   if (buscarCepBtn) {
      buscarCepBtn.addEventListener("click", function (e) {
         e.preventDefault();
         buscarCEP();
      });
   }

   function validarCamposCliente() {
      const empresa = document.getElementById("empresa").value;
      const cnpjValue = cnpjInput ? cnpjInput.value : "";

      if (!empresa || !cnpjValue) {
         alert(
            "Por favor, preencha os dados obrigatórios do cliente: Razão Social e CPF/CNPJ."
         );
         return false;
      }

      return true;
   }

   function mostrarAreaProdutos() {
      if (produtosPlaceholder) produtosPlaceholder.style.display = "none";
      if (produtosArea) produtosArea.style.display = "block";
      if (btnAvancar) btnAvancar.style.display = "none";
      if (btnSalvar) btnSalvar.style.display = "inline-block";
   }

   function criarElementoProduto(produto, index) {
      const produtoItem = document.createElement("div");
      produtoItem.className = "produto-item";
      produtoItem.dataset.index = index;

      produtoItem.innerHTML = `
       <div class="produto-info">
         <div class="produto-nome">${produto.nome}</div>
         <div class="produto-quantidade">Qtd: ${produto.quantidade}</div>
         <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
       </div>
       <div class="produto-actions">
         <button type="button" class="btn-produto-edit" data-index="${index}">
           <i class="bi bi-pencil"></i>
         </button>
         <button type="button" class="btn-produto-remove" data-index="${index}">
           <i class="bi bi-trash"></i>
         </button>
       </div>
     `;

      return produtoItem;
   }

   function atualizarListaProdutos() {
      if (!produtosLista) return;

      produtosLista.innerHTML = "";

      if (produtos.length === 0) {
         const mensagem = document.createElement("div");
         mensagem.className = "produtos-vazio";
         mensagem.textContent = "Nenhum produto adicionado.";
         produtosLista.appendChild(mensagem);
         return;
      }

      produtos.forEach((produto, index) => {
         const produtoItem = criarElementoProduto(produto, index);
         produtosLista.appendChild(produtoItem);
      });

      document.querySelectorAll(".btn-produto-edit").forEach((btn) => {
         btn.addEventListener("click", function () {
            const index = parseInt(this.dataset.index);
            editarProduto(index);
         });
      });

      document.querySelectorAll(".btn-produto-remove").forEach((btn) => {
         btn.addEventListener("click", function () {
            const index = parseInt(this.dataset.index);
            removerProduto(index);
         });
      });
   }

   function adicionarProduto() {
      const nomeProduto = prompt("Nome do produto:");
      if (!nomeProduto) return;

      const quantidadeProduto = prompt("Quantidade:");
      if (!quantidadeProduto || isNaN(quantidadeProduto)) return;

      const precoProduto = prompt("Preço unitário (R$):");
      if (!precoProduto || isNaN(precoProduto)) return;

      const produto = {
         nome: nomeProduto,
         quantidade: parseInt(quantidadeProduto),
         preco: parseFloat(precoProduto),
      };

      produtos.push(produto);

      if (pedidoForm) {
         adicionarCamposProduto(produto, produtos.length - 1);
      }

      atualizarListaProdutos();
   }

   function adicionarCamposProduto(produto, index) {
      if (!pedidoForm) return;

      const camposAntigos = document.querySelectorAll(
         `[name^="produto[${index}]"]`
      );
      camposAntigos.forEach((campo) => campo.remove());

      const campoNome = document.createElement("input");
      campoNome.type = "hidden";
      campoNome.name = `produto[${index}][nome]`;
      campoNome.value = produto.nome;

      const campoQtd = document.createElement("input");
      campoQtd.type = "hidden";
      campoQtd.name = `produto[${index}][quantidade]`;
      campoQtd.value = produto.quantidade;

      const campoPreco = document.createElement("input");
      campoPreco.type = "hidden";
      campoPreco.name = `produto[${index}][preco]`;
      campoPreco.value = produto.preco;

      pedidoForm.appendChild(campoNome);
      pedidoForm.appendChild(campoQtd);
      pedidoForm.appendChild(campoPreco);
   }

   function editarProduto(index) {
      const produto = produtos[index];

      const nomeProduto = prompt("Nome do produto:", produto.nome);
      if (!nomeProduto) return;

      const quantidadeProduto = prompt("Quantidade:", produto.quantidade);
      if (!quantidadeProduto || isNaN(quantidadeProduto)) return;

      const precoProduto = prompt("Preço unitário (R$):", produto.preco);
      if (!precoProduto || isNaN(precoProduto)) return;

      produtos[index] = {
         nome: nomeProduto,
         quantidade: parseInt(quantidadeProduto),
         preco: parseFloat(precoProduto),
      };

      if (pedidoForm) {
         adicionarCamposProduto(produtos[index], index);
      }

      atualizarListaProdutos();
   }

   function removerProduto(index) {
      if (!confirm("Tem certeza que deseja remover este produto?")) return;

      produtos.splice(index, 1);

      if (pedidoForm) {
         const camposAntigos = document.querySelectorAll(
            `[name^="produto[${index}]"]`
         );
         camposAntigos.forEach((campo) => campo.remove());

         produtos.forEach((produto, idx) => {
            adicionarCamposProduto(produto, idx);
         });
      }

      atualizarListaProdutos();
   }

   if (btnAvancar) {
      btnAvancar.addEventListener("click", function () {
         if (validarCamposCliente()) {
            mostrarAreaProdutos();
         }
      });
   }

   if (btnCancel) {
      btnCancel.addEventListener("click", function () {
         if (
            confirm(
               "Tem certeza que deseja cancelar este pedido? Os dados não serão salvos."
            )
         ) {
            window.history.back();
         }
      });
   }

   if (addProdutoBtn) {
      addProdutoBtn.addEventListener("click", adicionarProduto);
   }

   if (pedidoForm) {
      pedidoForm.addEventListener("submit", function (event) {
         if (produtos.length === 0) {
            event.preventDefault();
            alert("Adicione pelo menos um produto antes de salvar o pedido.");
            return false;
         }

         const campoProdutosQtd = document.createElement("input");
         campoProdutosQtd.type = "hidden";
         campoProdutosQtd.name = "total_produtos";
         campoProdutosQtd.value = produtos.length;
         pedidoForm.appendChild(campoProdutosQtd);

         return true;
      });
   }

   atualizarListaProdutos();
});
