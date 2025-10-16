// Barra de Busca do Lote Detalhado =========================================================================================
function filtrarSenhasLote() {
    const termo = $("#input-busca_lote_detalhado").val().toLowerCase();

    $("#tb-lista_senhas_lote tbody tr").each(function() {
        const idAssistido = $(this).find("td:nth-child(1)").text().toLowerCase();
        const nomeAssistido = $(this).find("td:nth-child(2)").text().toLowerCase();

        if (idAssistido.includes(termo) || nomeAssistido.includes(termo)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}
// Ativando o listener de busca em modo off/on
$(document).off("input", "#input-busca_lote_detalhado").on("input", "#input-busca_lote_detalhado", function() {
    filtrarSenhasLote();
});

// Adiciona o botão de busca
$(document).off("click", "#btn-buscar_lote_detalhado").on("click", "#btn-buscar_lote_detalhado", function(e) {
    e.preventDefault();
    filtrarSenhasLote();
});


// Controle de Exibição dos botões ==========================================================================================
// Ativa Edição
$(document).off("click", "#btn-edit_nome_lote").on("click", "#btn-edit_nome_lote", function(e) {
    e.preventDefault();

    // Habilita o campo input e select
    $("#input-nome_lote_lote_detalhado, #input-select_lote_lote_detalhado").prop("disabled", false);

    // Exibe os botões salvar/cancelar
    $("#btn-salvar_nome_lote, #btn-cancelar_nome_lote").prop("disabled", false).show();

    // Oculta o botão editar
    $("#btn-edit_nome_lote").hide();
});

// Cancela edição
$(document).off("click", "#btn-cancelar_nome_lote").on("click", "#btn-cancelar_nome_lote", function(e) {
    e.preventDefault();

    // Desabilita os campos novamente
    $("#input-nome_lote_lote_detalhado, #input-select_lote_lote_detalhado").prop("disabled", true);

    // Oculta os botões salvar/cancelar
    $("#btn-salvar_nome_lote, #btn-cancelar_nome_lote").prop("disabled", true).hide();

    // Reexibe o botão editar
    $("#btn-edit_nome_lote").show();
});

// Edição dos dados do Lote ================================================================================================================
$(document).off("submit", "#area-info_lote_detalhado").on("submit", "#area-info_lote_detalhado", function(e) {
    e.preventDefault();

    const formData = $(this).serialize(); // pega todos os inputs do form
    console.log("➡️ Enviando dados do lote:", formData);

    $.ajax({
        url: urlLoteDetalhado,
        type: "POST",
        data: formData,
        success: function(response) {

            if (response.success) {
                exibirMensagemSucesso(response.message);

                // Atualiza visualmente os valores no formulário
                $("#input-nome_lote_lote_detalhado").val(response.nome_lote).prop("disabled", true);
                $("#input-select_lote_lote_detalhado").val(response.status).prop("disabled", true);

                // Troca botões de volta ao estado inicial
                $("#btn-edit_nome_lote").show();
                $("#btn-salvar_nome_lote, #btn-cancelar_nome_lote").hide().prop("disabled", true);

                // Recarrega via AJAX
                $.get(urlLoteDetalhado)
                    .done(function(data) {
                        $('#area-exibicao').load(urlLoteDetalhado);  // insere HTML no container
                    })
                    .fail(function() {
                        Msg('Erro ao recarregar o lote!');
                    });
            } else {
                exibirMensagemFalha("Erro: " + response.error);
            }
        },
        error: function(xhr) {
            console.error("➡️ Erro AJAX:", xhr);
            exibirMensagemFalha("Falha ao salvar lote. Código: " + xhr.status);
        }
    });
});


// Exclusão da senha via AJAX ================================================================================================
$(document).off("click", "[class^='btn-excluir_senha']"); $(document).on("click", "[class^='btn-excluir_senha']", function(e) {
    e.preventDefault();

    const senhaId = $(this).data("id");

    if (!senhaId) {
        exibirMensagemAviso("ID da senha não encontrado!");
        return;
    }

    if (!confirm("Deseja realmente excluir esta senha?")) {
        return;
    }

    $.ajax({
        url: urlLoteDetalhado,   // a URL do lote já está no template
        type: "POST",
        data: {
            senha_id: senhaId,
            csrfmiddlewaretoken: csrftoken
        },
        success: function(response) {
            if (response.success) {
                // remove linha sem recarregar todo o conteúdo
                $(`#linha-tb_senhas_lote_view_${senhaId}`).fadeOut(300, function() {
                    $(this).remove();
                });
                exibirMensagemSucesso("Senha excluída com sucesso!");
            } else {
                exibirMensagemFalha("Erro: " + response.error);
            }
        },
        error: function(xhr) {
            exibirMensagemFalha("Falha ao excluir senha. Código: " + xhr.status);
        }
    });
});

// Abre o PopUp de Add de senha =================================================================================================================
// Abrir modal
$(document).off("click", "#btn-abrir_popup_add_senhas");
$(document).on("click", "#btn-abrir_popup_add_senhas", function(){
    $('#modalAddSenha').show();
});

// Fechar modal
$(document).off("click", ".close");
$(document).on("click", ".close", function(){
    $('#modalAddSenha').hide();
});

// Submissão do formulário pop-up via AJAX
$(document).off("submit", "#formAddSenha"); $(document).on("submit", "#formAddSenha", function(e){
    e.preventDefault();
    let data = $(this).serialize() + "&action=add_senha";
    $.ajax({
        type: "POST",
        url: urlLoteDetalhado,
        data: data,
        success: function(resp){
            if(resp.success){
                exibirMensagemSucesso("Senha adicionada: " + resp.senha + " - " + resp.assistido);
                $('#modalAddSenha').hide();
                //Atualiza a pagina
                $.get(urlLoteDetalhado)
                    .done(function(data) {
                        $('#area-exibicao').load(urlLoteDetalhado); 
                    })
                    .fail(function() {
                        exibirMensagemFalha('Erro ao recarregar o lote!');
                    });
            }
        },
        error: function(err){
            console.log(err);
            exibirMensagemFalha("Erro ao adicionar senha.");
        }
    });
});

$(document).ready(function(){
    $('#id_assistido').select2({
        placeholder: 'Selecione um assistido',
        allowClear: true,
        width: '100%'
    });
});
