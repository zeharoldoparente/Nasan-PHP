document.addEventListener("DOMContentLoaded", function () {
   // Detecta se é dispositivo móvel (tela menor que 769px)
   const isMobile = window.innerWidth < 769;

   // Referências para o modal
   const modalOverlay = document.getElementById("form-modal");
   const modalContent = document.getElementById("modal-content");
   const modalTitle = document.getElementById("modal-title");
   const btnCloseModal = document.querySelector(".btn-close-modal");

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
   }

   // Adiciona eventos de clique nas abas
   tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
         const tabId = button.getAttribute("data-tab");
         switchTab(tabId);

         // Carrega os dados quando a aba for alterada
         if (tabId === "clientes") {
            carregarClientes();
         } else if (tabId === "produtos") {
            carregarProdutos();
         }
      });
   });

   // Função para carregar a lista de clientes
   function carregarClientes() {
      fetch("../page/get_clientes.php")
         .then((response) => response.json())
         .then((clientes) => {
            const listaClientes = document.getElementById("lista-clientes");

            // Limpa a lista atual
            listaClientes.innerHTML = "";

            // Adiciona os clientes na lista
            clientes.forEach((cliente) => {
               const clienteItem = document.createElement("div");
               clienteItem.className = "list-item cliente-item";
               clienteItem.setAttribute("data-id", cliente.id);

               clienteItem.innerHTML = `
                  <div class="list-item-content">
                     <h4>${cliente.razao_social}</h4>
                     <p>${cliente.telefone}</p>
                  </div>
               `;

               listaClientes.appendChild(clienteItem);
            });

            // Configura os eventos para os novos itens
            setupListItems(
               ".cliente-item",
               "form-cliente-panel",
               "clienteForm",
               "Cliente"
            );
         })
         .catch((error) => console.error("Erro ao carregar clientes:", error));
   }

   // Função para carregar a lista de produtos
   function carregarProdutos() {
      fetch("../page/get_produtos.php")
         .then((response) => response.json())
         .then((produtos) => {
            const listaProdutos = document.getElementById("lista-produtos");

            // Limpa a lista atual
            listaProdutos.innerHTML = "";

            // Adiciona os produtos na lista
            produtos.forEach((produto) => {
               const produtoItem = document.createElement("div");
               produtoItem.className = "list-item produto-item";
               produtoItem.setAttribute("data-id", produto.id);

               // Formata o preço para exibição
               const precoFormatado = new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
               }).format(produto.preco_venda);

               // Layout simplificado: código - nome e preço abaixo
               produtoItem.innerHTML = `
               <div class="list-item-content">
                  <h4>${
                     produto.codigo_barras ? produto.codigo_barras + " - " : ""
                  }${produto.nome}</h4>
                  <p>${precoFormatado}</p>
               </div>
            `;

               listaProdutos.appendChild(produtoItem);
            });

            // Configura os eventos para os novos itens
            setupListItems(
               ".produto-item",
               "form-produto-panel",
               "produtoForm",
               "Produto"
            );
         })
         .catch((error) => console.error("Erro ao carregar produtos:", error));
   }

   // Função para carregar os detalhes de um cliente
   function carregarDetalhesCliente(idCliente) {
      fetch(`../page/get_cliente.php?id=${idCliente}`)
         .then((response) => response.json())
         .then((data) => {
            if (data.status === "success") {
               const cliente = data.data;

               // Preenche o formulário com os dados do cliente
               document.getElementById("cliente-id").textContent = cliente.id;
               document.getElementById("empresa").value = cliente.razao_social;
               document.getElementById("cnpj").value = cliente.cpf_cnpj;
               document.getElementById("ie").value =
                  cliente.inscricao_estadual || "";
               document.getElementById("email").value = cliente.email || "";
               document.getElementById("telefone").value = cliente.telefone;
               document.getElementById("cep").value = cliente.cep;
               document.getElementById("rua").value = cliente.rua;
               document.getElementById("numero").value = cliente.numero;
               document.getElementById("bairro").value = cliente.bairro;
               document.getElementById("complemento").value =
                  cliente.complemento || "";
               document.getElementById("cidade").value = cliente.cidade;
               document.getElementById("estado").value = cliente.estado;
               document.getElementById("observacoes").value =
                  cliente.observacoes || "";

               // Adiciona o campo oculto de ID ao formulário
               let idInput = document.getElementById("cliente-id-hidden");
               if (!idInput) {
                  idInput = document.createElement("input");
                  idInput.type = "hidden";
                  idInput.id = "cliente-id-hidden";
                  idInput.name = "id";
                  document.getElementById("clienteForm").appendChild(idInput);
               }
               idInput.value = cliente.id;
            } else {
               alert("Erro ao carregar detalhes do cliente: " + data.message);
            }
         })
         .catch((error) =>
            console.error("Erro ao carregar detalhes do cliente:", error)
         );
   }

   // Função para carregar detalhes do produto no modal
   function carregarDetalhesProdutoModal(idProduto, formClone) {
      fetch(`../page/get_produto.php?id=${idProduto}`)
         .then((response) => response.json())
         .then((data) => {
            if (data.status === "success") {
               const produto = data.data;

               // Verifica se o elemento existe antes de definir o valor
               const idElement = formClone.querySelector("#produto-id-modal");
               if (idElement) {
                  idElement.textContent = produto.id;
               }

               const codigoBarrasInput = formClone.querySelector(
                  "#codigo-barras-modal"
               );
               if (codigoBarrasInput) {
                  codigoBarrasInput.value = produto.codigo_barras || "";
               }

               const nomeProdutoInput = formClone.querySelector(
                  "#nome-produto-modal"
               );
               if (nomeProdutoInput) {
                  nomeProdutoInput.value = produto.nome;
               }

               const unidadeInput = formClone.querySelector("#unidade-modal");
               if (unidadeInput) {
                  unidadeInput.value = produto.unidade;
               }

               const precoVendaInput =
                  formClone.querySelector("#preco-venda-modal");
               if (precoVendaInput) {
                  precoVendaInput.value = produto.preco_venda;
               }
            } else {
               alert("Erro ao carregar detalhes do produto: " + data.message);
            }
         })
         .catch((error) => {
            console.error(
               "Erro ao carregar detalhes do produto no modal:",
               error
            );
         });
   }

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

            // Adiciona botão de exclusão se ainda não existir
            let btnExcluir = form.querySelector(".btn-delete");
            if (!btnExcluir) {
               btnExcluir = document.createElement("button");
               btnExcluir.type = "button";
               btnExcluir.className = "btn-cancel btn-delete";
               btnExcluir.textContent = "Excluir";
               btnExcluir.style.backgroundColor = "#dc2626";
               btnExcluir.style.color = "white";
               btnExcluir.style.marginRight = "auto";

               form.querySelector(".form-actions").prepend(btnExcluir);
            }

            // Configura o evento de exclusão
            btnExcluir.onclick = function () {
               if (
                  confirm(
                     `Tem certeza que deseja excluir este ${itemType.toLowerCase()}?`
                  )
               ) {
                  excluirItem(itemId, itemType.toLowerCase());
               }
            };

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
               // Adiciona o campo oculto de ID ao formulário clonado
               let idInput = document.createElement("input");
               idInput.type = "hidden";
               idInput.id = `${itemType.toLowerCase()}-id-hidden-modal`;
               idInput.name = "id";
               idInput.value = itemId;
               formClone.appendChild(idInput);
               // Verifica se os campos de ID existem e, se não, adiciona-os
               const idDisplayClass = formClone.querySelector(".id-display");
               if (idDisplayClass) {
                  const idValueSpan = idDisplayClass.querySelector(".id-value");
                  if (idValueSpan) {
                     idValueSpan.id =
                        itemType === "Cliente"
                           ? "cliente-id-modal"
                           : "produto-id-modal";
                     idValueSpan.textContent = itemId;
                  }
               }

               // Adiciona botão de exclusão ao modal
               let btnExcluirModal = formClone.querySelector(".btn-delete");
               if (!btnExcluirModal) {
                  btnExcluirModal = document.createElement("button");
                  btnExcluirModal.type = "button";
                  btnExcluirModal.className = "btn-cancel btn-delete";
                  btnExcluirModal.textContent = "Excluir";
                  btnExcluirModal.style.backgroundColor = "#dc2626";
                  btnExcluirModal.style.color = "white";
                  btnExcluirModal.style.marginRight = "auto";

                  formClone
                     .querySelector(".form-actions")
                     .prepend(btnExcluirModal);
               }

               // Configura o evento de exclusão no modal
               btnExcluirModal.onclick = function () {
                  if (
                     confirm(
                        `Tem certeza que deseja excluir este ${itemType.toLowerCase()}?`
                     )
                  ) {
                     excluirItem(itemId, itemType.toLowerCase());
                     closeModal();
                  }
               };

               // Define título e exibe o modal
               let modalFormTitle = `Editar ${itemType}`;
               openModal(modalFormTitle, formClone);

               // Configura a validação e envio do formulário clonado
               setupFormSubmit(modalFormId, closeModal);

               // Configura botões de ação no modal
               setupModalButtons(formClone);

               // Carrega os dados do item no modal
               if (itemType === "Cliente") {
                  carregarDetalhesClienteModal(itemId, formClone);
               } else if (itemType === "Produto") {
                  carregarDetalhesProdutoModal(itemId, formClone);
               }
            } else {
               // Em desktops, exibe no painel lateral
               if (itemType === "Cliente") {
                  carregarDetalhesCliente(itemId);
               } else if (itemType === "Produto") {
                  carregarDetalhesProduto(itemId);
               }

               // Exibe o formulário no painel
               formPanel.style.display = "block";
            }
         });
      });
   }

   // Substitua a função carregarDetalhesClienteModal pela seguinte:
   function carregarDetalhesClienteModal(idCliente, formClone) {
      fetch(`get_cliente.php?id=${idCliente}`)
         .then((response) => response.json())
         .then((data) => {
            if (data.status === "success") {
               const cliente = data.data;

               // Tenta definir o ID, mas não falha se o elemento não existir
               try {
                  const idElement =
                     formClone.querySelector("#cliente-id-modal");
                  if (idElement) {
                     idElement.textContent = cliente.id;
                  }
               } catch (e) {
                  console.log("Elemento ID não encontrado no modal, ignorando");
               }

               // Preenche os demais campos, verificando se existem
               const campos = [
                  { id: "#empresa-modal", valor: cliente.razao_social },
                  { id: "#cnpj-modal", valor: cliente.cpf_cnpj },
                  { id: "#ie-modal", valor: cliente.inscricao_estadual || "" },
                  { id: "#email-modal", valor: cliente.email || "" },
                  { id: "#telefone-modal", valor: cliente.telefone },
                  { id: "#cep-modal", valor: cliente.cep },
                  { id: "#rua-modal", valor: cliente.rua },
                  { id: "#numero-modal", valor: cliente.numero },
                  { id: "#bairro-modal", valor: cliente.bairro },
                  {
                     id: "#complemento-modal",
                     valor: cliente.complemento || "",
                  },
                  { id: "#cidade-modal", valor: cliente.cidade },
                  { id: "#estado-modal", valor: cliente.estado },
                  {
                     id: "#observacoes-modal",
                     valor: cliente.observacoes || "",
                  },
               ];

               campos.forEach((campo) => {
                  const elemento = formClone.querySelector(campo.id);
                  if (elemento) {
                     elemento.value = campo.valor;
                  }
               });

               // Configura o botão de buscar CEP no modal
               setupCepSearch(
                  "buscar-cep-modal",
                  "cep-modal",
                  "rua-modal",
                  "bairro-modal",
                  "cidade-modal",
                  "estado-modal",
                  "cep-status-modal"
               );

               // Aplica máscaras nos campos do modal
               setupFieldMask("#cep-modal", cepMask);
               setupFieldMask("#cnpj-modal", cpfCnpjMask);
               setupFieldMask("#telefone-modal", telefoneMask);
            } else {
               alert("Erro ao carregar detalhes do cliente: " + data.message);
            }
         })
         .catch((error) =>
            console.error(
               "Erro ao carregar detalhes do cliente no modal:",
               error
            )
         );
   }

   // Substitua a função carregarDetalhesProdutoModal pela seguinte:
   function carregarDetalhesProdutoModal(idProduto, formClone) {
      fetch(`get_produto.php?id=${idProduto}`)
         .then((response) => response.json())
         .then((data) => {
            if (data.status === "success") {
               const produto = data.data;

               // Tenta definir o ID, mas não falha se o elemento não existir
               try {
                  const idElement =
                     formClone.querySelector("#produto-id-modal");
                  if (idElement) {
                     idElement.textContent = produto.id;
                  }
               } catch (e) {
                  console.log("Elemento ID não encontrado no modal, ignorando");
               }

               // Preenche os demais campos, verificando se existem
               const campos = [
                  {
                     id: "#codigo-barras-modal",
                     valor: produto.codigo_barras || "",
                  },
                  { id: "#nome-produto-modal", valor: produto.nome },
                  { id: "#unidade-modal", valor: produto.unidade },
                  { id: "#preco-venda-modal", valor: produto.preco_venda },
               ];

               campos.forEach((campo) => {
                  const elemento = formClone.querySelector(campo.id);
                  if (elemento) {
                     elemento.value = campo.valor;
                  }
               });
            } else {
               alert("Erro ao carregar detalhes do produto: " + data.message);
            }
         })
         .catch((error) =>
            console.error(
               "Erro ao carregar detalhes do produto no modal:",
               error
            )
         );
   }

   // Função para excluir um item (cliente ou produto)
   function excluirItem(id, tipo) {
      const url =
         tipo === "cliente" ? "delete_cliente.php" : "delete_produto.php";

      const formData = new FormData();
      formData.append("id", id);

      fetch(url, {
         method: "POST",
         body: formData,
      })
         .then((response) => response.json())
         .then((data) => {
            if (data.status === "success") {
               alert(data.message);

               // Recarrega a lista correspondente
               if (tipo === "cliente") {
                  carregarClientes();
                  document.getElementById("clienteForm").reset();
                  document.getElementById("form-cliente-panel").style.display =
                     "none";
               } else {
                  carregarProdutos();
                  document.getElementById("produtoForm").reset();
                  document.getElementById("form-produto-panel").style.display =
                     "none";
               }
            } else {
               alert("Erro: " + data.message);
            }
         })
         .catch((error) => {
            console.error("Erro ao excluir item:", error);
            alert(
               "Erro ao excluir item. Verifique o console para mais detalhes."
            );
         });
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

            // Remove o campo oculto de ID se existir
            const idInput =
               formId === "clienteForm"
                  ? document.getElementById("cliente-id-hidden")
                  : document.getElementById("produto-id-hidden");

            if (idInput) {
               idInput.remove();
            }

            // Remove o botão de excluir se existir
            const btnExcluir = form.querySelector(".btn-delete");
            if (btnExcluir) {
               btnExcluir.remove();
            }

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

               // Reset ao formulário
               formClone.reset();

               // Remove o botão de excluir do modal se existir
               const btnExcluirModal = formClone.querySelector(".btn-delete");
               if (btnExcluirModal) {
                  btnExcluirModal.remove();
               }

               // Define título e exibe o modal
               let modalFormTitle = `Novo ${itemType}`;
               openModal(modalFormTitle, formClone);

               // Configura máscaras nos campos do modal
               if (itemType === "Cliente") {
                  setupFieldMask("#cep-modal", cepMask);
                  setupFieldMask("#cnpj-modal", cpfCnpjMask);
                  setupFieldMask("#telefone-modal", telefoneMask);

                  // Configura o botão de buscar CEP no modal
                  setupCepSearch(
                     "buscar-cep-modal",
                     "cep-modal",
                     "rua-modal",
                     "bairro-modal",
                     "cidade-modal",
                     "estado-modal",
                     "cep-status-modal"
                  );
               }

               // Configura a validação e envio do formulário clonado
               setupFormSubmit(modalFormId, closeModal);

               // Configura botões de ação no modal
               setupModalButtons(formClone);
            } else {
               // Em desktops, exibe no painel lateral
               form.reset();

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
      const btnCancel = form.querySelector(".btn-cancel:not(.btn-delete)");
      if (btnCancel) {
         btnCancel.addEventListener("click", function () {
            form.reset();
         });
      }
   }

   // Configura envio do formulário
   function setupFormSubmit(formId, callback) {
      const form = document.getElementById(formId);
      if (form) {
         form.addEventListener("submit", function (e) {
            e.preventDefault();

            // Determina se é o formulário de cliente ou produto
            const isCliente = formId.includes("cliente");
            const isProduto = formId.includes("produto");

            // Cria um objeto FormData com os dados do formulário
            const formData = new FormData(this);

            // Define a URL para onde os dados serão enviados
            const url = isCliente
               ? "processa_cliente.php"
               : "processa_produto.php";

            // Realiza o envio dos dados via AJAX
            fetch(url, {
               method: "POST",
               body: formData,
            })
               .then((response) => response.json())
               .then((data) => {
                  if (data.status === "success") {
                     // Exibe mensagem de sucesso
                     alert(data.message);

                     // Recarrega a lista correspondente
                     if (isCliente) {
                        carregarClientes();
                     } else if (isProduto) {
                        carregarProdutos();
                     }

                     // Fecha o modal após enviar (se estiver no mobile)
                     if (isMobile && callback) {
                        callback();
                     }

                     // Reset ao formulário
                     form.reset();

                     // Se não for modal, oculta o painel de formulário
                     if (!formId.includes("modal")) {
                        if (isCliente) {
                           document.getElementById(
                              "form-cliente-panel"
                           ).style.display = "none";
                        } else if (isProduto) {
                           document.getElementById(
                              "form-produto-panel"
                           ).style.display = "none";
                        }
                     }
                  } else {
                     // Exibe mensagem de erro
                     alert("Erro: " + data.message);
                  }
               })
               .catch((error) => {
                  console.error("Erro ao enviar formulário:", error);
                  alert(
                     "Erro ao enviar formulário. Verifique o console para mais detalhes."
                  );
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

   // Carrega os dados iniciais quando a página é carregada
   carregarClientes();

   // Configura os eventos do botão Limpar
   const btnsCancel = document.querySelectorAll(".btn-cancel:not(.btn-delete)");
   btnsCancel.forEach((btn) => {
      btn.addEventListener("click", function () {
         const form = this.closest("form");
         if (form) {
            form.reset();
         }
      });
   });
});
