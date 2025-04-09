// Função para o menu móvel
function toggleMenu() {
   const menu = document.querySelector(".mobile-menu");
   menu.classList.toggle("open");
}

// Fechar o menu móvel ao clicar fora dele
document.addEventListener("click", function (e) {
   const menu = document.querySelector(".mobile-menu");
   const hamburgerMenu = document.querySelector(".hamburger-menu");
   const logoutButton = document.querySelector(".logout-button");

   if (
      !menu.contains(e.target) &&
      !hamburgerMenu.contains(e.target) &&
      !logoutButton.contains(e.target)
   ) {
      menu.classList.remove("open");
   }
});

// Funções para o menu do usuário
function toggleUserMenu() {
   const userMenu = document.getElementById("user-menu");

   // Alterna a visibilidade do menu
   if (userMenu.style.display === "none" || userMenu.style.display === "") {
      userMenu.style.display = "block";
   } else {
      userMenu.style.display = "none";
   }
}

// Fechar o menu do usuário quando clicar fora dele
document.addEventListener("click", function (e) {
   const userMenu = document.getElementById("user-menu");
   const avatar = document.querySelector(".avatar");

   if (userMenu && !userMenu.contains(e.target) && e.target !== avatar) {
      userMenu.style.display = "none";
   }
});

// Funções para o modal de editar perfil
function openEditModal() {
   const modal = document.getElementById("edit-modal");
   modal.style.display = "flex";

   // Fechar o menu do usuário quando abrir o modal
   const userMenu = document.getElementById("user-menu");
   userMenu.style.display = "none";
}

function closeEditModal() {
   const modal = document.getElementById("edit-modal");
   modal.style.display = "none";
}

// Fechar o modal quando clicar fora dele
document.addEventListener("click", function (e) {
   const modal = document.getElementById("edit-modal");
   const modalContent = document.querySelector(".modal-content");

   if (modal && e.target === modal && !modalContent.contains(e.target)) {
      modal.style.display = "none";
   }
});

// Submeter o formulário de edição via AJAX
document.addEventListener("DOMContentLoaded", function () {
   const editForm = document.getElementById("edit-form");

   if (editForm) {
      editForm.addEventListener("submit", function (e) {
         e.preventDefault();

         const nome = document.getElementById("edit-name").value;

         // Criar um objeto FormData para enviar os dados
         const formData = new FormData();
         formData.append("nome", nome);

         // Enviar via fetch API
         fetch(editForm.action, {
            method: "POST",
            body: formData,
         })
            .then((response) => response.json())
            .then((data) => {
               if (data.success) {
                  // Atualizar o nome na interface
                  document.getElementById("user-name").textContent = nome;

                  // Fechar o modal
                  closeEditModal();

                  // Opcional: mostrar mensagem de sucesso
                  alert("Nome atualizado com sucesso!");
               } else {
                  alert("Erro ao atualizar: " + data.message);
               }
            })
            .catch((error) => {
               console.error("Erro:", error);
               alert("Ocorreu um erro ao processar sua solicitação.");
            });
      });
   }
});
