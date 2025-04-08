const usuarios = [
   {
      id: 1,
      usuario: "joaosilva",
      nome: "João Silva",
      senha: "123456",
      admin: "1",
   },
   {
      id: 2,
      usuario: "josearoldo",
      nome: "José Aroldo",
      senha: "senha123",
      admin: "0",
   },
   {
      id: 3,
      usuario: "neutonfragoso",
      nome: "Neuton Fragoso",
      senha: "admin123",
      admin: "1",
   },
];

// Seletores do DOM
const userList = document.querySelector(".user-list");
const placeholder = document.getElementById("details-placeholder");
const userForm = document.getElementById("user-form");
const userModal = document.getElementById("user-modal");
const modalContent = document.getElementById("modal-content");
const closeModal = document.querySelector(".close-modal");

// Função para verificar se é um dispositivo móvel
function isMobile() {
   return window.innerWidth <= 768;
}

// Função para exibir os detalhes do usuário
function showUserDetails(userData) {
   // Preenche os campos do formulário
   document.getElementById("id").value = userData.id;
   document.getElementById("usuario").value = userData.usuario;
   document.getElementById("nome").value = userData.nome;
   document.getElementById("senha").value = userData.senha;

   // Corrigindo o seletor para o radio button
   const radioSelector = `input[name="admin"][value="${userData.admin}"]`;
   const radioButton = document.querySelector(radioSelector);
   if (radioButton) {
      radioButton.checked = true;
   }

   if (isMobile()) {
      // Em dispositivos móveis, exibe o modal
      const formClone = userForm.cloneNode(true);
      formClone.classList.remove("hidden");

      // Limpa o conteúdo anterior do modal
      modalContent.innerHTML = "";
      modalContent.appendChild(formClone);

      // Exibe o modal
      userModal.style.display = "flex";

      // Adiciona evento de submit ao formulário clonado
      formClone.addEventListener("submit", function (e) {
         e.preventDefault();
         // Aqui você pode adicionar a lógica para salvar as alterações
         userModal.style.display = "none";
      });
   } else {
      // Em desktop, exibe no painel lateral
      placeholder.classList.add("hidden");
      userForm.classList.remove("hidden");
   }
}

// Função para criar e exibir os cards de usuários
function renderUserCards() {
   userList.innerHTML = ""; // Limpa a lista antes de renderizar

   usuarios.forEach((user) => {
      const card = document.createElement("div");
      card.classList.add("user-card");

      card.innerHTML = `
       <img src="../image/avatar.png" alt="avatar genérico" />
       <div class="user-info">
         <p class="user-name">${user.nome}</p>
       </div>
       <div class="user-actions">
         <i class="bi bi-pencil-square user-edit" title="Editar"></i>
         <i class="bi bi-trash user-delete" title="Excluir"></i>
       </div>
     `;

      // Evento ao clicar no card inteiro
      card.addEventListener("click", () => {
         showUserDetails(user);
      });

      userList.appendChild(card);
   });
}

// Fecha o modal quando clica no X
closeModal.addEventListener("click", () => {
   userModal.style.display = "none";
});

// Fecha o modal quando clica fora do conteúdo
window.addEventListener("click", (e) => {
   if (e.target === userModal) {
      userModal.style.display = "none";
   }
});

// Manipula o redimensionamento da janela
window.addEventListener("resize", () => {
   if (!isMobile()) {
      userModal.style.display = "none";
   }
});

// Inicializa a lista
renderUserCards();

// Eventos para o formulário principal
userForm.addEventListener("submit", function (e) {
   e.preventDefault();
   // Aqui você pode adicionar a lógica para salvar as alterações
});
