function IniciarScripts() {
    // Clique no botão de cadastrar item
    $(document).on("click", ".btn-cad_item", function (e) {
        e.preventDefault();
        let url = $(this).data("url");
        $("#area-exibicao").load(url, function () {
            if (typeof initFormCadItem === "function") {
            }
        });
    });

    // Clique nos botões de ação da tabela de itens
    $(document).on("click", ".btn-acao_tb_itens", function (e) {
        e.preventDefault();

        const idItem = $(this).data("id");
        if (!idItem) {
            alert("ID do ítem não encontrado!");
            return;
        }

        const urlFicha = `/listar-itens/ficha-suprimentos-item/${idItem}/`;

        $("#area-exibicao").load(urlFicha, function () {
            IniciarScripts(); // reativa novamente caso tenha inputs/forms no novo conteúdo
        });
    });

    // Submissão da busca de itens
    $(document).on("submit", "#form-pesquisa_tb_geren_supri", function (e) {
        e.preventDefault();

        const busca = $("#input-busca_tb_geren_supri").val().trim();

        let url = urlGerenItens;
        if (busca) {
            url += `?busca=${encodeURIComponent(busca)}`;
        }

        $("#area-exibicao").load(url, function () {
            IniciarScripts(); // reativa novamente após AJAX
        });
    });
}

// Ativa os listeners assim que o DOM carregar
$(document).ready(function () {
    IniciarScripts();
});
