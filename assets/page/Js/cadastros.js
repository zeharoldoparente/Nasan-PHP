document.addEventListener("DOMContentLoaded", function () {
   // Sistema de abas
   const tabButtons = document.querySelectorAll(".tab-button");
   const tabContents = document.querySelectorAll(".tab-content");

   tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
         const tabId = button.getAttribute("data-tab");

         // Remove classe active de todos os botões e tabs
         tabButtons.forEach((btn) => btn.classList.remove("active"));
         tabContents.forEach((tab) => tab.classList.remove("active"));

         // Adiciona classe active ao botão clicado e à tab correspondente
         button.classList.add("active");
         document.getElementById(`${tabId}-tab`).classList.add("active");
      });
   });

   // Busca de CEP
   const cepInput = document.getElementById("cep");
   const buscarCepBtn = document.getElementById("buscar-cep");
   const cepStatus = document.getElementById("cep-status");
   const ruaInput = document.getElementById("rua");
   const bairroInput = document.getElementById("bairro");
   const cidadeInput = document.getElementById("cidade");
   const estadoInput = document.getElementById("estado");

   if (buscarCepBtn) {
      buscarCepBtn.addEventListener("click", function () {
         const cep = cepInput.value.replace(/\D/g, "");

         if (cep.length !== 8) {
            cepStatus.textContent = "CEP inválido";
            cepStatus.className = "field-status error";
            return;
         }

         cepStatus.textContent = "Buscando...";
         cepStatus.className = "field-status loading";

         // Simulando busca de CEP (em produção, substituir por API real)
         setTimeout(() => {
            // Simulação de resposta
            const mockData = {
               logradouro: "Avenida Brasil",
               bairro: "Centro",
               localidade: "São Paulo",
               uf: "SP",
            };

            ruaInput.value = mockData.logradouro;
            bairroInput.value = mockData.bairro;
            cidadeInput.value = mockData.localidade;
            estadoInput.value = mockData.uf;

            cepStatus.textContent = "CEP encontrado";
            cepStatus.className = "field-status success";
         }, 1000);
      });
   }

   // Preview de imagem do produto
   const imagemInput = document.getElementById("produto-imagem");
   const imagemPreview = document.querySelector(".produto-imagem-preview");

   if (imagemInput) {
      imagemInput.addEventListener("change", function () {
         if (this.files && this.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e) {
               imagemPreview.innerHTML = `<img src="${e.target.result}" alt="Preview do Produto">`;
            };

            reader.readAsDataURL(this.files[0]);
         }
      });
   }

   // Botões de limpar formulário
   const btnCancelList = document.querySelectorAll(".btn-cancel");

   btnCancelList.forEach((btn) => {
      btn.addEventListener("click", function () {
         // Encontra o formulário pai do botão clicado
         const form = this.closest("form");
         if (form) {
            form.reset();

            // Resetar preview de imagem se estiver no formulário de produtos
            if (form.id === "produtoForm") {
               imagemPreview.innerHTML = '<i class="bi bi-image"></i>';
            }
         }
      });
   });

   // Processamento de formulários (simulado)
   const clienteForm = document.getElementById("clienteForm");
   const produtoForm = document.getElementById("produtoForm");
   const statusCliente = document.getElementById("status-cliente");
   const statusProduto = document.getElementById("status-produto");

   if (clienteForm) {
      clienteForm.addEventListener("submit", function (e) {
         e.preventDefault();

         // Simulação de processamento do formulário
         setTimeout(() => {
            statusCliente.textContent = "Cliente cadastrado com sucesso!";
            statusCliente.className = "status-message status-success";
            statusCliente.style.display = "block";

            setTimeout(() => {
               statusCliente.style.display = "none";
               clienteForm.reset();
            }, 3000);
         }, 500);
      });
   }

   if (produtoForm) {
      produtoForm.addEventListener("submit", function (e) {
         e.preventDefault();

         // Simulação de processamento do formulário
         setTimeout(() => {
            statusProduto.textContent = "Produto cadastrado com sucesso!";
            statusProduto.className = "status-message status-success";
            statusProduto.style.display = "block";

            setTimeout(() => {
               statusProduto.style.display = "none";
               produtoForm.reset();
               imagemPreview.innerHTML = '<i class="bi bi-image"></i>';
            }, 3000);
         }, 500);
      });
   }

   // Formatação de campos
   if (cepInput) {
      cepInput.addEventListener("input", function () {
         this.value = this.value
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .replace(/(-\d{3})\d+?$/, "$1");
      });
   }

   const cnpjInput = document.getElementById("cnpj");
   if (cnpjInput) {
      cnpjInput.addEventListener("input", function () {
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
      });
   }

   const telefoneInput = document.getElementById("telefone");
   if (telefoneInput) {
      telefoneInput.addEventListener("input", function () {
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
      });
   }
});
