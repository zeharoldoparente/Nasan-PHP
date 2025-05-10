if (typeof ModalCustom === "undefined") {
   class ModalCustom {
      constructor() {
         this.init();
      }

      init() {
         this.createModalElements();
         this.setupEventListeners();
      }

      createModalElements() {
         this.overlay = document.createElement("div");
         this.overlay.className = "modal-custom-overlay";
         this.container = document.createElement("div");
         this.container.className = "modal-custom-container";
         this.header = document.createElement("div");
         this.header.className = "modal-custom-header";
         this.title = document.createElement("h3");
         this.title.textContent = "Aviso";
         this.closeButton = document.createElement("button");
         this.closeButton.className = "btn-close-modal-custom";
         this.closeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
         this.header.appendChild(this.title);
         this.header.appendChild(this.closeButton);
         this.content = document.createElement("div");
         this.content.className = "modal-custom-content";
         this.icon = document.createElement("div");
         this.icon.className = "modal-custom-icon";
         this.message = document.createElement("div");
         this.message.className = "modal-custom-message";
         this.actions = document.createElement("div");
         this.actions.className = "modal-custom-actions";
         this.content.appendChild(this.icon);
         this.content.appendChild(this.message);
         this.content.appendChild(this.actions);
         this.container.appendChild(this.header);
         this.container.appendChild(this.content);
         this.overlay.appendChild(this.container);
         document.body.appendChild(this.overlay);
      }

      setupEventListeners() {
         this.closeButton.addEventListener("click", () => this.close());
         this.overlay.addEventListener("click", (e) => {
            if (e.target === this.overlay) {
               this.close();
            }
         });
         document.addEventListener("keydown", (e) => {
            if (
               e.key === "Escape" &&
               this.overlay.classList.contains("active")
            ) {
               this.close();
            }
         });
      }
      alert(message, title = "Aviso", type = "info") {
         return new Promise((resolve) => {
            this.title.textContent = title;
            this.message.textContent = message;
            this.actions.innerHTML = "";
            this.setIcon(type);
            const okButton = document.createElement("button");
            okButton.className = "btn-modal-custom btn-modal-confirm";
            okButton.textContent = "OK";
            okButton.addEventListener("click", () => {
               this.close();
               resolve(true);
            });

            this.actions.appendChild(okButton);
            this.open();
            setTimeout(() => okButton.focus(), 100);
         });
      }

      confirm(message, title = "Confirmação", type = "warning") {
         return new Promise((resolve) => {
            this.title.textContent = title;
            this.message.textContent = message;
            this.actions.innerHTML = "";
            this.setIcon(type);
            const noButton = document.createElement("button");
            noButton.className = "btn-modal-custom btn-modal-cancel";
            noButton.textContent = "Não";
            noButton.addEventListener("click", () => {
               this.close();
               resolve(false);
            });
            const yesButton = document.createElement("button");
            yesButton.className = "btn-modal-custom btn-modal-danger";
            yesButton.textContent = "Sim";
            yesButton.addEventListener("click", () => {
               this.close();
               resolve(true);
            });

            this.actions.appendChild(noButton);
            this.actions.appendChild(yesButton);
            this.open();
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
         document.body.style.overflow = "hidden";
      }

      close() {
         this.overlay.classList.remove("active");
         document.body.style.overflow = "";
      }
   }
   window.customModal = new ModalCustom();
}
window.originalAlert = window.alert;
window.originalConfirm = window.confirm;

window.alert = function (message) {
   return customModal.alert(message);
};

window.confirm = function (message) {
   return customModal.confirm(message);
};

document.addEventListener("DOMContentLoaded", function () {
   const tabButtons = document.querySelectorAll(".tab-button");
   const tabContents = document.querySelectorAll(".tab-content");

   tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
         tabButtons.forEach((btn) => btn.classList.remove("active"));
         tabContents.forEach((content) => content.classList.remove("active"));
         button.classList.add("active");
         const tabId = button.getAttribute("data-tab");
         document.getElementById(`${tabId}-tab`).classList.add("active");
      });
   });

   addPaginationStyles();
   loadClientes();
   setupClienteListeners();
   if (typeof isAdmin !== "undefined" && isAdmin) {
      loadProdutos(1, 20);
      setupProdutoListeners();
   }
   setupModalHandlers();
});
function loadClientes() {
   const listaClientes = document.getElementById("lista-clientes");
   if (!listaClientes) {
      console.error("Elemento lista-clientes não encontrado");
      return;
   }

   listaClientes.innerHTML =
      '<div class="loading-indicator">Carregando clientes...</div>';

   fetch("get_clientes.php")
      .then((response) => {
         if (!response.ok) {
            throw new Error(
               "Erro na resposta da rede ao carregar clientes: " +
               response.status
            );
         }
         return response.text().then((text) => {
            try {
               if (!text.trim()) {
                  console.warn("A resposta de get_clientes.php está vazia");
                  return [];
               }
               return JSON.parse(text);
            } catch (e) {
               console.error(
                  "Erro ao fazer parse do JSON:",
                  e,
                  "Resposta:",
                  text
               );
               throw new Error(
                  "Erro ao processar dados do servidor: " + e.message
               );
            }
         });
      })
      .then((clientes) => {
         listaClientes.innerHTML = "";

         if (!clientes || clientes.length === 0) {
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
         attachClienteItemListeners();
      })
      .catch((error) => {
         console.error("Erro ao carregar clientes:", error);
         listaClientes.innerHTML =
            '<div class="error-message">Erro ao carregar clientes. Tente novamente.<br>Detalhes: ' +
            error.message +
            "</div>";

         if (typeof customModal !== "undefined") {
            customModal.error(
               "Erro ao carregar a lista de clientes. Verifique a conexão com o banco de dados."
            );
         } else {
            alert(
               "Erro ao carregar a lista de clientes. Verifique a conexão com o banco de dados."
            );
         }
      });
}

function setupClienteListeners() {
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
   const addClienteBtn = document.getElementById("add-cliente");
   addClienteBtn.addEventListener("click", () => {
      resetClienteForm();
      document.getElementById("cliente-id").textContent = "Automático";
      if (document.getElementById("btn-delete-cliente")) {
         document.getElementById("btn-delete-cliente").style.display = "none";
      }
      if (window.innerWidth <= 768) {
         openFormModal("cliente", true);
      }
   });
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
                  loadClientes();
                  if (clienteId === "Automático") {
                     resetClienteForm();
                  }
                  if (window.innerWidth <= 768) {
                     closeFormModal();
                  }
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
   const cancelarBtns = document.querySelectorAll("#clienteForm .btn-cancel");
   cancelarBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
         resetClienteForm();
         if (window.innerWidth <= 768) {
            closeFormModal();
         }
      });
   });
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
   const clienteItems = document.querySelectorAll(".cliente-item");
   clienteItems.forEach((item) => {
      item.addEventListener("click", function () {
         const clienteId = this.getAttribute("data-id");
         if (window.innerWidth <= 768) {
            loadClienteDetailsForMobile(clienteId);
         } else {
            loadClienteDetails(clienteId);
         }
      });
   });
}
function loadClienteDetailsForMobile(clienteId) {
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
            const deleteBtn = document.getElementById("btn-delete-cliente");
            if (deleteBtn && isAdmin) {
               deleteBtn.style.display = "block";
            }
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

            const deleteBtn = document.getElementById("btn-delete-cliente");
            if (deleteBtn && isAdmin) {
               deleteBtn.style.display = "block";
            }
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
                     loadClientes();

                     resetClienteForm();

                     if (window.innerWidth <= 768) {
                        closeFormModal();
                     }

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

   const deleteBtn = document.getElementById("btn-delete-cliente");
   if (deleteBtn) {
      deleteBtn.style.display = "none";
   }
}
let currentPage = 1;
let isLoadingProdutos = false;
let totalPages = 1;
let totalProdutos = 0;

function loadProdutos(page = 1, limit = 50, forceReload = false) {
   if (isLoadingProdutos && !forceReload) return;

   isLoadingProdutos = true;
   const listaProdutos = document.getElementById("lista-produtos");
   if (!listaProdutos) {
      console.error("Elemento lista-produtos não encontrado");
      isLoadingProdutos = false;
      return;
   }

   listaProdutos.innerHTML =
      '<div class="loading-indicator">Carregando produtos...</div>';

   const timestamp = new Date().getTime();

   console.log(`Carregando página ${page} de produtos...`);

   fetch(`get_produtos.php?page=${page}&limit=${limit}&t=${timestamp}`, {
      headers: {
         "Cache-Control": "no-cache",
         Pragma: "no-cache",
      },
   })
      .then((response) => {
         if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
         }
         return response.json();
      })
      .then((data) => {
         console.log(
            `Recebidos ${data.produtos ? data.produtos.length : 0
            } produtos da página ${page}`
         );

         currentPage = parseInt(data.pagination.page);
         totalPages = parseInt(data.pagination.totalPages);
         totalProdutos = parseInt(data.pagination.total);

         renderProdutosPage(data.produtos, listaProdutos, data.pagination);
         isLoadingProdutos = false;
      })
      .catch((error) => {
         console.error(`Erro ao carregar produtos:`, error);
         listaProdutos.innerHTML = `
           <div class="error-message">
               Erro ao carregar produtos. <br>
               <button class="btn-retry">Tentar novamente</button>
           </div>
       `;

         const btnRetry = listaProdutos.querySelector(".btn-retry");
         if (btnRetry) {
            btnRetry.addEventListener("click", () =>
               loadProdutos(currentPage, limit, true)
            );
         }

         isLoadingProdutos = false;
      });
}
function renderProdutosPage(produtos, container, pagination) {
   container.innerHTML = "";

   if (!produtos || produtos.length === 0) {
      container.innerHTML =
         '<div class="empty-list">Nenhum produto encontrado</div>';
      return;
   }

   const listElement = document.createElement("div");
   listElement.className = "produtos-list";

   produtos.forEach((produto) => {
      const produtoItem = document.createElement("div");
      produtoItem.className = "list-item produto-item";
      produtoItem.setAttribute("data-id", produto.id);

      let preco;
      try {
         preco = parseFloat(produto.preco_venda).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
         });
      } catch (e) {
         console.error("Erro ao formatar preço:", e);
         preco = produto.preco_venda || "0,00";
      }

      const codigoBarras = produto.codigo_barras || "Sem código";

      produtoItem.innerHTML = `
           <div class="list-item-content">
               <h4>${codigoBarras} - ${produto.nome}</h4>
               <p>${preco}</p>
           </div>
       `;
      listElement.appendChild(produtoItem);
   });

   container.appendChild(listElement);

   const pagerElement = document.createElement("div");
   pagerElement.className = "pagination-controls";

   const currentPage = parseInt(pagination.page);
   const totalPages = parseInt(pagination.totalPages);
   const totalItems = parseInt(pagination.total);

   pagerElement.innerHTML = `
   <div class="pagination-info">
       Página ${currentPage} de ${totalPages} - (${totalItems} produtos)
   </div>
   <div class="pagination-buttons">
        <button class="btn-page" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
            &#8592;
        </button>
        <button class="btn-page" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
            &#8594;
        </button>
   </div>
`;


   container.appendChild(pagerElement);

   const pageButtons = pagerElement.querySelectorAll(".btn-page");
   pageButtons.forEach((button) => {
      if (!button.disabled) {
         button.addEventListener("click", () => {
            const targetPage = parseInt(button.getAttribute("data-page"));
            loadProdutos(targetPage, pagination.limit);
         });
      }
   });

   attachProdutoItemListeners();
}

function addPaginationStyles() {
   const style = document.createElement("style");
   style.textContent = `
       .pagination-controls {
           margin-top: 20px;
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 10px;
       }
       
       .pagination-info {
           font-size: 14px;
           color: #6b7280;
       }
       
       .pagination-buttons {
           display: flex;
           gap: 5px;
       }
       
       .btn-page {
           padding: 6px 12px;
           border: 1px solid #d1d5db;
           border-radius: 4px;
           background-color: #f9fafb;
           color: #374151;
           cursor: pointer;
           transition: all 0.2s;
       }
       
       .btn-page:hover:not([disabled]) {
           background-color: #e5e7eb;
       }
       
       .btn-page[disabled] {
           opacity: 0.5;
           cursor: not-allowed;
       }
       
       .btn-retry {
           padding: 8px 16px;
           background-color: #3b82f6;
           color: white;
           border: none;
           border-radius: 4px;
           cursor: pointer;
           margin-top: 10px;
       }
       
       .btn-retry:hover {
           background-color: #2563eb;
       }
   `;
   document.head.appendChild(style);
}

function renderProdutosList(produtos, container) {
   container.innerHTML = "";

   if (!produtos || produtos.length === 0) {
      container.innerHTML =
         '<div class="empty-list">Nenhum produto encontrado</div>';
      return;
   }

   produtos.forEach((produto) => {
      const produtoItem = document.createElement("div");
      produtoItem.className = "list-item produto-item";
      produtoItem.setAttribute("data-id", produto.id);

      let preco;
      try {
         preco = parseFloat(produto.preco_venda).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
         });
      } catch (e) {
         console.error("Erro ao formatar preço:", e);
         preco = produto.preco_venda || "0,00";
      }

      const codigoBarras = produto.codigo_barras || "Sem código";

      produtoItem.innerHTML = `
            <div class="list-item-content">
                <h4>${codigoBarras} - ${produto.nome}</h4>
                <p>${preco}</p>
            </div>
        `;
      container.appendChild(produtoItem);
   });

   attachProdutoItemListeners();
}

function setupProdutoListeners() {
   if (!isAdmin) return;

   const buscaProduto = document.getElementById("busca-produto");
   if (!buscaProduto) return; // Sair se o elemento não existir

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

   const addProdutoBtn = document.getElementById("add-produto");
   if (addProdutoBtn) {
      addProdutoBtn.addEventListener("click", () => {
         resetProdutoForm();
         document.getElementById("produto-id").textContent = "Automático";

         document.getElementById("btn-delete-produto").style.display = "none";
         if (window.innerWidth <= 768) {
            openFormModal("produto", true);
         }
      });
   }
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
                  currentPage = 1;
                  loadProdutos();
                  if (produtoId === "Automático") {
                     resetProdutoForm();
                  }
                  if (window.innerWidth <= 768) {
                     closeFormModal();
                  }
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

   const cancelarBtns = document.querySelectorAll("#produtoForm .btn-cancel");
   if (cancelarBtns) {
      cancelarBtns.forEach((btn) => {
         btn.addEventListener("click", () => {
            resetProdutoForm();
            if (window.innerWidth <= 768) {
               closeFormModal();
            }
         });
      });
   }

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

function setupModalHandlers() {
   const modalOverlay = document.getElementById("form-modal");
   const closeModalBtn = document.querySelector(".btn-close-modal");

   closeModalBtn.addEventListener("click", closeFormModal);

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

   modalTitle.textContent =
      type === "cliente" ? "Detalhes do Cliente" : "Detalhes do Produto";

   if (!skipDataLoading) {
      return;
   }

   const form =
      type === "cliente"
         ? document.getElementById("clienteForm").cloneNode(true)
         : document.getElementById("produtoForm").cloneNode(true);

   modalContent.innerHTML = "";
   modalContent.appendChild(form);

   const currentId =
      type === "cliente"
         ? document.getElementById("cliente-id").textContent
         : document.getElementById("produto-id").textContent;

   const modalIdElement = form.querySelector(".id-value");
   if (modalIdElement) {
      modalIdElement.textContent = currentId;
   }

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
      const buscarCepBtn = form.querySelector("#buscar-cep");
      if (buscarCepBtn) {
         buscarCepBtn.addEventListener("click", () => {
            const cepInput = form.querySelector("#cep");
            const cep = cepInput.value.replace(/\D/g, "");

            if (cep.length === 8) {
               fetch(`https://viacep.com.br/ws/${cep}/json/`)
                  .then((response) => response.json())
                  .then((data) => {
                     if (!data.erro) {
                        form.querySelector("#rua").value = data.logradouro;
                        form.querySelector("#bairro").value = data.bairro;
                        form.querySelector("#cidade").value = data.localidade;
                        form.querySelector("#estado").value = data.uf;

                        const cepStatus = form.querySelector("#cep-status");
                        if (cepStatus) {
                           cepStatus.innerHTML = "✓";
                           cepStatus.className = "field-status valid";
                        }
                     } else {
                        const cepStatus = form.querySelector("#cep-status");
                        if (cepStatus) {
                           cepStatus.innerHTML = "✗";
                           cepStatus.className = "field-status invalid";
                        }
                     }
                  })
                  .catch(() => {
                     const cepStatus = form.querySelector("#cep-status");
                     if (cepStatus) {
                        cepStatus.innerHTML = "✗";
                        cepStatus.className = "field-status invalid";
                     }
                  });
            }
         });
      }
   } else if (isAdmin) {
      form.querySelector("#codigo-barras").value =
         document.getElementById("codigo-barras").value;
      form.querySelector("#nome-produto").value =
         document.getElementById("nome-produto").value;
      form.querySelector("#unidade").value =
         document.getElementById("unidade").value;
      form.querySelector("#preco-venda").value =
         document.getElementById("preco-venda").value;
   }

   const deleteBtn =
      type === "cliente"
         ? form.querySelector("#btn-delete-cliente")
         : form.querySelector("#btn-delete-produto");

   if (deleteBtn) {
      if (isAdmin && currentId !== "Automático") {
         deleteBtn.style.display = "block";
      } else {
         deleteBtn.style.display = "none";
      }

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
   } else if (isAdmin) {
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
                  currentPage = 1;
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

   const cancelBtn = form.querySelector(".btn-cancel");
   if (cancelBtn) {
      cancelBtn.addEventListener("click", closeFormModal);
   }

   modalOverlay.classList.add("active");
}

function closeFormModal() {
   const modalOverlay = document.getElementById("form-modal");
   modalOverlay.classList.remove("active");
}

function attachProdutoItemListeners() {
   if (!isAdmin) return;

   const produtoItems = document.querySelectorAll(".produto-item");
   produtoItems.forEach((item) => {
      item.addEventListener("click", function () {
         const produtoId = this.getAttribute("data-id");

         if (window.innerWidth <= 768) {
            loadProdutoDetailsForMobile(produtoId);
         } else {
            loadProdutoDetails(produtoId);
         }
      });
   });
}

function loadProdutoDetailsForMobile(produtoId) {
   if (!isAdmin) return;

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

            document.getElementById("produto-id").textContent = produto.id;
            document.getElementById("codigo-barras").value =
               produto.codigo_barras;
            document.getElementById("nome-produto").value = produto.nome;
            document.getElementById("unidade").value = produto.unidade;
            document.getElementById("preco-venda").value = produto.preco_venda;

            document.getElementById("btn-delete-produto").style.display =
               "block";

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
   if (!isAdmin) return;

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

            document.getElementById("produto-id").textContent = produto.id;
            document.getElementById("codigo-barras").value =
               produto.codigo_barras;
            document.getElementById("nome-produto").value = produto.nome;
            document.getElementById("unidade").value = produto.unidade;
            document.getElementById("preco-venda").value = produto.preco_venda;

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

function deleteProduto(produtoId) {
   if (!isAdmin) return;

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
                     currentPage = 1;
                     loadProdutos();
                     resetProdutoForm();

                     if (window.innerWidth <= 768) {
                        closeFormModal();
                     }

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
   if (!document.getElementById("produtoForm")) return;

   document.getElementById("produtoForm").reset();
   document.getElementById("produto-id").textContent = "Automático";
   document.getElementById("status-produto").innerHTML = "";
   document.getElementById("status-produto").className = "status-message";
   document.getElementById("btn-delete-produto").style.display = "none";
}

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
  flex-direction: column;
}

.loading-indicator::after {
  content: "";
  width: 40px;
  height: 40px;
  margin-top: 10px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #24265d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
