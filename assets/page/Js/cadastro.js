document.addEventListener("DOMContentLoaded", function () {
   // Detecta se é dispositivo móvel (tela menor que 769px)
   const isMobile = window.innerWidth < 769;

   // Referências para o modal
   const modalOverlay = document.getElementById("form-modal");
   const modalContent = document.getElementById("modal-content");
   const modalTitle = document.getElementById("modal-title");
   const btnCloseModal = document.querySelector(".btn-close-modal");

   // Elementos de lista
   const listaClientes = document.getElementById("lista-clientes");
   const listaProdutos = document.getElementById("lista-produtos");

   // Carregar clientes
   function carregarClientes() {
      fetch("../get_clientes.php")
         .then((response) => {
            if (!response.ok) {
               throw new Error("Erro na resposta do servidor");
            }
            return response.json();
         })
         .then((clientes) => {
            listaClientes.innerHTML = ""; // Limpa lista atual

            // Verifica se clientes é um array
            if (Array.isArray(clientes)) {
               clientes.forEach((cliente) => {
                  const itemCliente = criarItemCliente(cliente);
                  listaClientes.appendChild(itemCliente);
               });

               // Reaplica setup de eventos nos novos itens
               setupListItems(
                  ".cliente-item",
                  "form-cliente-panel",
                  "clienteForm",
                  "Cliente"
               );
            } else {
               console.error("Resposta inválida:", clientes);
               listaClientes.innerHTML = "<p>Nenhum cliente encontrado</p>";
            }
         })
         .catch((error) => {
            console.error("Erro ao carregar clientes:", error);
            listaClientes.innerHTML = `
               <div style="color: red; text-align: center; padding: 20px;">
                  Erro ao carregar clientes. 
                  <br>Detalhes: ${error.message}
                  <br><button onclick="carregarClientes()">Tentar Novamente</button>
               </div>
            `;
         });
   }

   // Carregar produtos
   function carregarProdutos() {
      fetch("../get_produtos.php")
         .then((response) => {
            if (!response.ok) {
               throw new Error("Erro na resposta do servidor");
            }
            return response.json();
         })
         .then((produtos) => {
            listaProdutos.innerHTML = ""; // Limpa lista atual

            // Verifica se produtos é um array
            if (Array.isArray(produtos)) {
               produtos.forEach((produto) => {
                  const itemProduto = criarItemProduto(produto);
                  listaProdutos.appendChild(itemProduto);
               });

               // Reaplica setup de eventos nos novos itens
               setupListItems(
                  ".produto-item",
                  "form-produto-panel",
                  "produtoForm",
                  "Produto"
               );
            } else {
               console.error("Resposta inválida:", produtos);
               listaProdutos.innerHTML = "<p>Nenhum produto encontrado</p>";
            }
         })
         .catch((error) => {
            console.error("Erro ao carregar produtos:", error);
            listaProdutos.innerHTML = `
               <div style="color: red; text-align: center; padding: 20px;">
                  Erro ao carregar produtos. 
                  <br>Detalhes: ${error.message}
                  <br><button onclick="carregarProdutos()">Tentar Novamente</button>
               </div>
            `;
         });
   }

   // Criar item de cliente para a lista
   function criarItemCliente(cliente) {
      const div = document.createElement("div");
      div.classList.add("list-item", "cliente-item");
      div.setAttribute("data-id", cliente.id);

      div.innerHTML = `
         <div class="list-item-content">
            <h4>${cliente.razao_social}</h4>
            <p>${cliente.telefone}</p>
         </div>
      `;

      return div;
   }

   // Criar item de produto para a lista
   function criarItemProduto(produto) {
      const div = document.createElement("div");
      div.classList.add("list-item", "produto-item");
      div.setAttribute("data-id", produto.id);

      div.innerHTML = `
         <div class="list-item-content">
            <h4>${produto.nome}</h4>
            <p>R$ ${parseFloat(produto.preco_venda).toFixed(2)}</p>
         </div>
      `;

      return div;
   }

   // Funções para manipular o modal
   function openModal(title, content) {
      modalTitle.textContent = title;

      // Limpa o conteúdo atual do modal
      while (modalContent.firstChild) {
         modalContent.removeChild(modalContent.firstChild);
      }

      // Adiciona o novo conteúdo
      modalContent.appendChild(content);

      // Abre o modal
      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Impede rolagem do body
   }

   function closeModal() {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = ""; // Restaura rolagem do body
   }

   // Adiciona evento para fechar o modal
   if (btnCloseModal) {
      btnCloseModal.addEventListener("click", closeModal);
   }

   // Fecha o modal ao clicar fora dele
   modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
         closeModal();
      }
   });

   // Sistema de abas
   const tabButtons = document.querySelectorAll(".tab-button");
   const tabContents = document.querySelectorAll(".tab-content");

   // Função para alternar entre abas
   function switchTab(tabId) {
      // Remove classe active de todos os botões e tabs
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((tab) => tab.classList.remove("active"));

      // Adiciona classe active ao botão clicado e à tab correspondente
      document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");

      // Carrega dados correspondentes
      if (tabId === "clientes") {
         carregarClientes();
      } else if (tabId === "produtos") {
         carregarProdutos();
      }
   }

   // Adiciona eventos de clique nas abas
   tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
         const tabId = button.getAttribute("data-tab");
         switchTab(tabId);
      });
   });

   // Carrega clientes na primeira inicialização
   carregarClientes();

   // Funções para manipular os itens da lista
   function setupListItems(itemSelector, formPanelId, formId, itemType) {
      const items = document.querySelectorAll(itemSelector);
      const formPanel = document.getElementById(formPanelId);
      const form = document.getElementById(formId);

      items.forEach((item) => {
         item.addEventListener("click", function () {
            // Remove a classe active de todos os itens
            document
               .querySelectorAll(itemSelector)
               .forEach((i) => i.classList.remove("active"));

            // Adiciona a classe active ao item clicado
            this.classList.add("active");

            const itemId = this.getAttribute("data-id");
            const itemTitle = this.querySelector("h4").textContent;

            // Busca dados do item selecionado via AJAX
            const endpoint =
               itemType === "Cliente"
                  ? "../page/get_cliente.php"
                  : "../page/get_produto.php";

            fetch(`${endpoint}?id=${itemId}`)
               .then((response) => response.json())
               .then((dados) => {
                  // Preenche o formulário com os dados
                  preencherFormulario(form, dados, itemType);

                  if (isMobile) {
                     // Em dispositivos móveis, exibe no modal
                     const formClone = form.cloneNode(true);
                     const modalFormId = `${formId}-modal`;
                     formClone.id = modalFormId;

                     // Atualiza os IDs dos campos no clone para evitar duplicidade
                     formClone.querySelectorAll("[id]").forEach((el) => {
                        const oldId = el.id;
                        const newId = `${oldId}-modal`;
                        el.id = newId;
                     });

                     // Define título e exibe o modal
                     let modalFormTitle = `Editar ${itemType}`;
                     openModal(modalFormTitle, formClone);

                     // Configura a validação e envio do formulário clonado
                     setupFormSubmit(modalFormId, closeModal);

                     // Configura botões de ação no modal
                     setupModalButtons(formClone);
                  } else {
                     // Em desktops, exibe no painel lateral
                     // Atualiza o ID no formulário
                     if (formId === "clienteForm") {
                        document.getElementById("cliente-id").textContent =
                           itemId;
                     } else if (formId === "produtoForm") {
                        document.getElementById("produto-id").textContent =
                           itemId;
                     }

                     // Exibe o formulário no painel
                     formPanel.style.display = "block";
                  }
               })
               .catch((error) => {
                  console.error(
                     `Erro ao buscar ${itemType.toLowerCase()}:`,
                     error
                  );
                  alert(`Erro ao carregar dados do ${itemType.toLowerCase()}`);
               });
         });
      });
   }

   // Preencher formulário com dados
   function preencherFormulario(form, dados, tipo) {
      if (tipo === "Cliente") {
         form.querySelector("#empresa").value = dados.razao_social;
         form.querySelector("#cnpj").value = dados.cpf_cnpj;
         form.querySelector("#ie").value = dados.inscricao_estadual || "";
         form.querySelector("#email").value = dados.email || "";
         form.querySelector("#telefone").value = dados.telefone;
         form.querySelector("#cep").value = dados.cep;
         form.querySelector("#rua").value = dados.rua;
         form.querySelector("#numero").value = dados.numero;
         form.querySelector("#bairro").value = dados.bairro;
         form.querySelector("#complemento").value = dados.complemento || "";
         form.querySelector("#cidade").value = dados.cidade;
         form.querySelector("#estado").value = dados.estado;
         form.querySelector("#observacoes").value = dados.observacoes || "";
      } else if (tipo === "Produto") {
         form.querySelector("#codigo-barras").value = dados.codigo_barras || "";
         form.querySelector("#nome-produto").value = dados.nome;
         form.querySelector("#unidade").value = dados.unidade;
         form.querySelector("#preco-venda").value = dados.preco_venda;
      }
   }

   // Botões "Novo Cliente" e "Novo Produto"
   function setupAddButtons(btnId, formId, formPanelId, itemType) {
      const addBtn = document.getElementById(btnId);
      if (addBtn) {
         addBtn.addEventListener("click", function () {
            const form = document.getElementById(formId);
            const formPanel = document.getElementById(formPanelId);

            // Remove seleção de itens ativos
            const itemSelector =
               btnId === "add-cliente" ? ".cliente-item" : ".produto-item";
            document
               .querySelectorAll(itemSelector)
               .forEach((i) => i.classList.remove("active"));

            // Reset do formulário
            form.reset();

            if (isMobile) {
               // Em dispositivos móveis, exibe no modal
               const formClone = form.cloneNode(true);
               const modalFormId = `${formId}-modal`;
               formClone.id = modalFormId;

               // Atualiza os IDs dos campos no clone
               formClone.querySelectorAll("[id]").forEach((el) => {
                  const oldId = el.id;
                  const newId = `${oldId}-modal`;
                  el.id = newId;
               });

               // Define título e exibe o modal
               let modalFormTitle = `Novo ${itemType}`;
               openModal(modalFormTitle, formClone);

               // Configura a validação e envio do formulário clonado
               setupFormSubmit(modalFormId, closeModal);

               // Configura botões de ação no modal
               setupModalButtons(formClone);
            } else {
               // Em desktops, exibe no painel lateral
               // Resetar o ID do formulário
               if (formId === "clienteForm") {
                  document.getElementById("cliente-id").textContent =
                     "Automático";
               } else if (formId === "produtoForm") {
                  document.getElementById("produto-id").textContent =
                     "Automático";
               }

               // Exibe o formulário vazio
               formPanel.style.display = "block";
            }
         });
      }
   }

   setupAddButtons(
      "add-cliente",
      "clienteForm",
      "form-cliente-panel",
      "Cliente"
   );
   setupAddButtons(
      "add-produto",
      "produtoForm",
      "form-produto-panel",
      "Produto"
   );

   // Configura botões do modal
   function setupModalButtons(form) {
      const btnCancel = form.querySelector(".btn-cancel");
      if (btnCancel) {
         btnCancel.addEventListener("click", function () {
            form.reset();
         });
      }

      // Adicionar botão de exclusão
      const btnExcluir = document.createElement("button");
      btnExcluir.type = "button";
      btnExcluir.textContent = "Excluir";
      btnExcluir.classList.add("btn-cancel");

      btnExcluir.addEventListener("click", function () {
         const itemId = form.querySelector('[name="id"]')?.value;
         const itemType = form.id.includes("cliente") ? "cliente" : "produto";

         if (itemId) {
            if (confirm(`Tem certeza que deseja excluir este ${itemType}?`)) {
               const excluirEndpoint =
                  itemType === "cliente"
                     ? "../page/excluir_cliente.php"
                     : "../page/excluir_produto.php";

               fetch(excluirEndpoint, {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: `id=${itemId}`,
               })
                  .then((response) => response.json())
                  .then((resultado) => {
                     if (resultado.sucesso) {
                        alert(resultado.mensagem);
                        closeModal();
                        // Recarrega a lista
                        if (itemType === "cliente") {
                           carregarClientes();
                        } else {
                           carregarProdutos();
                        }
                     } else {
                        alert("Erro: " + resultado.erros.join(", "));
                     }
                  })
                  .catch((error) => {
                     console.error("Erro:", error);
                     alert("Erro ao excluir item");
                  });
            }
         }
      });

      const formActions = form.querySelector(".form-actions");
      if (formActions && itemId) {
         formActions.insertBefore(btnExcluir, formActions.firstChild);
      }
   }

   // Configura envio do formulário
   function setupFormSubmit(formId, callback) {
      const form = document.getElementById(formId);
      if (form) {
         form.addEventListener("submit", function (e) {
            e.preventDefault();

            // Determina o tipo de formulário e endpoint
            const isCliente = formId.includes("cliente");
            const endpoint = isCliente
               ? "../page/processa_cliente.php"
               : "../page/processa_produto.php";

            // Prepara os dados do formulário
            const formData = new FormData(form);

            // Adiciona ID se estiver editando
            const itemId = form.querySelector('[name="id"]')?.value;
            if (itemId) {
               formData.append("id", itemId);
            }

            // Envia os dados via fetch
            fetch(endpoint, {
               method: "POST",
               body: formData,
            })
               .then((response) => response.json())
               .then((resultado) => {
                  if (resultado.sucesso) {
                     alert(resultado.mensagem);

                     // Fecha o modal se estiver no mobile
                     if (callback) {
                        callback();
                     }

                     // Recarrega a lista
                     if (isCliente) {
                        carregarClientes();
                     } else {
                        carregarProdutos();
                     }

                     // Limpa o formulário
                     form.reset();
                  } else {
                     // Exibe erros
                     const errosTexto = resultado.erros.join("\n");
                     alert("Erro ao salvar:\n" + errosTexto);
                  }
               })
               .catch((error) => {
                  console.error("Erro:", error);
                  alert("Erro ao processar formulário");
               });
         });
      }
   }

   // Configura formulários padrão (desktop)
   setupFormSubmit("clienteForm");
   setupFormSubmit("produtoForm");

   // Busca nos painéis de lista
   function setupSearch(searchId, itemSelector) {
      const searchInput = document.getElementById(searchId);
      if (searchInput) {
         searchInput.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const items = document.querySelectorAll(itemSelector);

            items.forEach((item) => {
               const text = item.textContent.toLowerCase();
               if (text.includes(searchTerm)) {
                  item.style.display = "block";
               } else {
                  item.style.display = "none";
               }
            });
         });
      }
   }

   setupSearch("busca-cliente", ".cliente-item");
   setupSearch("busca-produto", ".produto-item");

   // Formatação de campos
   function setupFieldMask(selector, maskFunction) {
      const fields = document.querySelectorAll(selector);
      fields.forEach((field) => {
         field.addEventListener("input", maskFunction);
      });
   }

   // Máscara de CEP
   function cepMask() {
      this.value = this.value
         .replace(/\D/g, "")
         .replace(/(\d{5})(\d)/, "$1-$2")
         .replace(/(-\d{3})\d+?$/, "$1");
   }

   // Máscara de CPF/CNPJ
   function cpfCnpjMask() {
      let value = this.value.replace(/\D/g, "");

      if (value.length <= 11) {
         // CPF
         value = value
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      } else {
         // CNPJ
         value = value
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
      }

      this.value = value;
   }

   // Máscara de Telefone
   function telefoneMask() {
      let value = this.value.replace(/\D/g, "");

      if (value.length > 10) {
         // Celular com 9 dígitos
         value = value
            .replace(/^(\d{2})(\d)/g, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .replace(/(-\d{4})\d+?$/, "$1");
      } else {
         // Telefone fixo
         value = value
            .replace(/^(\d{2})(\d)/g, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .replace(/(-\d{4})\d+?$/, "$1");
      }

      this.value = value;
   }

   // Aplicando máscaras
   setupFieldMask("[id^=cep]", cepMask);
   setupFieldMask("[id^=cnpj]", cpfCnpjMask);
   setupFieldMask("[id^=telefone]", telefoneMask);

   // Busca de CEP
   function setupCepSearch(
      btnId,
      cepInputId,
      ruaId,
      bairroId,
      cidadeId,
      estadoId,
      statusId
   ) {
      const btn = document.getElementById(btnId);
      if (!btn) return;

      btn.addEventListener("click", function () {
         const cepInput = document.getElementById(cepInputId);
         const statusEl = document.getElementById(statusId);

         if (!cepInput || !statusEl) return;

         const cep = cepInput.value.replace(/\D/g, "");

         if (cep.length !== 8) {
            statusEl.textContent = "CEP inválido";
            statusEl.className = "field-status error";
            return;
         }

         statusEl.textContent = "Buscando...";
         statusEl.className = "field-status loading";

         // Usando a API ViaCEP
         fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) => response.json())
            .then((data) => {
               if (data.erro) {
                  statusEl.textContent = "CEP não encontrado";
                  statusEl.className = "field-status error";
                  return;
               }

               document.getElementById(ruaId).value = data.logradouro;
               document.getElementById(bairroId).value = data.bairro;
               document.getElementById(cidadeId).value = data.localidade;
               document.getElementById(estadoId).value = data.uf;

               statusEl.textContent = "CEP encontrado";
               statusEl.className = "field-status success";
            })
            .catch((error) => {
               statusEl.textContent = "Erro ao buscar CEP";
               statusEl.className = "field-status error";
               console.error(error);
            });
      });
   }

   // Configura busca de CEP para o formulário padrão
   setupCepSearch(
      "buscar-cep",
      "cep",
      "rua",
      "bairro",
      "cidade",
      "estado",
      "cep-status"
   );

   // Observador de redimensionamento para atualizar a variável isMobile
   window.addEventListener("resize", function () {
      const wasMobile = isMobile;
      const newIsMobile = window.innerWidth < 769;

      // Se mudou o estado de mobile/desktop, recarrega a página
      if (wasMobile !== newIsMobile) {
         location.reload();
      }
   });
});
