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
      });
   });

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
                  document.getElementById("cliente-id").textContent = itemId;
               } else if (formId === "produtoForm") {
                  document.getElementById("produto-id").textContent = itemId;
               }

               // Exibe o formulário no painel
               formPanel.style.display = "block";
            }
         });
      });
   }

   // Configuração para Clientes
   setupListItems(
      ".cliente-item",
      "form-cliente-panel",
      "clienteForm",
      "Cliente"
   );

   // Configuração para Produtos
   setupListItems(
      ".produto-item",
      "form-produto-panel",
      "produtoForm",
      "Produto"
   );

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

               // Define título e exibe o modal
               let modalFormTitle = `Novo ${itemType}`;
               openModal(modalFormTitle, formClone);

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
      const btnCancel = form.querySelector(".btn-cancel");
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

            // Aqui você faria o envio dos dados para o servidor
            // Simulação de processamento
            alert("Formulário enviado com sucesso!");

            // Fecha o modal após enviar (se estiver no mobile)
            if (isMobile && callback) {
               callback();
            }

            // Reset ao formulário
            form.reset();
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
