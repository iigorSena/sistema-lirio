$(document).on("click", ".btn-abrir_rm_aut", function (e) {
    e.preventDefault();

    const idItem = $(this).data("id");
    if (!idItem) {
        alert("ID do ítem não encontrado!");
        return;
    }

    const urlFicha = `/autorizar-solicitacao-rm/ficha-suprimentos-rm/${idItem}/`;

    $("#area-exibicao").load(urlFicha, function () {
        verificarStatus();
    });
});