$(document).ready(function () {
    // Remove listeners antigos
    $(document).off("submit", "#area-cad_fornecedores_supri");

    // Escuta novamente
    $(document).on("submit", "#area-cad_fornecedores_supri", function (e) {
        e.preventDefault();

        let formData = $(this).serialize(); // serializa todos os campos

        $.ajax({
            url: urlCadFornecedorItem,
            type: "POST",
            data: formData,
            success: function (response) {
                if (response.success) {
                    exibirMensagemSucesso(response.message);
                    $("#area-cad_fornecedores_supri")[0].reset(); // limpa form
                    $('#area-exibicao').load(urlCadFornecedorItem);
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON && xhr.responseJSON.errors) {
                    let erros = xhr.responseJSON.errors;
                    let msg = "Erros no cadastro:\n";
                    for (let campo in erros) {
                        msg += `- ${campo}: ${erros[campo].join(", ")}\n`;
                    }
                    exibirMensagemAviso(msg);
                } else {
                    exibirMensagemFalha("Erro inesperado no cadastro do fornecedor!");
                }
            }
        });
    });
});
