// Sistema de modais personalizados
if (typeof ModalCustom === "undefined") {
   class ModalCustom {
      constructor() {
         this.init();
      }

      init() {
         // Criar elementos do modal
         this.createModalElements();

         // Adicionar event listeners
         this.setupEventListeners();
      }

      createModalElements() {
         // Criar o overlay do modal
         this.overlay = document.createElement("div");
         this.overlay.className = "modal-custom-overlay";

         // Criar o container do modal
         this.container = document.createElement("div");
         this.container.className = "modal-custom-container";

         // Criar o cabeçalho do modal
         this.header = document.createElement("div");
         this.header.className = "modal-custom-header";

         // Criar o título
         this.title = document.createElement("h3");
         this.title.textContent = "Aviso";

         // Criar o botão de fechar
         this.closeButton = document.createElement("button");
         this.closeButton.className = "btn-close-modal-custom";
         this.closeButton.innerHTML = '<i class="bi bi-x-lg"></i>';

         // Montar o cabeçalho
         this.header.appendChild(this.title);
         this.header.appendChild(this.closeButton);

         // Criar o conteúdo do modal
         this.content = document.createElement("div");
         this.content.className = "modal-custom-content";

         // Criar o ícone
         this.icon = document.createElement("div");
         this.icon.className = "modal-custom-icon";

         // Criar a mensagem
         this.message = document.createElement("div");
         this.message.className = "modal-custom-message";

         // Criar a área de botões
         this.actions = document.createElement("div");
         this.actions.className = "modal-custom-actions";

         // Montar o conteúdo
         this.content.appendChild(this.icon);
         this.content.appendChild(this.message);
         this.content.appendChild(this.actions);

         // Montar o modal
         this.container.appendChild(this.header);
         this.container.appendChild(this.content);
         this.overlay.appendChild(this.container);

         // Adicionar ao body
         document.body.appendChild(this.overlay);
      }

      setupEventListeners() {
         // Fechar ao clicar no X
         this.closeButton.addEventListener("click", () => this.close());

         // Fechar ao clicar no overlay (fora do modal)
         this.overlay.addEventListener("click", (e) => {
            if (e.target === this.overlay) {
               this.close();
            }
         });

         // Fechar com a tecla ESC
         document.addEventListener("keydown", (e) => {
            if (
               e.key === "Escape" &&
               this.overlay.classList.contains("active")
            ) {
               this.close();
            }
         });
      }

      // Métodos públicos
      alert(message, title = "Aviso", type = "info") {
         return new Promise((resolve) => {
            // Configurar o modal
            this.title.textContent = title;
            this.message.textContent = message;

            // Limpar ações anteriores
            this.actions.innerHTML = "";

            // Configurar o ícone
            this.setIcon(type);

            // Adicionar botão de OK
            const okButton = document.createElement("button");
            okButton.className = "btn-modal-custom btn-modal-confirm";
            okButton.textContent = "OK";
            okButton.addEventListener("click", () => {
               this.close();
               resolve(true);
            });

            this.actions.appendChild(okButton);

            // Abrir o modal
            this.open();

            // Focar no botão OK
            setTimeout(() => okButton.focus(), 100);
         });
      }

      confirm(message, title = "Confirmação", type = "warning") {
         return new Promise((resolve) => {
            // Configurar o modal
            this.title.textContent = title;
            this.message.textContent = message;

            // Limpar ações anteriores
            this.actions.innerHTML = "";

            // Configurar o ícone
            this.setIcon(type);

            // Adicionar botão de Não
            const noButton = document.createElement("button");
            noButton.className = "btn-modal-custom btn-modal-cancel";
            noButton.textContent = "Não";
            noButton.addEventListener("click", () => {
               this.close();
               resolve(false);
            });

            // Adicionar botão de Sim
            const yesButton = document.createElement("button");
            yesButton.className = "btn-modal-custom btn-modal-danger";
            yesButton.textContent = "Sim";
            yesButton.addEventListener("click", () => {
               this.close();
               resolve(true);
            });

            this.actions.appendChild(noButton);
            this.actions.appendChild(yesButton);

            // Abrir o modal
            this.open();

            // Focar no botão Não por segurança
            setTimeout(() => noButton.focus(), 100);
         });
      }

      success(message, title = "Sucesso") {
         return this.alert(message, title, "success");
      }

      error(message, title = "Erro") {
         return this.alert(message, title, "error");
      }

      setIcon(type) {
         this.icon.className = "modal-custom-icon " + type;

         switch (type) {
            case "success":
               this.icon.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
               break;
            case "error":
               this.icon.innerHTML = '<i class="bi bi-x-circle-fill"></i>';
               break;
            case "warning":
               this.icon.innerHTML =
                  '<i class="bi bi-exclamation-triangle-fill"></i>';
               break;
            case "info":
            default:
               this.icon.innerHTML = '<i class="bi bi-info-circle-fill"></i>';
               break;
         }
      }

      open() {
         this.overlay.classList.add("active");
         document.body.style.overflow = "hidden"; // Bloquear scroll
      }

      close() {
         this.overlay.classList.remove("active");
         document.body.style.overflow = ""; // Restaurar scroll
      }
   }

   // Inicializar o sistema de modais
   window.customModal = new ModalCustom();
}

// Sobrescrever os métodos nativos alert e confirm
window.originalAlert = window.alert;
window.originalConfirm = window.confirm;

window.alert = function (message) {
   return customModal.alert(message);
};

window.confirm = function (message) {
   return customModal.confirm(message);
};

document.addEventListener("DOMContentLoaded", function () {
   // ===== TAB SWITCHING =====
   const tabButtons = document.querySelectorAll(".tab-button");
   const tabContents = document.querySelectorAll(".tab-content");

   tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
         // Remove active class from all buttons and contents
         tabButtons.forEach((btn) => btn.classList.remove("active"));
         tabContents.forEach((content) => content.classList.remove("active"));

         // Add active class to current button and corresponding content
         button.classList.add("active");
         const tabId = button.getAttribute("data-tab");
         document.getElementById(`${tabId}-tab`).classList.add("active");
      });
   });

   // ===== CLIENTE FUNCTIONS =====
   loadClientes();
   setupClienteListeners();

   // ===== PRODUTO FUNCTIONS =====
   loadProdutos();
   setupProdutoListeners();

   // ===== MODAL HANDLING FOR MOBILE =====
   setupModalHandlers();
});

// ===== CLIENTE FUNCTIONS =====

function loadClientes() {
   // Adicionar um indicador de carregamento
   const listaClientes = document.getElementById("lista-clientes");
   listaClientes.innerHTML =
      '<div class="loading-indicator">Carregando clientes...</div>';

   fetch("get_clientes.php")
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao carregar clientes");
         }
         return response.json();
      })
      .then((clientes) => {
         listaClientes.innerHTML = "";

         if (clientes.length === 0) {
            listaClientes.innerHTML =
               '<div class="empty-list">Nenhum cliente encontrado</div>';
            return;
         }

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

         // Adiciona event listeners aos novos itens
         attachClienteItemListeners();
      })
      .catch((error) => {
         console.error("Erro ao carregar clientes:", error);
         listaClientes.innerHTML =
            '<div class="error-message">Erro ao carregar clientes. Tente novamente.</div>';
         customModal.error(
            "Erro ao carregar a lista de clientes. Verifique a conexão com o banco de dados."
         );
      });
}

function setupClienteListeners() {
   // Event listener para busca de clientes
   const buscaCliente = document.getElementById("busca-cliente");
   buscaCliente.addEventListener("input", () => {
      const searchTerm = buscaCliente.value.toLowerCase();
      const clienteItems = document.querySelectorAll(".cliente-item");

      clienteItems.forEach((item) => {
         const clienteName = item.querySelector("h4").textContent.toLowerCase();
         if (clienteName.includes(searchTerm)) {
            item.style.display = "flex";
         } else {
            item.style.display = "none";
         }
      });
   });

   // Event listener para adicionar novo cliente
   const addClienteBtn = document.getElementById("add-cliente");
   addClienteBtn.addEventListener("click", () => {
      resetClienteForm();
      document.getElementById("cliente-id").textContent = "Automático";

      // Esconder o botão de excluir
      document.getElementById("btn-delete-cliente").style.display = "none";

      // Para mobile, abre o modal
      if (window.innerWidth <= 768) {
         // Para novo cadastro, não precisa esperar dados, abre o modal diretamente
         openFormModal("cliente", true);
      }
   });

   // Event listener para botão CEP
   const buscarCepBtn = document.getElementById("buscar-cep");
   buscarCepBtn.addEventListener("click", () => {
      const cep = document.getElementById("cep").value.replace(/\D/g, "");
      if (cep.length === 8) {
         fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) => response.json())
            .then((data) => {
               if (!data.erro) {
                  document.getElementById("rua").value = data.logradouro;
                  document.getElementById("bairro").value = data.bairro;
                  document.getElementById("cidade").value = data.localidade;
                  document.getElementById("estado").value = data.uf;
                  document.getElementById("cep-status").innerHTML = "✓";
                  document.getElementById("cep-status").className =
                     "field-status valid";
               } else {
                  document.getElementById("cep-status").innerHTML = "✗";
                  document.getElementById("cep-status").className =
                     "field-status invalid";
               }
            })
            .catch(() => {
               document.getElementById("cep-status").innerHTML = "✗";
               document.getElementById("cep-status").className =
                  "field-status invalid";
            });
      }
   });

   // Event listeners para formulário de cliente - ATUALIZADO PARA USAR MODAIS
   const clienteForm = document.getElementById("clienteForm");
   if (clienteForm) {
      clienteForm.addEventListener("submit", function (e) {
         e.preventDefault();

         const formData = new FormData(clienteForm);
         const clienteId = document.getElementById("cliente-id").textContent;

         if (clienteId !== "Automático") {
            formData.append("id", clienteId);
         }

         fetch("processa_cliente.php", {
            method: "POST",
            body: formData,
         })
            .then((response) => {
               if (!response.ok) {
                  throw new Error(
                     "Erro na resposta da rede ao processar cliente"
                  );
               }
               return response.json();
            })
            .then((data) => {
               if (data.status === "success") {
                  // Atualiza a lista de clientes
                  loadClientes();

                  // Se for um novo cliente, limpa o formulário
                  if (clienteId === "Automático") {
                     resetClienteForm();
                  }

                  // Fecha o modal em dispositivos móveis
                  if (window.innerWidth <= 768) {
                     closeFormModal();
                  }

                  // Mostra mensagem de sucesso
                  customModal.success(data.message);
               } else {
                  customModal.error(data.message);
               }
            })
            .catch((error) => {
               console.error("Erro ao salvar cliente:", error);
               customModal.error("Erro ao salvar cliente. Tente novamente.");
            });
      });
   }

   // Botão cancelar/limpar
   const cancelarBtns = document.querySelectorAll("#clienteForm .btn-cancel");
   cancelarBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
         resetClienteForm();
         if (window.innerWidth <= 768) {
            closeFormModal();
         }
      });
   });

   // Event listener para botão excluir cliente
   const deleteClienteBtn = document.getElementById("btn-delete-cliente");
   if (deleteClienteBtn) {
      deleteClienteBtn.addEventListener("click", function () {
         const clienteId = document.getElementById("cliente-id").textContent;
         if (clienteId !== "Automático") {
            deleteCliente(clienteId);
         }
      });
   }
}

function attachClienteItemListeners() {
   // Click em um cliente da lista
   const clienteItems = document.querySelectorAll(".cliente-item");
   clienteItems.forEach((item) => {
      item.addEventListener("click", function () {
         const clienteId = this.getAttribute("data-id");

         // Para mobile, carrega os dados ANTES de abrir o modal
         if (window.innerWidth <= 768) {
            // Primeiro carrega os dados, depois abre o modal quando estiver pronto
            loadClienteDetailsForMobile(clienteId);
         } else {
            // Em desktop, carrega normalmente
            loadClienteDetails(clienteId);
         }
      });
   });
}

// Função específica para carregar dados de cliente no mobile
function loadClienteDetailsForMobile(clienteId) {
   // Mostra um indicador de carregamento
   const modalOverlay = document.getElementById("form-modal");
   const modalContent = document.getElementById("modal-content");
   modalContent.innerHTML =
      '<div class="loading-indicator">Carregando...</div>';
   modalOverlay.classList.add("active");

   fetch(`get_cliente.php?id=${clienteId}`)
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao carregar cliente");
         }
         return response.json();
      })
      .then((data) => {
         if (data.status === "success") {
            const cliente = data.data;

            // Primeiro atualiza o formulário principal com os dados
            document.getElementById("cliente-id").textContent = cliente.id;
            document.getElementById("empresa").value = cliente.razao_social;
            document.getElementById("cnpj").value = cliente.cpf_cnpj;
            document.getElementById("ie").value = cliente.inscricao_estadual;
            document.getElementById("email").value = cliente.email;
            document.getElementById("telefone").value = cliente.telefone;
            document.getElementById("cep").value = cliente.cep;
            document.getElementById("rua").value = cliente.rua;
            document.getElementById("numero").value = cliente.numero;
            document.getElementById("bairro").value = cliente.bairro;
            document.getElementById("complemento").value = cliente.complemento;
            document.getElementById("cidade").value = cliente.cidade;
            document.getElementById("estado").value = cliente.estado;
            document.getElementById("observacoes").value = cliente.observacoes;

            // Mostra o botão de excluir
            document.getElementById("btn-delete-cliente").style.display =
               "block";

            // Só abre o modal depois que os dados forem carregados
            openFormModal("cliente", true);
         } else {
            closeFormModal();
            customModal.error(
               "Erro ao carregar dados do cliente: " + data.message
            );
         }
      })
      .catch((error) => {
         closeFormModal();
         console.error("Erro ao carregar cliente:", error);
         customModal.error("Erro ao carregar cliente. Tente novamente.");
      });
}

function loadClienteDetails(clienteId) {
   fetch(`get_cliente.php?id=${clienteId}`)
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao carregar cliente");
         }
         return response.json();
      })
      .then((data) => {
         if (data.status === "success") {
            const cliente = data.data;

            // Preenche o formulário com os dados do cliente
            document.getElementById("cliente-id").textContent = cliente.id;
            document.getElementById("empresa").value = cliente.razao_social;
            document.getElementById("cnpj").value = cliente.cpf_cnpj;
            document.getElementById("ie").value = cliente.inscricao_estadual;
            document.getElementById("email").value = cliente.email;
            document.getElementById("telefone").value = cliente.telefone;
            document.getElementById("cep").value = cliente.cep;
            document.getElementById("rua").value = cliente.rua;
            document.getElementById("numero").value = cliente.numero;
            document.getElementById("bairro").value = cliente.bairro;
            document.getElementById("complemento").value = cliente.complemento;
            document.getElementById("cidade").value = cliente.cidade;
            document.getElementById("estado").value = cliente.estado;
            document.getElementById("observacoes").value = cliente.observacoes;

            // Mostra o botão de excluir
            document.getElementById("btn-delete-cliente").style.display =
               "block";
         } else {
            console.error("Erro ao carregar dados do cliente:", data.message);
            customModal.error(
               "Erro ao carregar dados do cliente: " + data.message
            );
         }
      })
      .catch((error) => {
         console.error("Erro ao carregar cliente:", error);
         customModal.error("Erro ao carregar cliente. Tente novamente.");
      });
}

// FUNÇÃO ATUALIZADA para usar modais personalizados
function deleteCliente(clienteId) {
   customModal
      .confirm(
         "Tem certeza que deseja excluir este cliente?",
         "Confirmar exclusão",
         "warning"
      )
      .then((confirmed) => {
         if (confirmed) {
            const formData = new FormData();
            formData.append("id", clienteId);

            fetch("delete_cliente.php", {
               method: "POST",
               body: formData,
            })
               .then((response) => {
                  if (!response.ok) {
                     throw new Error(
                        "Erro na resposta da rede ao excluir cliente"
                     );
                  }
                  return response.json();
               })
               .then((data) => {
                  if (data.status === "success") {
                     // Atualiza a lista de clientes
                     loadClientes();

                     // Reseta o formulário pois o cliente foi excluído
                     resetClienteForm();

                     // Fecha o modal em dispositivos móveis
                     if (window.innerWidth <= 768) {
                        closeFormModal();
                     }

                     // Mostra mensagem de sucesso
                     customModal.success("Cliente excluído com sucesso!");
                  } else {
                     customModal.error(
                        "Erro ao excluir cliente: " + data.message
                     );
                  }
               })
               .catch((error) => {
                  console.error("Erro ao excluir cliente:", error);
                  customModal.error(
                     "Erro ao excluir cliente. Tente novamente."
                  );
               });
         }
      });
}

function resetClienteForm() {
   document.getElementById("clienteForm").reset();
   document.getElementById("cliente-id").textContent = "Automático";
   document.getElementById("cep-status").innerHTML = "";
   document.getElementById("cep-status").className = "field-status";
   document.getElementById("status-cliente").innerHTML = "";
   document.getElementById("status-cliente").className = "status-message";
   // Esconde o botão de excluir
   document.getElementById("btn-delete-cliente").style.display = "none";
}

// ===== PRODUTO FUNCTIONS =====

function loadProdutos() {
   // Adicionar um indicador de carregamento
   const listaProdutos = document.getElementById("lista-produtos");
   listaProdutos.innerHTML =
      '<div class="loading-indicator">Carregando produtos...</div>';

   fetch("get_produtos.php")
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao carregar produtos");
         }
         return response.json();
      })
      .then((produtos) => {
         listaProdutos.innerHTML = "";

         if (produtos.length === 0) {
            listaProdutos.innerHTML =
               '<div class="empty-list">Nenhum produto encontrado</div>';
            return;
         }

         produtos.forEach((produto) => {
            const produtoItem = document.createElement("div");
            produtoItem.className = "list-item produto-item";
            produtoItem.setAttribute("data-id", produto.id);

            // Formatação do preço
            const preco = parseFloat(produto.preco_venda).toLocaleString(
               "pt-BR",
               {
                  style: "currency",
                  currency: "BRL",
               }
            );

            // Mostrar código de barras e nome do produto
            const codigoBarras = produto.codigo_barras || "Sem código";

            produtoItem.innerHTML = `
               <div class="list-item-content">
                   <h4>${codigoBarras} - ${produto.nome}</h4>
                   <p>${preco}</p>
               </div>
           `;
            listaProdutos.appendChild(produtoItem);
         });

         // Adiciona event listeners aos novos itens
         attachProdutoItemListeners();
      })
      .catch((error) => {
         console.error("Erro ao carregar produtos:", error);
         listaProdutos.innerHTML =
            '<div class="error-message">Erro ao carregar produtos. Tente novamente.</div>';
         customModal.error(
            "Erro ao carregar a lista de produtos. Verifique a conexão com o banco de dados."
         );
      });
}

function setupProdutoListeners() {
   // Event listener para busca de produtos
   const buscaProduto = document.getElementById("busca-produto");
   buscaProduto.addEventListener("input", () => {
      const searchTerm = buscaProduto.value.toLowerCase();
      const produtoItems = document.querySelectorAll(".produto-item");

      produtoItems.forEach((item) => {
         const produtoName = item.querySelector("h4").textContent.toLowerCase();
         if (produtoName.includes(searchTerm)) {
            item.style.display = "flex";
         } else {
            item.style.display = "none";
         }
      });
   });

   // Event listener para adicionar novo produto
   const addProdutoBtn = document.getElementById("add-produto");
   addProdutoBtn.addEventListener("click", () => {
      resetProdutoForm();
      document.getElementById("produto-id").textContent = "Automático";

      // Esconder o botão de excluir
      document.getElementById("btn-delete-produto").style.display = "none";

      // Para mobile, abre o modal
      if (window.innerWidth <= 768) {
         // Para novo cadastro, não precisa esperar dados, abre o modal diretamente
         openFormModal("produto", true);
      }
   });

   // Event listeners para formulário de produto - ATUALIZADO PARA USAR MODAIS
   const produtoForm = document.getElementById("produtoForm");
   if (produtoForm) {
      produtoForm.addEventListener("submit", function (e) {
         e.preventDefault();

         const formData = new FormData(produtoForm);
         const produtoId = document.getElementById("produto-id").textContent;

         if (produtoId !== "Automático") {
            formData.append("id", produtoId);
         }

         fetch("processa_produto.php", {
            method: "POST",
            body: formData,
         })
            .then((response) => {
               if (!response.ok) {
                  throw new Error(
                     "Erro na resposta da rede ao processar produto"
                  );
               }
               return response.json();
            })
            .then((data) => {
               if (data.status === "success") {
                  // Atualiza a lista de produtos
                  loadProdutos();

                  // Se for um novo produto, limpa o formulário
                  if (produtoId === "Automático") {
                     resetProdutoForm();
                  }

                  // Fecha o modal em dispositivos móveis
                  if (window.innerWidth <= 768) {
                     closeFormModal();
                  }

                  // Mostra mensagem de sucesso
                  customModal.success(data.message);
               } else {
                  customModal.error(data.message);
               }
            })
            .catch((error) => {
               console.error("Erro ao salvar produto:", error);
               customModal.error("Erro ao salvar produto. Tente novamente.");
            });
      });
   }

   // Botão cancelar/limpar
   const cancelarBtns = document.querySelectorAll("#produtoForm .btn-cancel");
   cancelarBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
         resetProdutoForm();
         if (window.innerWidth <= 768) {
            closeFormModal();
         }
      });
   });

   // Event listener para botão excluir produto
   const deleteProdutoBtn = document.getElementById("btn-delete-produto");
   if (deleteProdutoBtn) {
      deleteProdutoBtn.addEventListener("click", function () {
         const produtoId = document.getElementById("produto-id").textContent;
         if (produtoId !== "Automático") {
            deleteProduto(produtoId);
         }
      });
   }
}

function attachProdutoItemListeners() {
   // Click em um produto da lista
   const produtoItems = document.querySelectorAll(".produto-item");
   produtoItems.forEach((item) => {
      item.addEventListener("click", function () {
         const produtoId = this.getAttribute("data-id");

         // Para mobile, carrega os dados ANTES de abrir o modal
         if (window.innerWidth <= 768) {
            // Primeiro carrega os dados, depois abre o modal quando estiver pronto
            loadProdutoDetailsForMobile(produtoId);
         } else {
            // Em desktop, carrega normalmente
            loadProdutoDetails(produtoId);
         }
      });
   });
}

// Função específica para carregar dados de produto no mobile
function loadProdutoDetailsForMobile(produtoId) {
   // Mostra um indicador de carregamento
   const modalOverlay = document.getElementById("form-modal");
   const modalContent = document.getElementById("modal-content");
   modalContent.innerHTML =
      '<div class="loading-indicator">Carregando...</div>';
   modalOverlay.classList.add("active");

   fetch(`get_produto.php?id=${produtoId}`)
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao carregar produto");
         }
         return response.json();
      })
      .then((data) => {
         if (data.status === "success") {
            const produto = data.data;

            // Primeiro atualiza o formulário principal com os dados
            document.getElementById("produto-id").textContent = produto.id;
            document.getElementById("codigo-barras").value =
               produto.codigo_barras;
            document.getElementById("nome-produto").value = produto.nome;
            document.getElementById("unidade").value = produto.unidade;
            document.getElementById("preco-venda").value = produto.preco_venda;

            // Mostra o botão de excluir
            document.getElementById("btn-delete-produto").style.display =
               "block";

            // Só abre o modal depois que os dados forem carregados
            openFormModal("produto", true);
         } else {
            closeFormModal();
            customModal.error(
               "Erro ao carregar dados do produto: " + data.message
            );
         }
      })
      .catch((error) => {
         closeFormModal();
         console.error("Erro ao carregar produto:", error);
         customModal.error("Erro ao carregar produto. Tente novamente.");
      });
}

function loadProdutoDetails(produtoId) {
   fetch(`get_produto.php?id=${produtoId}`)
      .then((response) => {
         if (!response.ok) {
            throw new Error("Erro na resposta da rede ao carregar produto");
         }
         return response.json();
      })
      .then((data) => {
         if (data.status === "success") {
            const produto = data.data;

            // Preenche o formulário com os dados do produto
            document.getElementById("produto-id").textContent = produto.id;
            document.getElementById("codigo-barras").value =
               produto.codigo_barras;
            document.getElementById("nome-produto").value = produto.nome;
            document.getElementById("unidade").value = produto.unidade;
            document.getElementById("preco-venda").value = produto.preco_venda;

            // Mostra o botão de excluir
            document.getElementById("btn-delete-produto").style.display =
               "block";
         } else {
            console.error("Erro ao carregar dados do produto:", data.message);
            customModal.error(
               "Erro ao carregar dados do produto: " + data.message
            );
         }
      })
      .catch((error) => {
         console.error("Erro ao carregar produto:", error);
         customModal.error("Erro ao carregar produto. Tente novamente.");
      });
}

// FUNÇÃO ATUALIZADA para usar modais personalizados
function deleteProduto(produtoId) {
   customModal
      .confirm(
         "Tem certeza que deseja excluir este produto?",
         "Confirmar exclusão",
         "warning"
      )
      .then((confirmed) => {
         if (confirmed) {
            const formData = new FormData();
            formData.append("id", produtoId);

            fetch("delete_produto.php", {
               method: "POST",
               body: formData,
            })
               .then((response) => {
                  if (!response.ok) {
                     throw new Error(
                        "Erro na resposta da rede ao excluir produto"
                     );
                  }
                  return response.json();
               })
               .then((data) => {
                  if (data.status === "success") {
                     // Atualiza a lista de produtos
                     loadProdutos();

                     // Reseta o formulário pois o produto foi excluído
                     resetProdutoForm();

                     // Fecha o modal em dispositivos móveis
                     if (window.innerWidth <= 768) {
                        closeFormModal();
                     }

                     // Mostra mensagem de sucesso
                     customModal.success("Produto excluído com sucesso!");
                  } else {
                     customModal.error(
                        "Erro ao excluir produto: " + data.message
                     );
                  }
               })
               .catch((error) => {
                  console.error("Erro ao excluir produto:", error);
                  customModal.error(
                     "Erro ao excluir produto. Tente novamente."
                  );
               });
         }
      });
}

function resetProdutoForm() {
   document.getElementById("produtoForm").reset();
   document.getElementById("produto-id").textContent = "Automático";
   document.getElementById("status-produto").innerHTML = "";
   document.getElementById("status-produto").className = "status-message";
   // Esconde o botão de excluir
   document.getElementById("btn-delete-produto").style.display = "none";
}

// ===== MODAL HANDLING FOR MOBILE =====

function setupModalHandlers() {
   const modalOverlay = document.getElementById("form-modal");
   const closeModalBtn = document.querySelector(".btn-close-modal");

   // Fecha o modal quando clica no X
   closeModalBtn.addEventListener("click", closeFormModal);

   // Fecha o modal quando clica fora dele
   modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
         closeFormModal();
      }
   });
}

function openFormModal(type, skipDataLoading = false) {
   const modalOverlay = document.getElementById("form-modal");
   const modalContent = document.getElementById("modal-content");
   const modalTitle = document.getElementById("modal-title");

   // Define o título do modal
   modalTitle.textContent =
      type === "cliente" ? "Detalhes do Cliente" : "Detalhes do Produto";

   // Se skipDataLoading for false, não faça nada (isso significa que esse modal já está mostrando um indicador de carregamento)
   if (!skipDataLoading) {
      return;
   }

   // Clona o formulário para o modal
   const form =
      type === "cliente"
         ? document.getElementById("clienteForm").cloneNode(true)
         : document.getElementById("produtoForm").cloneNode(true);

   // Limpa o conteúdo atual do modal e adiciona o formulário
   modalContent.innerHTML = "";
   modalContent.appendChild(form);

   // Adiciona o ID atual ao formulário do modal
   const currentId =
      type === "cliente"
         ? document.getElementById("cliente-id").textContent
         : document.getElementById("produto-id").textContent;

   const modalIdElement = form.querySelector(".id-value");
   if (modalIdElement) {
      modalIdElement.textContent = currentId;
   }

   // Preenche os valores do formulário
   if (type === "cliente") {
      form.querySelector("#empresa").value =
         document.getElementById("empresa").value;
      form.querySelector("#cnpj").value = document.getElementById("cnpj").value;
      form.querySelector("#ie").value = document.getElementById("ie").value;
      form.querySelector("#email").value =
         document.getElementById("email").value;
      form.querySelector("#telefone").value =
         document.getElementById("telefone").value;
      form.querySelector("#cep").value = document.getElementById("cep").value;
      form.querySelector("#rua").value = document.getElementById("rua").value;
      form.querySelector("#numero").value =
         document.getElementById("numero").value;
      form.querySelector("#bairro").value =
         document.getElementById("bairro").value;
      form.querySelector("#complemento").value =
         document.getElementById("complemento").value;
      form.querySelector("#cidade").value =
         document.getElementById("cidade").value;
      form.querySelector("#estado").value =
         document.getElementById("estado").value;
      form.querySelector("#observacoes").value =
         document.getElementById("observacoes").value;
   } else {
      form.querySelector("#codigo-barras").value =
         document.getElementById("codigo-barras").value;
      form.querySelector("#nome-produto").value =
         document.getElementById("nome-produto").value;
      form.querySelector("#unidade").value =
         document.getElementById("unidade").value;
      form.querySelector("#preco-venda").value =
         document.getElementById("preco-venda").value;
   }

   // Mostra ou esconde o botão de excluir no modal com base no ID
   const deleteBtn =
      type === "cliente"
         ? form.querySelector("#btn-delete-cliente")
         : form.querySelector("#btn-delete-produto");

   if (deleteBtn) {
      deleteBtn.style.display = currentId !== "Automático" ? "block" : "none";

      // Adiciona event listener para o botão excluir no modal
      deleteBtn.addEventListener("click", function () {
         if (currentId !== "Automático") {
            if (type === "cliente") {
               deleteCliente(currentId);
            } else {
               deleteProduto(currentId);
            }
         }
      });
   }

   // Adiciona os event listeners ao formulário clonado
   if (type === "cliente") {
      form.addEventListener("submit", function (e) {
         e.preventDefault();

         const formData = new FormData(form);
         if (currentId !== "Automático") {
            formData.append("id", currentId);
         }

         fetch("processa_cliente.php", {
            method: "POST",
            body: formData,
         })
            .then((response) => response.json())
            .then((data) => {
               if (data.status === "success") {
                  loadClientes();
                  closeFormModal();
                  customModal.success(data.message);
               } else {
                  customModal.error("Erro ao salvar cliente: " + data.message);
               }
            })
            .catch((error) => {
               console.error("Erro ao salvar cliente:", error);
               customModal.error("Erro ao salvar cliente. Tente novamente.");
            });
      });
   } else {
      form.addEventListener("submit", function (e) {
         e.preventDefault();

         const formData = new FormData(form);
         if (currentId !== "Automático") {
            formData.append("id", currentId);
         }

         fetch("processa_produto.php", {
            method: "POST",
            body: formData,
         })
            .then((response) => response.json())
            .then((data) => {
               if (data.status === "success") {
                  loadProdutos();
                  closeFormModal();
                  customModal.success(data.message);
               } else {
                  customModal.error("Erro ao salvar produto: " + data.message);
               }
            })
            .catch((error) => {
               console.error("Erro ao salvar produto:", error);
               customModal.error("Erro ao salvar produto. Tente novamente.");
            });
      });
   }

   // Adiciona event listener para o botão cancelar
   const cancelBtn = form.querySelector(".btn-cancel");
   if (cancelBtn) {
      cancelBtn.addEventListener("click", closeFormModal);
   }

   // Mostra o modal
   modalOverlay.classList.add("active");
}

function closeFormModal() {
   const modalOverlay = document.getElementById("form-modal");
   modalOverlay.classList.remove("active");
}

// Adiciona estilo para o indicador de carregamento e mensagens de status
const style = document.createElement("style");
style.textContent = `
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #24265d;
  text-align: center;
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 14px;
  color: #dc2626;
  text-align: center;
}
`;
document.head.appendChild(style);
