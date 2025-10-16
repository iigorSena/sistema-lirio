$(document).ready(function () {
    // Primeiro remove qualquer listener existente (evita duplicação)
    $(document).off("submit", "#area-cad_categorias_itens");

    // Agora liga novamente a escuta
    $(document).on("submit", "#area-cad_categorias_itens", function (e) {
        e.preventDefault();

        $.ajax({
            url: urlCadCategItemm,   // definida no template
            type: "POST",
            data: {
                nome: $("#input-cad_categ_itens").val(),
                csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (response) {
                if (response.success) {
                    exibirMensagemSucesso("Categoria adicionada com sucesso!");
                   $('#area-exibicao').load(urlCadCategItemm);
                    $("#input-cad_categ_itens").val(""); // limpa campo
                }
            },
            error: function (xhr) {
                console.log(xhr.responseJSON.errors);
                exibirMensagemFalha("Erro ao cadastrar categoria!");
            }
        });
    });
});
