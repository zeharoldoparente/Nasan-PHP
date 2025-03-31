let pedidoParaExcluir = null;

function editarPedido(id) {
   window.location.href = `createPed.php?id=${id}`;
}

function confirmarExclusao(id) {
   pedidoParaExcluir = id;
   document.getElementById("pedido-exclusao").textContent = `#${id}`;
   document.getElementById("modal-exclusao").style.display = "flex";
}

function fecharModal() {
   document.getElementById("modal-exclusao").style.display = "none";
}

function excluirPedido() {
   alert(`Pedido #${pedidoParaExcluir} excluído com sucesso!`);
   fecharModal();
}

window.onclick = function (event) {
   const modal = document.getElementById("modal-exclusao");
   if (event.target == modal) {
      fecharModal();
   }
};
