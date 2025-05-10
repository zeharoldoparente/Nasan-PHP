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
         if (e.key === "Escape" && this.overlay.classList.contains("active")) {
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
const customModal = new ModalCustom();
document.addEventListener("DOMContentLoaded", function () {
   const deleteClienteBtn = document.getElementById("btn-delete-cliente");
   if (deleteClienteBtn) {
      deleteClienteBtn.addEventListener("click", function (e) {
         e.preventDefault();
         e.stopPropagation();

         const clienteId = document.getElementById("cliente-id").textContent;
         if (clienteId !== "Automático") {
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
                        .then((response) => response.json())
                        .then((data) => {
                           if (data.status === "success") {
                              if (typeof loadClientes === "function")
                                 loadClientes();
                              document.getElementById("clienteForm").reset();
                              document.getElementById(
                                 "cliente-id"
                              ).textContent = "Automático";
                              document.getElementById(
                                 "btn-delete-cliente"
                              ).style.display = "none";
                              if (
                                 window.innerWidth <= 768 &&
                                 typeof closeFormModal === "function"
                              ) {
                                 closeFormModal();
                              }
                              customModal.success(
                                 "Cliente excluído com sucesso!"
                              );
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
      });
   }
   const deleteProdutoBtn = document.getElementById("btn-delete-produto");
   if (deleteProdutoBtn) {
      deleteProdutoBtn.addEventListener("click", function (e) {
         e.preventDefault();
         e.stopPropagation();

         const produtoId = document.getElementById("produto-id").textContent;
         if (produtoId !== "Automático") {
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
                        .then((response) => response.json())
                        .then((data) => {
                           if (data.status === "success") {
                              if (typeof loadProdutos === "function")
                                 loadProdutos();
                              document.getElementById("produtoForm").reset();
                              document.getElementById(
                                 "produto-id"
                              ).textContent = "Automático";
                              document.getElementById(
                                 "btn-delete-produto"
                              ).style.display = "none";
                              if (
                                 window.innerWidth <= 768 &&
                                 typeof closeFormModal === "function"
                              ) {
                                 closeFormModal();
                              }
                              customModal.success(
                                 "Produto excluído com sucesso!"
                              );
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
      });
   }
   const style = document.createElement("style");
   style.textContent = `
   /* Estilo base para o modal overlay */
   .modal-custom-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
   }
   
   .modal-custom-overlay.active {
      opacity: 1;
      visibility: visible;
   }
   
   /* Container principal do modal */
   .modal-custom-container {
      width: 90%;
      max-width: 400px;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: translateY(20px);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
   }
   
   .modal-custom-overlay.active .modal-custom-container {
      transform: translateY(0);
   }
   
   /* Cabeçalho do modal */
   .modal-custom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
   }
   
   .modal-custom-header h3 {
      margin: 0;
      font-size: 18px;
      color: #24265d;
      font-weight: 600;
   }
   
   .btn-close-modal-custom {
      background: none;
      border: none;
      font-size: 18px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
   }
   
   /* Conteúdo do modal */
   .modal-custom-content {
      padding: 20px 16px;
      text-align: center;
   }
   
   .modal-custom-message {
      font-size: 16px;
      color: #475569;
      margin-bottom: 20px;
      line-height: 1.5;
   }
   
   /* Ícones nos modais */
   .modal-custom-icon {
      font-size: 48px;
      margin-bottom: 15px;
   }
   
   .modal-custom-icon.success {
      color: #16a34a;
   }
   
   .modal-custom-icon.error {
      color: #dc2626;
   }
   
   .modal-custom-icon.warning {
      color: #f59e0b;
   }
   
   .modal-custom-icon.info {
      color: #3b82f6;
   }
   
   /* Botões de ação do modal */
   .modal-custom-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 5px;
   }
   
   .btn-modal-custom {
      padding: 10px 16px;
      border-radius: 6px;
      font-family: "Poppins", sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 80px;
   }
   
   .btn-modal-cancel {
      background-color: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
   }
   
   .btn-modal-cancel:hover {
      background-color: #e2e8f0;
   }
   
   .btn-modal-confirm {
      background-color: #24265d;
      color: white;
      border: none;
   }
   
   .btn-modal-confirm:hover {
      background-color: #1e2050;
   }
   
   .btn-modal-danger {
      background-color: #dc2626;
      color: white;
      border: none;
   }
   
   .btn-modal-danger:hover {
      background-color: #b91c1c;
   }
   
   .btn-modal-success {
      background-color: #16a34a;
      color: white;
      border: none;
   }
   
   .btn-modal-success:hover {
      background-color: #15803d;
   }
   
   /* Animações */
   @keyframes fadeInUp {
      from {
         opacity: 0;
         transform: translate3d(0, 30px, 0);
      }
      to {
         opacity: 1;
         transform: translate3d(0, 0, 0);
      }
   }
   
   .modal-custom-container {
      animation: fadeInUp 0.3s ease-out;
   }
   
   /* Responsividade */
   @media (max-width: 576px) {
      .modal-custom-container {
         width: 95%;
         max-width: none;
      }
      
      .modal-custom-actions {
         flex-direction: column;
         gap: 8px;
      }
      
      .btn-modal-custom {
         width: 100%;
         padding: 12px;
      }
   }
   `;
   document.head.appendChild(style);
});
