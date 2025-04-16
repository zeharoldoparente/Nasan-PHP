document.addEventListener("DOMContentLoaded", function () {
   // Obter o valor de isAdmin a partir de um atributo data no HTML
   const isAdmin = document.body.getAttribute("data-is-admin") === "true";

   // Event listener para clicar em uma linha da tabela
   document.querySelectorAll("#tabela-pedidos tbody tr").forEach((row) => {
      row.addEventListener("click", function (e) {
         // Ignorar cliques em elementos da dropdown de status ou botão de exclusão
         if (
            (e.target.closest(".status-dropdown") && isAdmin) ||
            e.target.closest(".btn-delete")
         ) {
            return;
         }

         const pedidoId = this.getAttribute("data-id");
         if (pedidoId) {
            window.location.href = `createPed.php?id=${pedidoId}`;
         }
      });
   });

   // Gerenciar dropdowns de status (apenas para admin)
   if (isAdmin) {
      // Abrir/fechar dropdown de status
      document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
         const pedidoId = dropdown.getAttribute("data-pedido-id");
         const statusBadge = dropdown.querySelector(".status-badge");
         const statusOptions = dropdown.querySelector(".status-options");

         statusBadge.addEventListener("click", function (e) {
            e.stopPropagation(); // Prevenir navegação para detalhes do pedido

            // Fechar todos os outros dropdowns
            document
               .querySelectorAll(".status-options.active")
               .forEach((option) => {
                  if (option !== statusOptions) {
                     option.classList.remove("active");
                  }
               });

            // Alternar estado do dropdown atual
            statusOptions.classList.toggle("active");
         });

         // Clicar fora para fechar
         document.addEventListener("click", function (e) {
            if (!dropdown.contains(e.target)) {
               statusOptions.classList.remove("active");
            }
         });

         // Opções de status
         dropdown.querySelectorAll(".status-option").forEach((option) => {
            option.addEventListener("click", function (e) {
               e.stopPropagation();
               const novoStatus = this.getAttribute("data-status");
               atualizarStatus(pedidoId, novoStatus, statusBadge);
               statusOptions.classList.remove("active");
            });
         });
      });

      // Adicionar evento para botões de exclusão
      document.querySelectorAll(".btn-delete").forEach((button) => {
         button.addEventListener("click", function (e) {
            e.stopPropagation(); // Evitar navegação para a página de detalhes

            const pedidoId = this.getAttribute("data-id");

            // Confirmar antes de excluir
            if (confirm("Tem certeza que deseja excluir este pedido?")) {
               excluirPedido(pedidoId);
            }
         });
      });
   }

   // Função para atualizar o status
   function atualizarStatus(pedidoId, novoStatus, statusBadge) {
      fetch("atualizar_status_pedido.php", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            pedido_id: pedidoId,
            status: novoStatus,
         }),
      })
         .then((response) => response.json())
         .then((data) => {
            if (data.success) {
               // Atualizar a interface
               statusBadge.textContent = novoStatus;

               // Atualizar a classe do status
               const statusClasses = [
                  "status-pendente",
                  "status-aprovado",
                  "status-alteracao",
                  "status-enviado",
                  "status-pago",
                  "status-pago-parcial",
               ];

               // Remover todas as classes anteriores
               statusClasses.forEach((cls) => {
                  statusBadge.classList.remove(cls);
               });

               // Adicionar a classe correta
               let newClass = "";
               switch (novoStatus) {
                  case "Pendente":
                     newClass = "status-pendente";
                     break;
                  case "Aprovado":
                     newClass = "status-aprovado";
                     break;
                  case "Aprovado com Alteração":
                     newClass = "status-alteracao";
                     break;
                  case "Enviado":
                     newClass = "status-enviado";
                     break;
                  case "Pago":
                     newClass = "status-pago";
                     break;
                  case "Pago Parcial":
                     newClass = "status-pago-parcial";
                     break;
               }

               statusBadge.classList.add(newClass);

               // Mostrar mensagem de sucesso
               customModal.success("Status atualizado com sucesso!");
            } else {
               customModal.error("Erro ao atualizar status: " + data.message);
            }
         })
         .catch((error) => {
            console.error("Erro:", error);
            customModal.error("Erro ao atualizar status. Tente novamente.");
         });
   }

   // Função para excluir pedido
   function excluirPedido(pedidoId) {
      fetch("excluir_pedido.php", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            pedido_id: pedidoId,
         }),
      })
         .then((response) => response.json())
         .then((data) => {
            if (data.success) {
               // Remover a linha da tabela
               document.querySelector(`tr[data-id="${pedidoId}"]`).remove();
               customModal.success("Pedido excluído com sucesso!");
            } else {
               customModal.error("Erro ao excluir pedido: " + data.message);
            }
         })
         .catch((error) => {
            console.error("Erro:", error);
            customModal.error("Erro ao excluir pedido. Tente novamente.");
         });
   }

   // Filtro de pedidos
   document
      .getElementById("btn-filtrar")
      .addEventListener("click", function () {
         filtrarPedidos();
      });

   // Permitir pressionar Enter para filtrar
   document.querySelectorAll(".filtro-input").forEach((input) => {
      input.addEventListener("keypress", function (e) {
         if (e.key === "Enter") {
            filtrarPedidos();
         }
      });
   });

   function filtrarPedidos() {
      const numeroPedido = document
         .getElementById("filtro-pedido")
         .value.trim();
      const cliente = document.getElementById("filtro-cliente").value.trim();
      const status = document.getElementById("filtro-status").value;
      let vendedor = "";

      if (isAdmin) {
         const vendedorInput = document.getElementById("filtro-vendedor");
         if (vendedorInput) {
            vendedor = vendedorInput.value.trim();
         }
      }

      // Construir objeto de filtros
      const filtros = {
         numero_pedido: numeroPedido,
         cliente: cliente,
         status: status,
      };

      if (isAdmin) {
         filtros.vendedor = vendedor;
      }

      // Enviar requisição AJAX
      fetch("filtrar_pedidos.php", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(filtros),
      })
         .then((response) => response.json())
         .then((data) => {
            if (data.success) {
               // Atualizar tabela com os resultados
               atualizarTabelaPedidos(data.pedidos);
            } else {
               customModal.error("Erro ao filtrar pedidos: " + data.message);
            }
         })
         .catch((error) => {
            console.error("Erro:", error);
            customModal.error("Erro ao filtrar pedidos. Tente novamente.");
         });
   }

   function atualizarTabelaPedidos(pedidos) {
      const tbody = document.getElementById("lista-pedidos");
      tbody.innerHTML = "";

      if (pedidos.length === 0) {
         const tr = document.createElement("tr");
         tr.innerHTML = `<td colspan="${
            isAdmin ? 8 : 7
         }" class="sem-pedidos">Nenhum pedido encontrado</td>`;
         tbody.appendChild(tr);
         return;
      }

      pedidos.forEach((pedido) => {
         const tr = document.createElement("tr");
         tr.setAttribute("data-id", pedido.id);

         // Determinar a classe do status
         let statusClass = "";
         switch (pedido.status) {
            case "Pendente":
               statusClass = "status-pendente";
               break;
            case "Aprovado":
               statusClass = "status-aprovado";
               break;
            case "Aprovado com Alteração":
               statusClass = "status-alteracao";
               break;
            case "Enviado":
               statusClass = "status-enviado";
               break;
            case "Pago":
               statusClass = "status-pago";
               break;
            case "Pago Parcial":
               statusClass = "status-pago-parcial";
               break;
            default:
               statusClass = "status-pendente";
         }

         // Formatar data
         const dataPedido = new Date(pedido.data_pedido);
         const dataFormatada = `${dataPedido
            .getDate()
            .toString()
            .padStart(2, "0")}/${(dataPedido.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${dataPedido.getFullYear()}`;

         // Formatar valor
         const valorFormatado =
            "R$ " +
            parseFloat(pedido.valor_total).toLocaleString("pt-BR", {
               minimumFractionDigits: 2,
               maximumFractionDigits: 2,
            });

         // Conteúdo das células
         tr.innerHTML = `
         <td>${pedido.id}</td>
         <td>${pedido.cliente_nome}</td>
         <td>${pedido.vendedor_nome}</td>
         <td>${pedido.forma_pagamento}</td>
         <td>${valorFormatado}</td>
         <td>${dataFormatada}</td>
      `;

         // Criar célula de status (diferente para admin e usuário comum)
         const tdStatus = document.createElement("td");

         if (isAdmin) {
            tdStatus.innerHTML = `
            <div class='status-dropdown' data-pedido-id='${pedido.id}'>
               <span class='status-badge ${statusClass}'>${pedido.status}</span>
               <div class='status-options' id='status-options-${pedido.id}'>
                  <div class='status-option' data-status='Pendente'>Pendente</div>
                  <div class='status-option' data-status='Aprovado'>Aprovado</div>
                  <div class='status-option' data-status='Aprovado com Alteração'>Aprovado com Alteração</div>
                  <div class='status-option' data-status='Enviado'>Enviado</div>
                  <div class='status-option' data-status='Pago'>Pago</div>
                  <div class='status-option' data-status='Pago Parcial'>Pago Parcial</div>
               </div>
            </div>
         `;
         } else {
            tdStatus.innerHTML = `<span class='status-badge ${statusClass}'>${pedido.status}</span>`;
         }

         tr.appendChild(tdStatus);

         // Adicionar coluna de ações para admin
         if (isAdmin) {
            const tdActions = document.createElement("td");
            tdActions.className = "actions-column";
            tdActions.innerHTML = `
               <button class="btn-delete" data-id="${pedido.id}">
                  <i class="bi bi-trash"></i>
               </button>
            `;
            tr.appendChild(tdActions);
         }

         tbody.appendChild(tr);

         // Adicionar evento de clique à linha
         tr.addEventListener("click", function (e) {
            // Ignorar cliques em elementos da dropdown de status ou botão de exclusão
            if (
               (e.target.closest(".status-dropdown") && isAdmin) ||
               e.target.closest(".btn-delete")
            ) {
               return;
            }

            const pedidoId = this.getAttribute("data-id");
            if (pedidoId) {
               window.location.href = `createPed.php?id=${pedidoId}`;
            }
         });
      });

      // Adicionar os eventos do dropdown para admin novamente
      if (isAdmin) {
         document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
            const pedidoId = dropdown.getAttribute("data-pedido-id");
            const statusBadge = dropdown.querySelector(".status-badge");
            const statusOptions = dropdown.querySelector(".status-options");

            statusBadge.addEventListener("click", function (e) {
               e.stopPropagation();

               // Fechar todos os outros dropdowns
               document
                  .querySelectorAll(".status-options.active")
                  .forEach((option) => {
                     if (option !== statusOptions) {
                        option.classList.remove("active");
                     }
                  });

               // Alternar estado do dropdown atual
               statusOptions.classList.toggle("active");
            });

            // Opções de status
            dropdown.querySelectorAll(".status-option").forEach((option) => {
               option.addEventListener("click", function (e) {
                  e.stopPropagation();
                  const novoStatus = this.getAttribute("data-status");
                  atualizarStatus(pedidoId, novoStatus, statusBadge);
                  statusOptions.classList.remove("active");
               });
            });
         });

         // Adicionar eventos para botões de exclusão
         document.querySelectorAll(".btn-delete").forEach((button) => {
            button.addEventListener("click", function (e) {
               e.stopPropagation();
               const pedidoId = this.getAttribute("data-id");

               if (confirm("Tem certeza que deseja excluir este pedido?")) {
                  excluirPedido(pedidoId);
               }
            });
         });
      }
   }
});
