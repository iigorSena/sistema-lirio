$(document).ready(function () {
    // Primeiro remove qualquer listener existente (evita duplicação)
    $(document).off("submit", "#area-cad_marcas_supri");

    // Agora liga novamente a escuta
    $(document).on("submit", "#area-cad_marcas_supri", function (e) {
        e.preventDefault();

        $.ajax({
            url: urlCadMarcaItem,   // definida no template
            type: "POST",
            data: {
                nome: $("#input-cad_marca_itens").val(),
                csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (response) {
                if (response.success) {
                    exibirMensagemSucesso("Marca adicionada com sucesso!");
                   $('#area-exibicao').load(urlCadMarcaItem);
                    $("#input-cad_marca_itens").val(""); // limpa campo
                }
            },
            error: function (xhr) {
                console.log(xhr.responseJSON.errors);
                exibirMensagemFalha("Erro ao cadastrar categoria!");
            }
        });
    });
});
