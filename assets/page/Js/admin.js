// Variáveis globais
let usuarios = [];
let modoEdicao = false;
let usuarioIdParaExcluir = null;

// Seletores do DOM
const userList = document.querySelector(".user-list");
const placeholder = document.getElementById("details-placeholder");
const userForm = document.getElementById("user-form");
const formTitle = document.getElementById("form-title");
const userModal = document.getElementById("user-modal");
const modalContent = document.getElementById("modal-content");
const closeModal = document.querySelector(".close-modal");
const btnNovoUsuario = document.getElementById("btn-novo-usuario");
const btnCancelar = document.getElementById("btn-cancelar");

// Eventos para os elementos da página
document.addEventListener("DOMContentLoaded", function () {
   // Inicializar a lista de usuários
   carregarUsuarios();

   // Evento para o botão de novo usuário
   btnNovoUsuario.addEventListener("click", () => {
      mostrarFormulario("novo");
   });

   // Evento para o botão de cancelar
   btnCancelar.addEventListener("click", () => {
      limparFormulario();
      userForm.classList.add("hidden");
      placeholder.classList.remove("hidden");
   });

   // Evento de submit do formulário
   userForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = {
         id: document.getElementById("id").value,
         usuario: document.getElementById("usuario").value,
         nome: document.getElementById("nome").value,
         senha: document.getElementById("senha").value,
         admin: document.querySelector('input[name="admin"]:checked').value,
         ativo: document.querySelector('input[name="ativo"]:checked').value, // Adicionado campo ativo
      };

      if (modoEdicao) {
         await atualizarUsuario(formData);
      } else {
         await criarUsuario(formData);
      }
   });

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
});

// Carregar usuários do servidor
async function carregarUsuarios() {
   try {
      const resposta = await fetch("api_usuarios.php?acao=listar_usuarios");

      if (!resposta.ok) {
         throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      usuarios = await resposta.json();
      renderUserCards();
   } catch (erro) {
      console.error("Erro ao carregar usuários:", erro);
      customModal.error(
         "Erro ao carregar usuários. Tente novamente mais tarde."
      );
   }
}

// Função para verificar se é um dispositivo móvel
function isMobile() {
   return window.innerWidth <= 768;
}

// Função para limpar o formulário
function limparFormulario() {
   userForm.reset();
   document.getElementById("id").value = "";
}

// Função para mostrar o formulário de edição ou criação
function mostrarFormulario(modo, userData = null) {
   modoEdicao = modo === "edicao";

   // Atualizar o título do formulário
   formTitle.textContent = modoEdicao ? "Editar Usuário" : "Novo Usuário";

   // Limpar o formulário primeiro
   limparFormulario();

   // Se for edição, preencher com os dados existentes
   if (modoEdicao && userData) {
      document.getElementById("id").value = userData.id;
      document.getElementById("usuario").value = userData.usuario;
      document.getElementById("nome").value = userData.nome;
      document.getElementById("senha").value = ""; // Não preenchemos a senha por segurança

      // Selecionar o radio button correto para admin
      const radioSelector = `input[name="admin"][value="${userData.admin}"]`;
      const radioButton = document.querySelector(radioSelector);
      if (radioButton) {
         radioButton.checked = true;
      }

      // Selecionar o radio button correto para status (ativo/inativo)
      const statusSelector = `input[name="ativo"][value="${userData.ativo}"]`;
      const statusButton = document.querySelector(statusSelector);
      if (statusButton) {
         statusButton.checked = true;
      }
   } else {
      // Valores padrão para novos usuários
      document.getElementById("admin-nao").checked = true;
      document.getElementById("ativo-sim").checked = true; // Novo usuário vem ativo por padrão
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
      formClone.addEventListener("submit", async function (e) {
         e.preventDefault();

         const formData = {
            id: this.querySelector("#id").value,
            usuario: this.querySelector("#usuario").value,
            nome: this.querySelector("#nome").value,
            senha: this.querySelector("#senha").value,
            admin: this.querySelector('input[name="admin"]:checked').value,
            ativo: this.querySelector('input[name="ativo"]:checked').value, // Adicionado campo ativo
         };

         if (modoEdicao) {
            await atualizarUsuario(formData);
         } else {
            await criarUsuario(formData);
         }

         userModal.style.display = "none";
      });
   } else {
      // Em desktop, exibe no painel lateral
      placeholder.classList.add("hidden");
      userForm.classList.remove("hidden");
   }
}

// Função para exibir os detalhes do usuário
async function exibirDetalhesUsuario(userId) {
   try {
      const resposta = await fetch(
         `api_usuarios.php?acao=obter_usuario&id=${userId}`
      );

      if (!resposta.ok) {
         throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const userData = await resposta.json();

      if (userData.erro) {
         throw new Error(userData.erro);
      }

      mostrarFormulario("edicao", userData);
   } catch (erro) {
      console.error("Erro ao obter detalhes do usuário:", erro);
      customModal.error("Erro ao obter detalhes do usuário.");
   }
}

// Função para criar um novo usuário
async function criarUsuario(formData) {
   try {
      const resposta = await fetch("api_usuarios.php?acao=criar_usuario", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(formData),
      });

      if (!resposta.ok) {
         throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const resultado = await resposta.json();

      if (resultado.erro) {
         throw new Error(resultado.erro);
      }

      customModal.success(resultado.mensagem || "Usuário criado com sucesso!");
      await carregarUsuarios(); // Recarregar a lista
      limparFormulario();

      // Esconder o formulário e mostrar o placeholder
      userForm.classList.add("hidden");
      placeholder.classList.remove("hidden");
   } catch (erro) {
      console.error("Erro ao criar usuário:", erro);
      customModal.error("Erro ao criar usuário: " + erro.message);
   }
}

// Função para atualizar um usuário existente
async function atualizarUsuario(formData) {
   try {
      // Garantir que admin e ativo sejam números inteiros
      formData.admin = parseInt(formData.admin);
      formData.ativo = parseInt(formData.ativo);

      console.log("Dados a serem enviados:", formData); // Debug para ver os dados enviados

      const resposta = await fetch("api_usuarios.php?acao=atualizar_usuario", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(formData),
      });

      if (!resposta.ok) {
         throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const resultado = await resposta.json();

      if (resultado.erro) {
         throw new Error(resultado.erro);
      }

      customModal.success(
         resultado.mensagem || "Usuário atualizado com sucesso!"
      );
      await carregarUsuarios(); // Recarregar a lista
      limparFormulario();

      // Esconder o formulário e mostrar o placeholder
      userForm.classList.add("hidden");
      placeholder.classList.remove("hidden");
   } catch (erro) {
      console.error("Erro ao atualizar usuário:", erro);
      customModal.error("Erro ao atualizar usuário: " + erro.message);
   }
}

// Função para excluir um usuário
async function excluirUsuario(userId) {
   try {
      const resposta = await fetch(
         `api_usuarios.php?acao=excluir_usuario&id=${userId}`
      );

      if (!resposta.ok) {
         throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const resultado = await resposta.json();

      if (resultado.erro) {
         throw new Error(resultado.erro);
      }

      customModal.success(
         resultado.mensagem || "Usuário excluído com sucesso!"
      );
      await carregarUsuarios(); // Recarregar a lista

      // Esconder o formulário e mostrar o placeholder se estiver em modo desktop
      if (!isMobile()) {
         userForm.classList.add("hidden");
         placeholder.classList.remove("hidden");
      }
   } catch (erro) {
      console.error("Erro ao excluir usuário:", erro);
      customModal.error("Erro ao excluir usuário: " + erro.message);
   }
}

// Função para confirmar exclusão de usuário
function confirmarExclusao(userId) {
   customModal
      .confirm(
         "Tem certeza que deseja excluir este usuário?",
         "Confirmar Exclusão",
         "warning"
      )
      .then((confirmado) => {
         if (confirmado) {
            excluirUsuario(userId);
         }
      });
}

// Função para criar e exibir os cards de usuários
function renderUserCards() {
   userList.innerHTML = ""; // Limpa a lista antes de renderizar

   if (usuarios.length === 0) {
      const mensagem = document.createElement("div");
      mensagem.classList.add("no-users-message");
      mensagem.textContent = "Nenhum usuário cadastrado.";
      userList.appendChild(mensagem);
      return;
   }

   usuarios.forEach((user) => {
      const card = document.createElement("div");
      card.classList.add("user-card");

      // Adicionar classe para usuários inativos
      if (user.ativo == 0) {
         card.classList.add("user-inactive");
      }

      card.innerHTML = `
            <img src="../image/avatar.png" alt="avatar genérico" />
            <div class="user-info">
                <p class="user-name">${user.nome}</p>
                <p class="user-login">${user.usuario}</p>
                <p class="user-admin">${
                   user.admin == 1 ? "✔️ Admin" : "❌ Usuário comum"
                }</p>
                <p class="user-status">${
                   user.ativo == 1 ? "✅ Ativo" : "❌ Inativo"
                }</p>
            </div>
            <div class="user-actions">
                <i class="bi bi-pencil-square user-edit" title="Editar"></i>
                <i class="bi bi-trash user-delete" title="Excluir"></i>
            </div>
        `;

      // Evento ao clicar no card para exibir detalhes
      card.addEventListener("click", (e) => {
         // Evitar acionamento múltiplo se clicar nos ícones
         if (
            !e.target.classList.contains("user-edit") &&
            !e.target.classList.contains("user-delete")
         ) {
            exibirDetalhesUsuario(user.id);
         }
      });

      // Eventos específicos para os botões de ação
      const btnEdit = card.querySelector(".user-edit");
      btnEdit.addEventListener("click", (e) => {
         e.stopPropagation(); // Impedir a propagação para o card
         exibirDetalhesUsuario(user.id);
      });

      const btnDelete = card.querySelector(".user-delete");
      btnDelete.addEventListener("click", (e) => {
         e.stopPropagation(); // Impedir a propagação para o card
         confirmarExclusao(user.id);
      });

      userList.appendChild(card);
   });
}
