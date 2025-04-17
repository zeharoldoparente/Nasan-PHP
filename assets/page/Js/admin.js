// Variáveis globais
let usuarios = [];
let modoEdicao = false;
let usuarioIdParaExcluir = null;
const DEV_USER_ID = 3; // ID do usuário desenvolvedor que deve ficar oculto

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

      const todosUsuarios = await resposta.json();

      // Filtrar o usuário desenvolvedor (ID 3) da lista exibida
      usuarios = todosUsuarios.filter(
         (user) => parseInt(user.id) !== DEV_USER_ID
      );

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
   // Proteção adicional: não permitir edição do usuário desenvolvedor
   if (userData && parseInt(userData.id) === DEV_USER_ID) {
      customModal.error("Este usuário não pode ser editado.");
      return;
   }

   modoEdicao = modo === "edicao";

   // Garantir que os valores de admin e ativo sejam números
   if (modoEdicao && userData) {
      // Converter para inteiros se forem string
      userData.admin = parseInt(userData.admin);
      userData.ativo = parseInt(userData.ativo);

      // Log para verificar os valores recebidos
      console.log("Dados do usuário para edição:", userData);
      console.log("Admin:", userData.admin, "Tipo:", typeof userData.admin);
      console.log("Ativo:", userData.ativo, "Tipo:", typeof userData.ativo);
   }

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
      } else {
         console.error(
            "Radio button para admin não encontrado:",
            radioSelector
         );
      }

      // Selecionar o radio button correto para status (ativo/inativo)
      const statusSelector = `input[name="ativo"][value="${userData.ativo}"]`;
      const statusButton = document.querySelector(statusSelector);
      if (statusButton) {
         statusButton.checked = true;
      } else {
         console.error(
            "Radio button para ativo não encontrado:",
            statusSelector
         );
      }
   } else {
      // Valores padrão para novos usuários
      document.getElementById("admin-nao").checked = true;
      document.getElementById("ativo-sim").checked = true; // Novo usuário vem ativo por padrão
   }

   if (isMobile()) {
      // Em dispositivos móveis, exibe o modal
      // CORREÇÃO: Não usar cloneNode, mas criar uma cópia do HTML com novos IDs
      modalContent.innerHTML = ""; // Limpa o conteúdo anterior

      const formModalHTML = `
         <form id="user-form-modal" class="user-form">
            <h3>${modoEdicao ? "Editar Usuário" : "Novo Usuário"}</h3>
            <div class="form-group">
               <label for="id-modal">ID:</label>
               <input type="text" id="id-modal" name="id" value="${
                  modoEdicao && userData ? userData.id : ""
               }" disabled />
            </div>

            <div class="form-group">
               <label for="usuario-modal">Usuário:</label>
               <input type="text" id="usuario-modal" name="usuario" value="${
                  modoEdicao && userData ? userData.usuario : ""
               }" required />
            </div>

            <div class="form-group">
               <label for="nome-modal">Nome:</label>
               <input type="text" id="nome-modal" name="nome" value="${
                  modoEdicao && userData ? userData.nome : ""
               }" required />
            </div>

            <div class="form-group">
               <label for="senha-modal">Senha:</label>
               <input type="password" id="senha-modal" name="senha" placeholder="Deixe em branco para manter a senha atual" />
            </div>

            <div class="form-group">
               <label>Administrador?</label>
               <div class="admin-radio-group">
                  <input
                     type="radio"
                     id="admin-nao-modal"
                     name="admin"
                     value="0"
                     ${
                        !modoEdicao ||
                        (modoEdicao && userData && userData.admin == 0)
                           ? "checked"
                           : ""
                     } />
                  <label for="admin-nao-modal" class="radio-nao">
                     <i class="bi bi-person-fill" style="color: green;"></i> Usuário comum
                  </label>

                  <input
                     type="radio"
                     id="admin-sim-modal"
                     name="admin"
                     value="1"
                     ${
                        modoEdicao && userData && userData.admin == 1
                           ? "checked"
                           : ""
                     } />
                  <label for="admin-sim-modal" class="radio-sim">
                     <i class="bi bi-person-fill-gear" style="color: blue;"></i> Admin
                  </label>
               </div>
            </div>

            <div class="form-group">
               <label>Status do Usuário:</label>
               <div class="status-radio-group">
                  <input
                     type="radio"
                     id="ativo-sim-modal"
                     name="ativo"
                     value="1"
                     ${
                        !modoEdicao ||
                        (modoEdicao && userData && userData.ativo == 1)
                           ? "checked"
                           : ""
                     } />
                  <label for="ativo-sim-modal" class="radio-sim">
                     <i class="bi bi-person-check" style="color: green;"></i> Ativo
                  </label>

                  <input
                     type="radio"
                     id="ativo-nao-modal"
                     name="ativo"
                     value="0"
                     ${
                        modoEdicao && userData && userData.ativo == 0
                           ? "checked"
                           : ""
                     } />
                  <label for="ativo-nao-modal" class="radio-nao">
                     <i class="bi bi-person-fill-slash" style="color: red;"></i> Inativo
                  </label>
               </div>
            </div>

            <div class="form-actions">
               <button type="submit" id="btn-salvar-modal">Salvar Alterações</button>
               <button type="button" id="btn-cancelar-modal" class="btn-cancel">Cancelar</button>
            </div>
         </form>
      `;

      modalContent.innerHTML = formModalHTML;

      // Exibe o modal
      userModal.style.display = "flex";

      // Adiciona evento de submit ao formulário do modal
      const formModal = document.getElementById("user-form-modal");
      formModal.addEventListener("submit", async function (e) {
         e.preventDefault();

         // Corrigindo para selecionar os radio buttons dentro do modal
         const adminChecked = formModal.querySelector(
            'input[name="admin"]:checked'
         );
         const ativoChecked = formModal.querySelector(
            'input[name="ativo"]:checked'
         );

         if (!adminChecked || !ativoChecked) {
            customModal.error(
               "Por favor selecione todas as opções necessárias."
            );
            return;
         }

         const formData = {
            id: document.getElementById("id-modal").value,
            usuario: document.getElementById("usuario-modal").value,
            nome: document.getElementById("nome-modal").value,
            senha: document.getElementById("senha-modal").value,
            admin: adminChecked.value,
            ativo: ativoChecked.value,
         };

         console.log("Dados do formulário modal:", formData); // Log para debug

         if (modoEdicao) {
            await atualizarUsuario(formData);
         } else {
            await criarUsuario(formData);
         }

         userModal.style.display = "none";
      });

      // Adiciona evento ao botão cancelar do modal
      document
         .getElementById("btn-cancelar-modal")
         .addEventListener("click", () => {
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
      // Proteção adicional: não exibir detalhes do usuário desenvolvedor
      if (parseInt(userId) === DEV_USER_ID) {
         customModal.error("Detalhes deste usuário não estão disponíveis.");
         return;
      }

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
      // Proteção adicional: bloquear qualquer tentativa de atualizar o usuário desenvolvedor
      if (parseInt(formData.id) === DEV_USER_ID) {
         throw new Error("Este usuário não pode ser modificado.");
      }

      // Garantir que admin e ativo sejam números inteiros
      formData.admin = parseInt(formData.admin);
      formData.ativo = parseInt(formData.ativo);

      // Log detalhado para depuração
      console.log("Dados a serem enviados:", formData);
      console.log(
         "Tipo de admin:",
         typeof formData.admin,
         "Valor:",
         formData.admin
      );
      console.log(
         "Tipo de ativo:",
         typeof formData.ativo,
         "Valor:",
         formData.ativo
      );

      // Verificar se os valores são válidos antes de enviar
      if (isNaN(formData.admin) || isNaN(formData.ativo)) {
         throw new Error(
            "Os valores de admin ou ativo não são números válidos."
         );
      }

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
      // Proteção adicional: impedir exclusão do usuário desenvolvedor
      if (parseInt(userId) === DEV_USER_ID) {
         throw new Error("Este usuário não pode ser excluído.");
      }

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
   // Proteção adicional: impedir confirmação de exclusão do usuário desenvolvedor
   if (parseInt(userId) === DEV_USER_ID) {
      customModal.error("Este usuário não pode ser excluído.");
      return;
   }

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

// Função para renderizar ícones com base no estado do usuário
function getUserStatusIcons(user) {
   let adminIcon = "";
   let statusIcon = "";

   // Ícone de administrador
   if (user.admin == 1) {
      adminIcon =
         '<i class="bi bi-person-fill-gear" style="color: blue;" title="Administrador"></i>';
   } else {
      adminIcon =
         '<i class="bi bi-person-fill" style="color: green;" title="Usuário comum"></i>';
   }

   // Ícone de status
   if (user.ativo == 1) {
      statusIcon =
         '<i class="bi bi-person-check" style="color: green;" title="Ativo"></i>';
   } else {
      statusIcon =
         '<i class="bi bi-person-fill-slash" style="color: red;" title="Inativo"></i>';
   }

   return { adminIcon, statusIcon };
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

      // Obter ícones baseados no estado do usuário
      const { adminIcon, statusIcon } = getUserStatusIcons(user);

      card.innerHTML = `
            <img src="../image/avatar.png" alt="avatar genérico" />
            <div class="user-info">
                <p class="user-name">${user.nome}</p>
                <p class="user-login">${user.usuario}</p>
                <div class="user-status-icons">
                    ${adminIcon}
                    ${statusIcon}
                </div>
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
