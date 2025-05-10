if (
   document.getElementById("message-modal") &&
   document.getElementById("confirm-modal")
) {
   console.log("Adaptador de modais inicializado na página de administração");
   class AdminModalAdapter {
      constructor() {
         this.messageModal = document.getElementById("message-modal");
         this.messageContent = document.getElementById("message-content");
         this.confirmModal = document.getElementById("confirm-modal");
         this.btnConfirmDelete = document.getElementById("btn-confirm-delete");
         this.btnCancelDelete = document.getElementById("btn-cancel-delete");
         this.setupListeners();
      }

      setupListeners() {
         const closeMessageModal = document.querySelector(
            ".close-message-modal"
         );
         if (closeMessageModal) {
            closeMessageModal.addEventListener("click", () => {
               this.messageModal.style.display = "none";
            });
         }
         window.addEventListener("click", (e) => {
            if (e.target === this.messageModal) {
               this.messageModal.style.display = "none";
            }
            if (e.target === this.confirmModal) {
               this.confirmModal.style.display = "none";
               if (this.currentReject) {
                  this.currentReject("cancelled");
                  this.currentResolve = null;
                  this.currentReject = null;
               }
            }
         });
         document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
               if (this.messageModal.style.display === "flex") {
                  this.messageModal.style.display = "none";
               }
               if (this.confirmModal.style.display === "flex") {
                  this.confirmModal.style.display = "none";
                  if (this.currentReject) {
                     this.currentReject("cancelled");
                     this.currentResolve = null;
                     this.currentReject = null;
                  }
               }
            }
         });
      }

      /**
       * @param {string} message
       * @param {string} title
       * @param {string} type
       * @returns {Promise}
       */
      alert(message, title = "Aviso", type = "info") {
         return new Promise((resolve) => {
            this.messageContent.innerHTML = "";

            const msgElement = document.createElement("div");
            let msgType = "sucesso";
            if (type === "error") msgType = "erro";
            if (type === "warning") msgType = "erro";
            if (type === "info") msgType = "sucesso";

            msgElement.classList.add("message", `message-${msgType}`);
            msgElement.textContent = message;

            this.messageContent.appendChild(msgElement);
            this.messageModal.style.display = "flex";
            setTimeout(() => {
               this.messageModal.style.display = "none";
               resolve(true);
            }, 3000);
            const closeBtn = this.messageModal.querySelector(
               ".close-message-modal"
            );
            if (closeBtn) {
               const onClose = () => {
                  this.messageModal.style.display = "none";
                  closeBtn.removeEventListener("click", onClose);
                  resolve(true);
               };
               closeBtn.addEventListener("click", onClose);
            }
         });
      }

      /**
       * @param {string} message
       * @param {string} title
       * @param {string} type
       * @returns {Promise<boolean>} 
       */
      confirm(message, title = "Confirmação", type = "warning") {
         return new Promise((resolve, reject) => {
            this.currentResolve = resolve;
            this.currentReject = reject;
            const confirmTitle = this.confirmModal.querySelector("h3");
            const confirmMessage = this.confirmModal.querySelector("p");

            if (confirmTitle) confirmTitle.textContent = title;
            if (confirmMessage) confirmMessage.textContent = message;
            const btnConfirm = this.btnConfirmDelete;
            const btnCancel = this.btnCancelDelete;
            const newBtnConfirm = btnConfirm.cloneNode(true);
            const newBtnCancel = btnCancel.cloneNode(true);
            btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);
            btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

            this.btnConfirmDelete = newBtnConfirm;
            this.btnCancelDelete = newBtnCancel;
            newBtnConfirm.addEventListener("click", () => {
               this.confirmModal.style.display = "none";
               resolve(true);
               this.currentResolve = null;
               this.currentReject = null;
            });

            newBtnCancel.addEventListener("click", () => {
               this.confirmModal.style.display = "none";
               resolve(false);
               this.currentResolve = null;
               this.currentReject = null;
            });
            this.confirmModal.style.display = "flex";
         });
      }

      /**
       * @param {string} message
       * @param {string} title
       * @returns {Promise}
       */
      success(message, title = "Sucesso") {
         return this.alert(message, title, "success");
      }

      /**
       * @param {string} message
       * @param {string} title
       * @returns {Promise}
       */
      error(message, title = "Erro") {
         return this.alert(message, title, "error");
      }
   }
   window.customModal = new AdminModalAdapter();
   const originalMostrarMensagem = window.mostrarMensagem;

   window.mostrarMensagem = function (mensagem, tipo = "sucesso") {
      if (originalMostrarMensagem) {
         if (tipo === "sucesso") {
            window.customModal.success(mensagem);
         } else {
            window.customModal.error(mensagem);
         }
      }
   };
   const originalConfirmarExclusao = window.confirmarExclusao;

   window.confirmarExclusao = async function (userId) {
      window.usuarioIdParaExcluir = userId;
      const confirmado = await window.customModal.confirm(
         "Tem certeza que deseja excluir este usuário?",
         "Confirmar Exclusão",
         "warning"
      );

      if (confirmado) {
         await excluirUsuario(userId);
      }
   };

   console.log("Adaptador de modais configurado com sucesso");
} else {
   console.log(
      "Página de administração não detectada, adaptador não inicializado"
   );
}
