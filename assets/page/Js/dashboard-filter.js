document.addEventListener("DOMContentLoaded", function () {
   const btnFiltrarDashboard = document.getElementById("btn-filtrar-dashboard");

   if (btnFiltrarDashboard) {
      btnFiltrarDashboard.addEventListener("click", function () {
         filtrarDashboard();
      });
      document
         .querySelectorAll(".dashboard-date-filter input")
         .forEach((input) => {
            input.addEventListener("keypress", function (e) {
               if (e.key === "Enter") {
                  filtrarDashboard();
               }
            });
         });
   }

   function filtrarDashboard() {
      const dataInicio = document.getElementById("dashboard-data-inicio").value;
      const dataFim = document.getElementById("dashboard-data-fim").value;

      if (!dataInicio && !dataFim) {
         customModal.error("Por favor, selecione pelo menos uma data.");
         return;
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("data_inicio");
      url.searchParams.delete("data_fim");
      if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
      if (dataFim) url.searchParams.append("data_fim", dataFim);
      window.location.href = url.toString();
   }
   const urlParams = new URLSearchParams(window.location.search);
   const dataInicioParam = urlParams.get("data_inicio");
   const dataFimParam = urlParams.get("data_fim");

   if (dataInicioParam) {
      document.getElementById("dashboard-data-inicio").value = dataInicioParam;
   }

   if (dataFimParam) {
      document.getElementById("dashboard-data-fim").value = dataFimParam;
   }
});
