document.addEventListener("DOMContentLoaded", function () {
   const isAdmin = document.body.getAttribute("data-is-admin") === "true";
   document.querySelectorAll("#tabela-pedidos tbody tr").forEach((row) => {
      row.addEventListener("click", function (e) {
         if (
            (e.target.closest(".status-dropdown") && isAdmin) ||
            e.target.closest(".btn-delete") ||
            e.target.closest(".btn-pdf")
         ) {
            return;
         }

         const pedidoId = this.getAttribute("data-id");
         if (pedidoId) {
            window.location.href = `createPed.php?id=${pedidoId}`;
         }
      });
   });
   if (isAdmin) {
      document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
         const pedidoId = dropdown.getAttribute("data-pedido-id");
         const statusBadge = dropdown.querySelector(".status-badge");
         const statusOptions = dropdown.querySelector(".status-options");

         statusBadge.addEventListener("click", function (e) {
            e.stopPropagation();
            document
               .querySelectorAll(".status-options.active")
               .forEach((option) => {
                  if (option !== statusOptions) {
                     option.classList.remove("active");
                  }
               });
            statusOptions.classList.toggle("active");
         });
         document.addEventListener("click", function (e) {
            if (!dropdown.contains(e.target)) {
               statusOptions.classList.remove("active");
            }
         });
         dropdown.querySelectorAll(".status-option").forEach((option) => {
            option.addEventListener("click", function (e) {
               e.stopPropagation();
               const novoStatus = this.getAttribute("data-status");
               atualizarStatus(pedidoId, novoStatus, statusBadge);
               statusOptions.classList.remove("active");
            });
         });
      });
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
               statusBadge.textContent = novoStatus;
               const statusClasses = [
                  "status-pendente",
                  "status-aprovado",
                  "status-alteracao",
                  "status-enviado",
                  "status-pago",
                  "status-pago-parcial",
               ];
               statusClasses.forEach((cls) => {
                  statusBadge.classList.remove(cls);
               });
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
   document
      .getElementById("btn-filtrar")
      .addEventListener("click", function () {
         filtrarPedidos();
      });
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
      const dataInicio = document.getElementById("filtro-data-inicio").value;
      const dataFim = document.getElementById("filtro-data-fim").value;
      let vendedor = "";

      if (isAdmin) {
         const vendedorInput = document.getElementById("filtro-vendedor");
         if (vendedorInput) {
            vendedor = vendedorInput.value.trim();
         }
      }
      const filtros = {
         numero_pedido: numeroPedido,
         cliente: cliente,
         status: status,
         data_inicio: dataInicio,
         data_fim: dataFim,
      };

      if (isAdmin) {
         filtros.vendedor = vendedor;
      }
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
         tr.innerHTML = `<td colspan="8" class="sem-pedidos">Nenhum pedido encontrado</td>`;
         tbody.appendChild(tr);
         return;
      }

      pedidos.forEach((pedido) => {
         const tr = document.createElement("tr");
         tr.setAttribute("data-id", pedido.id);
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
         const dataPedido = new Date(pedido.data_pedido);
         const dataFormatada = `${dataPedido
            .getDate()
            .toString()
            .padStart(2, "0")}/${(dataPedido.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${dataPedido.getFullYear()}`;
         const valorFormatado =
            "R$ " +
            parseFloat(pedido.valor_total).toLocaleString("pt-BR", {
               minimumFractionDigits: 2,
               maximumFractionDigits: 2,
            });
         tr.innerHTML = `
         <td>${pedido.id}</td>
         <td>${pedido.cliente_nome}</td>
         <td>${pedido.vendedor_nome}</td>
         <td>${pedido.forma_pagamento}</td>
         <td>${valorFormatado}</td>
         <td>${dataFormatada}</td>
      `;
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
         const tdActions = document.createElement("td");
         tdActions.className = "actions-column";
         tdActions.innerHTML = `
            <a href="gerarPDF.php?id=${pedido.id}" class="btn-pdf" title="Gerar PDF" target="_blank">
               <i class="bi bi-file-earmark-pdf"></i>
            </a>
         `;
         if (isAdmin) {
            tdActions.innerHTML += `
               <button class="btn-delete" data-id="${pedido.id}">
                  <i class="bi bi-trash"></i>
               </button>
            `;
         }

         tr.appendChild(tdActions);
         tbody.appendChild(tr);
         tr.addEventListener("click", function (e) {
            if (
               (e.target.closest(".status-dropdown") && isAdmin) ||
               e.target.closest(".btn-delete") ||
               e.target.closest(".btn-pdf")
            ) {
               return;
            }

            const pedidoId = this.getAttribute("data-id");
            if (pedidoId) {
               window.location.href = `createPed.php?id=${pedidoId}`;
            }
         });
      });
      if (isAdmin) {
         document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
            const pedidoId = dropdown.getAttribute("data-pedido-id");
            const statusBadge = dropdown.querySelector(".status-badge");
            const statusOptions = dropdown.querySelector(".status-options");

            statusBadge.addEventListener("click", function (e) {
               e.stopPropagation();
               document
                  .querySelectorAll(".status-options.active")
                  .forEach((option) => {
                     if (option !== statusOptions) {
                        option.classList.remove("active");
                     }
                  });
                  statusOptions.classList.toggle("active");
            });
            dropdown.querySelectorAll(".status-option").forEach((option) => {
               option.addEventListener("click", function (e) {
                  e.stopPropagation();
                  const novoStatus = this.getAttribute("data-status");
                  atualizarStatus(pedidoId, novoStatus, statusBadge);
                  statusOptions.classList.remove("active");
               });
            });
         });
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
