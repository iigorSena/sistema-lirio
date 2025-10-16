// ControlesCaditens.js

// === Controle do Form de Cadastro de Itens ===
$(document).off('submit.caditem', '#form-cad_item').on('submit.caditem', '#form-cad_item', function(e) {
    e.preventDefault(); // evita o envio normal do form

    let $form = $(this);
    let formData = $form.serialize(); // pega todos os campos do form

    // Botão de submit para feedback visual
    let $btn = $form.find('#btn-cad_novo_item');
    $btn.prop('disabled', true).text('Cadastrando...');

    $.ajax({
        type: 'POST',
        url: urlCadastrarItem, // variável já definida no template
        data: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }, // sinaliza ao Django que é AJAX
        success: function(response) {
            if (response.success) {
                exibirMensagemSucesso(response.message);
                $form[0].reset(); // limpa o form
            }
        },
        error: function(xhr) {
            if (xhr.status === 400) {
                let errors = xhr.responseJSON.errors;
                let errorMessages = [];
                for (let field in errors) {
                    errorMessages.push(errors[field].join(', '));
                }
                exibirMensagemFalha("Erros: \n" + errorMessages.join('\n'));
            } else {
                exibirMensagemFalha('Ocorreu um erro inesperado.');
            }
        },
        complete: function() {
            $btn.prop('disabled', false).text('Cadastrar');
        }
    });
});

// === Controle do Botão Voltar ===
$(document).off("click.voltar", "#btn-voltar_lista_itens").on("click.voltar", "#btn-voltar_lista_itens", function () {
    const url = $(this).data("url");
    $("#area-exibicao").load(url);
});
