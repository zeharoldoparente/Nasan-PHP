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
   fetch("get_clientes.php")
      .then((response) => response.json())
      .then((clientes) => {
         const listaClientes = document.getElementById("lista-clientes");
         listaClientes.innerHTML = "";

         clientes.forEach((cliente) => {
            const clienteItem = document.createElement("div");
            clienteItem.className = "list-item cliente-item";
            clienteItem.setAttribute("data-id", cliente.id);
            clienteItem.innerHTML = `
                   <div class="list-item-content">
                       <h4>${cliente.razao_social}</h4>
                       <p>${cliente.telefone}</p>
                   </div>
                   <div class="list-item-actions">
                       <button class="btn-action btn-delete" data-id="${cliente.id}">
                           <i class="bi bi-trash"></i>
                       </button>
                   </div>
               `;
            listaClientes.appendChild(clienteItem);
         });

         // Adiciona event listeners aos novos itens
         attachClienteItemListeners();
      })
      .catch((error) => console.error("Erro ao carregar clientes:", error));
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

      // Para mobile, abre o modal
      if (window.innerWidth <= 768) {
         openFormModal("cliente");
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

   // Event listeners para formulário de cliente
   const clienteForm = document.getElementById("clienteForm");
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
         .then((response) => response.json())
         .then((data) => {
            if (data.status === "success") {
               const statusMsg = document.getElementById("status-cliente");
               statusMsg.innerHTML = data.message;
               statusMsg.className = "status-message success";

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

               // Limpa a mensagem após 3 segundos
               setTimeout(() => {
                  statusMsg.innerHTML = "";
                  statusMsg.className = "status-message";
               }, 3000);
            } else {
               const statusMsg = document.getElementById("status-cliente");
               statusMsg.innerHTML = data.message;
               statusMsg.className = "status-message error";
            }
         })
         .catch((error) => {
            console.error("Erro ao salvar cliente:", error);
            const statusMsg = document.getElementById("status-cliente");
            statusMsg.innerHTML = "Erro ao salvar cliente. Tente novamente.";
            statusMsg.className = "status-message error";
         });
   });

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
}

function attachClienteItemListeners() {
   // Click em um cliente da lista
   const clienteItems = document.querySelectorAll(".cliente-item");
   clienteItems.forEach((item) => {
      item.addEventListener("click", function (e) {
         // Ignora o clique se foi no botão excluir
         if (e.target.closest(".btn-delete")) return;

         const clienteId = this.getAttribute("data-id");
         loadClienteDetails(clienteId);

         // Para mobile, abre o modal
         if (window.innerWidth <= 768) {
            openFormModal("cliente");
         }
      });
   });

   // Botões de excluir cliente
   const deleteBtns = document.querySelectorAll(".cliente-item .btn-delete");
   deleteBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
         e.stopPropagation(); // Evita a propagação para o item da lista

         const clienteId = this.getAttribute("data-id");
         if (confirm("Tem certeza que deseja excluir este cliente?")) {
            deleteCliente(clienteId);
         }
      });
   });
}

function loadClienteDetails(clienteId) {
   fetch(`get_cliente.php?id=${clienteId}`)
      .then((response) => response.json())
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
         } else {
            console.error("Erro ao carregar dados do cliente:", data.message);
         }
      })
      .catch((error) => console.error("Erro ao carregar cliente:", error));
}

function deleteCliente(clienteId) {
   const formData = new FormData();
   formData.append("id", clienteId);

   fetch("delete_cliente.php", {
      method: "POST",
      body: formData,
   })
      .then((response) => response.json())
      .then((data) => {
         if (data.status === "success") {
            // Atualiza a lista de clientes
            loadClientes();

            // Se o cliente que está sendo excluído está aberto no formulário, reseta o formulário
            const currentClienteId =
               document.getElementById("cliente-id").textContent;
            if (currentClienteId === clienteId) {
               resetClienteForm();
            }
         } else {
            alert("Erro ao excluir cliente: " + data.message);
         }
      })
      .catch((error) => console.error("Erro ao excluir cliente:", error));
}

function resetClienteForm() {
   document.getElementById("clienteForm").reset();
   document.getElementById("cliente-id").textContent = "Automático";
   document.getElementById("cep-status").innerHTML = "";
   document.getElementById("cep-status").className = "field-status";
   document.getElementById("status-cliente").innerHTML = "";
   document.getElementById("status-cliente").className = "status-message";
}

// ===== PRODUTO FUNCTIONS =====

function loadProdutos() {
   fetch("get_produtos.php")
      .then((response) => response.json())
      .then((produtos) => {
         const listaProdutos = document.getElementById("lista-produtos");
         listaProdutos.innerHTML = "";

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

            produtoItem.innerHTML = `
                   <div class="list-item-content">
                       <h4>${produto.nome}</h4>
                       <p>${preco}</p>
                   </div>
                   <div class="list-item-actions">
                       <button class="btn-action btn-delete" data-id="${produto.id}">
                           <i class="bi bi-trash"></i>
                       </button>
                   </div>
               `;
            listaProdutos.appendChild(produtoItem);
         });

         // Adiciona event listeners aos novos itens
         attachProdutoItemListeners();
      })
      .catch((error) => console.error("Erro ao carregar produtos:", error));
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

      // Para mobile, abre o modal
      if (window.innerWidth <= 768) {
         openFormModal("produto");
      }
   });

   // Event listeners para formulário de produto
   const produtoForm = document.getElementById("produtoForm");
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
         .then((response) => response.json())
         .then((data) => {
            if (data.status === "success") {
               const statusMsg = document.getElementById("status-produto");
               statusMsg.innerHTML = data.message;
               statusMsg.className = "status-message success";

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

               // Limpa a mensagem após 3 segundos
               setTimeout(() => {
                  statusMsg.innerHTML = "";
                  statusMsg.className = "status-message";
               }, 3000);
            } else {
               const statusMsg = document.getElementById("status-produto");
               statusMsg.innerHTML = data.message;
               statusMsg.className = "status-message error";
            }
         })
         .catch((error) => {
            console.error("Erro ao salvar produto:", error);
            const statusMsg = document.getElementById("status-produto");
            statusMsg.innerHTML = "Erro ao salvar produto. Tente novamente.";
            statusMsg.className = "status-message error";
         });
   });

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
}

function attachProdutoItemListeners() {
   // Click em um produto da lista
   const produtoItems = document.querySelectorAll(".produto-item");
   produtoItems.forEach((item) => {
      item.addEventListener("click", function (e) {
         // Ignora o clique se foi no botão excluir
         if (e.target.closest(".btn-delete")) return;

         const produtoId = this.getAttribute("data-id");
         loadProdutoDetails(produtoId);

         // Para mobile, abre o modal
         if (window.innerWidth <= 768) {
            openFormModal("produto");
         }
      });
   });

   // Botões de excluir produto
   const deleteBtns = document.querySelectorAll(".produto-item .btn-delete");
   deleteBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
         e.stopPropagation(); // Evita a propagação para o item da lista

         const produtoId = this.getAttribute("data-id");
         if (confirm("Tem certeza que deseja excluir este produto?")) {
            deleteProduto(produtoId);
         }
      });
   });
}

function loadProdutoDetails(produtoId) {
   fetch(`get_produto.php?id=${produtoId}`)
      .then((response) => response.json())
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
         } else {
            console.error("Erro ao carregar dados do produto:", data.message);
         }
      })
      .catch((error) => console.error("Erro ao carregar produto:", error));
}

function deleteProduto(produtoId) {
   const formData = new FormData();
   formData.append("id", produtoId);

   fetch("delete_produto.php", {
      method: "POST",
      body: formData,
   })
      .then((response) => response.json())
      .then((data) => {
         if (data.status === "success") {
            // Atualiza a lista de produtos
            loadProdutos();

            // Se o produto que está sendo excluído está aberto no formulário, reseta o formulário
            const currentProdutoId =
               document.getElementById("produto-id").textContent;
            if (currentProdutoId === produtoId) {
               resetProdutoForm();
            }
         } else {
            alert("Erro ao excluir produto: " + data.message);
         }
      })
      .catch((error) => console.error("Erro ao excluir produto:", error));
}

function resetProdutoForm() {
   document.getElementById("produtoForm").reset();
   document.getElementById("produto-id").textContent = "Automático";
   document.getElementById("status-produto").innerHTML = "";
   document.getElementById("status-produto").className = "status-message";
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

function openFormModal(type) {
   const modalOverlay = document.getElementById("form-modal");
   const modalContent = document.getElementById("modal-content");
   const modalTitle = document.getElementById("modal-title");

   // Define o título do modal
   modalTitle.textContent =
      type === "cliente" ? "Detalhes do Cliente" : "Detalhes do Produto";

   // Clona o formulário para o modal
   const form =
      type === "cliente"
         ? document.getElementById("clienteForm").cloneNode(true)
         : document.getElementById("produtoForm").cloneNode(true);

   // Limpa o conteúdo atual do modal e adiciona o formulário
   modalContent.innerHTML = "";
   modalContent.appendChild(form);

   // Adiciona os event listeners ao formulário clonado
   if (type === "cliente") {
      form.addEventListener("submit", function (e) {
         e.preventDefault();

         const formData = new FormData(form);
         const clienteId = document.getElementById("cliente-id").textContent;

         if (clienteId !== "Automático") {
            formData.append("id", clienteId);
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
               } else {
                  alert("Erro ao salvar cliente: " + data.message);
               }
            })
            .catch((error) => console.error("Erro ao salvar cliente:", error));
      });
   } else {
      form.addEventListener("submit", function (e) {
         e.preventDefault();

         const formData = new FormData(form);
         const produtoId = document.getElementById("produto-id").textContent;

         if (produtoId !== "Automático") {
            formData.append("id", produtoId);
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
               } else {
                  alert("Erro ao salvar produto: " + data.message);
               }
            })
            .catch((error) => console.error("Erro ao salvar produto:", error));
      });
   }

   // Adiciona event listener para o botão cancelar
   const cancelBtn = form.querySelector(".btn-cancel");
   cancelBtn.addEventListener("click", closeFormModal);

   // Mostra o modal
   modalOverlay.classList.add("active");
}

function closeFormModal() {
   const modalOverlay = document.getElementById("form-modal");
   modalOverlay.classList.remove("active");
}
