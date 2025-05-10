function toggleMenu() {
   const menu = document.querySelector(".mobile-menu");
   menu.classList.toggle("open");
}
document.addEventListener("click", function (e) {
   const menu = document.querySelector(".mobile-menu");
   const hamburgerMenu = document.querySelector(".hamburger-menu");

   if (
      menu &&
      hamburgerMenu &&
      !menu.contains(e.target) &&
      !hamburgerMenu.contains(e.target)
   ) {
      menu.classList.remove("open");
   }
});
function toggleUserMenu() {
   console.log("toggleUserMenu chamado");
   const userMenu = document.getElementById("user-menu");

   if (userMenu) {
      if (userMenu.style.display === "none" || userMenu.style.display === "") {
         userMenu.style.display = "block";
         console.log("Menu aberto");
      } else {
         userMenu.style.display = "none";
         console.log("Menu fechado");
      }
   } else {
      console.error("Elemento user-menu não encontrado");
   }
}
document.addEventListener("click", function (e) {
   const userMenu = document.getElementById("user-menu");
   const avatar = document.querySelector(".avatar");

   if (
      userMenu &&
      avatar &&
      !userMenu.contains(e.target) &&
      e.target !== avatar
   ) {
      userMenu.style.display = "none";
   }
});
function openEditModal() {
   console.log("openEditModal chamado");
   const modal = document.getElementById("edit-modal");

   if (modal) {
      modal.style.display = "flex";
      console.log("Modal aberto");
      const userMenu = document.getElementById("user-menu");
      if (userMenu) {
         userMenu.style.display = "none";
      }
   } else {
      console.error("Elemento edit-modal não encontrado");
   }
}

function closeEditModal() {
   console.log("closeEditModal chamado");
   const modal = document.getElementById("edit-modal");

   if (modal) {
      modal.style.display = "none";
      console.log("Modal fechado");
   }
}
document.addEventListener("click", function (e) {
   const modal = document.getElementById("edit-modal");
   const modalContent = modal ? modal.querySelector(".modal-content") : null;

   if (
      modal &&
      modalContent &&
      e.target === modal &&
      !modalContent.contains(e.target)
   ) {
      modal.style.display = "none";
   }
});
document.addEventListener("DOMContentLoaded", function () {
   console.log("DOMContentLoaded - Inicializando scripts");

   const editForm = document.getElementById("edit-form");

   if (editForm) {
      console.log(
         "Formulário de edição encontrado, configurando evento submit"
      );

      editForm.addEventListener("submit", function (e) {
         e.preventDefault();
         console.log("Formulário submetido");

         const nome = document.getElementById("edit-name").value;
         console.log("Nome a ser atualizado:", nome);
         const xhr = new XMLHttpRequest();
         const formData = new FormData(editForm);

         xhr.open("POST", editForm.action, true);
         xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
               console.log("Status da resposta:", xhr.status);
               console.log("Resposta completa:", xhr.responseText);

               if (xhr.status === 200) {
                  try {
                     const data = JSON.parse(xhr.responseText);
                     console.log("Dados parseados:", data);

                     if (data.success) {
                        const userNameElement =
                           document.getElementById("user-name");
                        if (userNameElement) {
                           userNameElement.textContent = nome;
                           console.log("Nome atualizado na interface");
                        }
                        closeEditModal();
                        alert("Nome atualizado com sucesso!");
                     } else {
                        console.error(
                           "Erro retornado pelo servidor:",
                           data.message
                        );
                        alert("Erro ao atualizar: " + data.message);
                     }
                  } catch (error) {
                     console.error("Erro ao parsear resposta JSON:", error);
                     console.error("Resposta recebida:", xhr.responseText);
                     alert("Erro ao processar resposta do servidor.");
                  }
               } else {
                  console.error("Erro HTTP:", xhr.status);
                  alert("Erro de comunicação com o servidor.");
               }
            }
         };

         console.log("Enviando requisição...");
         xhr.send(formData);
      });
   } else {
      console.warn("Formulário de edição não encontrado");
   }
});
