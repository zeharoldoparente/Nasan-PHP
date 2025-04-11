/**
 * Adaptador para compatibilizar os modais personalizados com a página de administração
 * Este script deve ser incluído após o admin.js
 */

// Verificar se estamos na página de administração (pela presença dos elementos)
if (
   document.getElementById("message-modal") &&
   document.getElementById("confirm-modal")
) {
   console.log("Adaptador de modais inicializado na página de administração");

   // Criar uma classe que utiliza os modais existentes da página de administração
   class AdminModalAdapter {
      constructor() {
         // Capturar elementos do DOM
         this.messageModal = document.getElementById("message-modal");
         this.messageContent = document.getElementById("message-content");
         this.confirmModal = document.getElementById("confirm-modal");
         this.btnConfirmDelete = document.getElementById("btn-confirm-delete");
         this.btnCancelDelete = document.getElementById("btn-cancel-delete");

         // Inicializar listeners para fechar modais
         this.setupListeners();
      }

      setupListeners() {
         // Garantir que os botões de fechar modais funcionem
         const closeMessageModal = document.querySelector(
            ".close-message-modal"
         );
         if (closeMessageModal) {
            closeMessageModal.addEventListener("click", () => {
               this.messageModal.style.display = "none";
            });
         }

         // Fechar com clique fora do modal
         window.addEventListener("click", (e) => {
            if (e.target === this.messageModal) {
               this.messageModal.style.display = "none";
            }
            if (e.target === this.confirmModal) {
               this.confirmModal.style.display = "none";
               // Rejeitar a promise pendente
               if (this.currentReject) {
                  this.currentReject("cancelled");
                  this.currentResolve = null;
                  this.currentReject = null;
               }
            }
         });

         // Fechar com ESC
         document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
               if (this.messageModal.style.display === "flex") {
                  this.messageModal.style.display = "none";
               }
               if (this.confirmModal.style.display === "flex") {
                  this.confirmModal.style.display = "none";
                  // Rejeitar a promise pendente
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
       * Exibe uma mensagem de alerta
       * @param {string} message - Texto da mensagem
       * @param {string} title - Título (não utilizado nos modais existentes, mantido para compatibilidade)
       * @param {string} type - Tipo da mensagem ('sucesso' ou 'erro')
       * @returns {Promise} - Promise que resolve quando o modal é fechado
       */
      alert(message, title = "Aviso", type = "info") {
         return new Promise((resolve) => {
            this.messageContent.innerHTML = "";

            const msgElement = document.createElement("div");

            // Mapeamento dos tipos para os estilos existentes
            let msgType = "sucesso";
            if (type === "error") msgType = "erro";
            if (type === "warning") msgType = "erro";
            if (type === "info") msgType = "sucesso";

            msgElement.classList.add("message", `message-${msgType}`);
            msgElement.textContent = message;

            this.messageContent.appendChild(msgElement);
            this.messageModal.style.display = "flex";

            // Fechar automaticamente após 3 segundos, como na implementação original
            setTimeout(() => {
               this.messageModal.style.display = "none";
               resolve(true);
            }, 3000);

            // Permitir fechar manualmente
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
       * Exibe uma confirmação com botões Sim/Não
       * @param {string} message - Texto da pergunta
       * @param {string} title - Título da confirmação
       * @param {string} type - Tipo da confirmação
       * @returns {Promise<boolean>} - Promise que resolve com true (sim) ou false (não)
       */
      confirm(message, title = "Confirmação", type = "warning") {
         return new Promise((resolve, reject) => {
            // Guardar referências para uso em event listeners
            this.currentResolve = resolve;
            this.currentReject = reject;

            // Atualizar o texto da confirmação
            const confirmTitle = this.confirmModal.querySelector("h3");
            const confirmMessage = this.confirmModal.querySelector("p");

            if (confirmTitle) confirmTitle.textContent = title;
            if (confirmMessage) confirmMessage.textContent = message;

            // Limpar event listeners anteriores
            const btnConfirm = this.btnConfirmDelete;
            const btnCancel = this.btnCancelDelete;

            const newBtnConfirm = btnConfirm.cloneNode(true);
            const newBtnCancel = btnCancel.cloneNode(true);

            btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);
            btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

            this.btnConfirmDelete = newBtnConfirm;
            this.btnCancelDelete = newBtnCancel;

            // Adicionar novos event listeners
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

            // Exibir o modal
            this.confirmModal.style.display = "flex";
         });
      }

      /**
       * Exibe uma mensagem de sucesso
       * @param {string} message - Texto da mensagem
       * @param {string} title - Título
       * @returns {Promise} - Promise que resolve quando o modal é fechado
       */
      success(message, title = "Sucesso") {
         return this.alert(message, title, "success");
      }

      /**
       * Exibe uma mensagem de erro
       * @param {string} message - Texto da mensagem
       * @param {string} title - Título
       * @returns {Promise} - Promise que resolve quando o modal é fechado
       */
      error(message, title = "Erro") {
         return this.alert(message, title, "error");
      }
   }

   // Criar uma instância do adaptador e disponibilizá-la globalmente
   window.customModal = new AdminModalAdapter();

   // Substituição das funções originais para usar nossos modais
   const originalMostrarMensagem = window.mostrarMensagem;

   window.mostrarMensagem = function (mensagem, tipo = "sucesso") {
      // Se a função original existe, substituímos seu comportamento
      if (originalMostrarMensagem) {
         // Chamar a versão com modais personalizados
         if (tipo === "sucesso") {
            window.customModal.success(mensagem);
         } else {
            window.customModal.error(mensagem);
         }
      }
   };

   // Função para confirmar exclusão com o modal personalizado
   const originalConfirmarExclusao = window.confirmarExclusao;

   window.confirmarExclusao = async function (userId) {
      // Guardar o ID para exclusão
      window.usuarioIdParaExcluir = userId;

      // Usar o modal personalizado
      const confirmado = await window.customModal.confirm(
         "Tem certeza que deseja excluir este usuário?",
         "Confirmar Exclusão",
         "warning"
      );

      if (confirmado) {
         // Se confirmou, chamar a função de exclusão
         await excluirUsuario(userId);
      }
   };

   console.log("Adaptador de modais configurado com sucesso");
} else {
   console.log(
      "Página de administração não detectada, adaptador não inicializado"
   );
}
