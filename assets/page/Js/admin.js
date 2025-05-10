let usuarios = [];
let modoEdicao = false;
let usuarioIdParaExcluir = null;
const DEV_USER_ID = 3;

const userList = document.querySelector(".user-list");
const placeholder = document.getElementById("details-placeholder");
const userForm = document.getElementById("user-form");
const formTitle = document.getElementById("form-title");
const userModal = document.getElementById("user-modal");
const modalContent = document.getElementById("modal-content");
const btnNovoUsuario = document.getElementById("btn-novo-usuario");
const btnCancelar = document.getElementById("btn-cancelar");

document.addEventListener("DOMContentLoaded", function () {
   carregarUsuarios();

   btnNovoUsuario.addEventListener("click", () => {
      mostrarFormulario("novo");
   });

   btnCancelar.addEventListener("click", () => {
      limparFormulario();
      userForm.classList.add("hidden");
      placeholder.classList.remove("hidden");
   });

   userForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = {
         id: document.getElementById("id").value,
         usuario: document.getElementById("usuario").value,
         nome: document.getElementById("nome").value,
         senha: document.getElementById("senha").value,
         admin: document.querySelector('input[name="admin"]:checked').value,
         ativo: document.querySelector('input[name="ativo"]:checked').value,
      };

      if (modoEdicao) {
         await atualizarUsuario(formData);
      } else {
         await criarUsuario(formData);
      }
   });

   const btnCloseModalElements = document.querySelectorAll(".btn-close-modal");
   btnCloseModalElements.forEach((btn) => {
      btn.addEventListener("click", () => {
         userModal.style.display = "none";
      });
   });

   window.addEventListener("click", (e) => {
      if (e.target === userModal) {
         userModal.style.display = "none";
      }
   });

   window.addEventListener("resize", () => {
      if (!isMobile()) {
         userModal.style.display = "none";
      }
   });
});

async function carregarUsuarios() {
   try {
      const resposta = await fetch("api_usuarios.php?acao=listar_usuarios");

      if (!resposta.ok) {
         throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const todosUsuarios = await resposta.json();

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

function isMobile() {
   return window.innerWidth <= 768;
}

function limparFormulario() {
   userForm.reset();
   document.getElementById("id").value = "";
}

function mostrarFormulario(modo, userData = null) {
   if (userData && parseInt(userData.id) === DEV_USER_ID) {
      customModal.error("Este usuário não pode ser editado.");
      return;
   }

   modoEdicao = modo === "edicao";

   if (modoEdicao && userData) {
      userData.admin = parseInt(userData.admin);
      userData.ativo = parseInt(userData.ativo);
   }

   formTitle.textContent = modoEdicao ? "Editar Usuário" : "Novo Usuário";

   limparFormulario();

   if (modoEdicao && userData) {
      document.getElementById("id").value = userData.id;
      document.getElementById("usuario").value = userData.usuario;
      document.getElementById("nome").value = userData.nome;
      document.getElementById("senha").value = ""; // Não preenchemos a senha por segurança

      const radioSelector = `input[name="admin"][value="${userData.admin}"]`;
      const radioButton = document.querySelector(radioSelector);
      if (radioButton) {
         radioButton.checked = true;
      }

      const statusSelector = `input[name="ativo"][value="${userData.ativo}"]`;
      const statusButton = document.querySelector(statusSelector);
      if (statusButton) {
         statusButton.checked = true;
      }
   } else {
      document.getElementById("admin-nao").checked = true;
      document.getElementById("ativo-sim").checked = true;
   }

   if (isMobile()) {
      modalContent.innerHTML = "";

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
                  <label for="admin-nao-modal">
                     <i class="bi bi-person-fill"></i> Usuário comum
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
                  <label for="admin-sim-modal">
                     <i class="bi bi-person-fill-gear"></i> Admin
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
                  <label for="ativo-sim-modal">
                     <i class="bi bi-person-check"></i> Ativo
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
                  <label for="ativo-nao-modal">
                     <i class="bi bi-person-fill-slash"></i> Inativo
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

      userModal.style.display = "flex";

      const formModal = document.getElementById("user-form-modal");
      formModal.addEventListener("submit", async function (e) {
         e.preventDefault();

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

         if (modoEdicao) {
            await atualizarUsuario(formData);
         } else {
            await criarUsuario(formData);
         }

         userModal.style.display = "none";
      });

      document
         .getElementById("btn-cancelar-modal")
         .addEventListener("click", () => {
            userModal.style.display = "none";
         });
   } else {
      placeholder.classList.add("hidden");
      userForm.classList.remove("hidden");
   }
}

async function exibirDetalhesUsuario(userId) {
   try {
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

async function criarUsuario(formData) {
   try {
      const resposta = await fetch("api_usuarios.php?acao=criar_usuario", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
         },
         body: JSON.stringify(formData),
      });

      const contentType = resposta.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const text = await resposta.text();
         console.error("Resposta não-JSON recebida:", text);
         throw new Error("Formato de resposta inválido do servidor");
      }

      if (!resposta.ok) {
         throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const resultado = await resposta.json();

      if (resultado.erro) {
         throw new Error(resultado.erro);
      }

      customModal.success(resultado.mensagem || "Usuário criado com sucesso!");
      await carregarUsuarios();
      limparFormulario();

      userForm.classList.add("hidden");
      placeholder.classList.remove("hidden");
   } catch (erro) {
      console.error("Erro ao criar usuário:", erro);
      customModal.error("Erro ao criar usuário: " + erro.message);
   }
}

async function atualizarUsuario(formData) {
   try {
      if (parseInt(formData.id) === DEV_USER_ID) {
         throw new Error("Este usuário não pode ser modificado.");
      }

      formData.admin = parseInt(formData.admin);
      formData.ativo = parseInt(formData.ativo);

      if (isNaN(formData.admin) || isNaN(formData.ativo)) {
         throw new Error(
            "Os valores de admin ou ativo não são números válidos."
         );
      }

      const resposta = await fetch("api_usuarios.php?acao=atualizar_usuario", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
         },
         body: JSON.stringify(formData),
      });

      const contentType = resposta.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const text = await resposta.text();
         console.error("Resposta não-JSON recebida:", text);
         throw new Error("Formato de resposta inválido do servidor");
      }

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
      await carregarUsuarios();
      limparFormulario();

      userForm.classList.add("hidden");
      placeholder.classList.remove("hidden");
   } catch (erro) {
      console.error("Erro ao atualizar usuário:", erro);
      customModal.error("Erro ao atualizar usuário: " + erro.message);
   }
}

function confirmarExclusao(userId) {
   if (parseInt(userId) === DEV_USER_ID) {
      customModal.error("Este usuário não pode ser excluído.");
      return;
   }

   customModal
      .confirm(
         "Tem certeza que deseja excluir este usuário? Se ele tiver pedidos associados, será inativado em vez de excluído.",
         "Confirmar Exclusão",
         "warning"
      )
      .then((confirmado) => {
         if (confirmado) {
            excluirUsuario(userId);
         }
      });
}

async function excluirUsuario(userId) {
   try {
      if (parseInt(userId) === DEV_USER_ID) {
         throw new Error("Este usuário não pode ser excluído.");
      }

      const resposta = await fetch(
         `api_usuarios.php?acao=excluir_usuario&id=${userId}`,
         {
            method: "GET",
            headers: {
               Accept: "application/json",
               "Content-Type": "application/json",
            },
         }
      );

      const contentType = resposta.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const text = await resposta.text();
         console.error("Resposta não-JSON recebida:", text);
         throw new Error("Formato de resposta inválido do servidor");
      }

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

      await carregarUsuarios();

      if (!isMobile()) {
         userForm.classList.add("hidden");
         placeholder.classList.remove("hidden");
      }
   } catch (erro) {
      console.error("Erro ao excluir usuário:", erro);

      customModal.error(erro.message || "Erro ao excluir usuário.");
   }
}

function getUserStatusIcons(user) {
   let adminIcon = "";
   let statusIcon = "";

   if (user.admin == 1) {
      adminIcon =
         '<i class="bi bi-person-fill-gear" style="color: blue;" title="Administrador"></i>';
   } else {
      adminIcon = '<i class="bi bi-person-fill" title="Usuário comum"></i>';
   }

   if (user.ativo == 1) {
      statusIcon =
         '<i class="bi bi-person-check" style="color: green;" title="Ativo"></i>';
   } else {
      statusIcon =
         '<i class="bi bi-person-fill-slash" style="color: red;" title="Inativo"></i>';
   }

   return { adminIcon, statusIcon };
}

function renderUserCards() {
   userList.innerHTML = "";

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

      if (user.ativo == 0) {
         card.classList.add("user-inactive");
      }

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

      card.addEventListener("click", (e) => {
         if (
            !e.target.classList.contains("user-edit") &&
            !e.target.classList.contains("user-delete")
         ) {
            exibirDetalhesUsuario(user.id);
         }
      });

      const btnEdit = card.querySelector(".user-edit");
      btnEdit.addEventListener("click", (e) => {
         e.stopPropagation();
         exibirDetalhesUsuario(user.id);
      });

      const btnDelete = card.querySelector(".user-delete");
      btnDelete.addEventListener("click", (e) => {
         e.stopPropagation();
         confirmarExclusao(user.id);
      });

      userList.appendChild(card);
   });
}
