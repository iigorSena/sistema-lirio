// Variáveis globais ========================================================
let dadosPaginados = []; 
let paginaAtual = 1;
const itensPorPagina = 50;

// Faz a busca na tb_assis e monta a tabela com os resultados =====================================================
$(document).ready(function () {
    // função para renderizar os itens de acordo com a página
    function renderTabela(pagina) {
        const corpoTabela = $("#corpo-tb_assis_lote");
        corpoTabela.empty();

        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const paginaDados = dadosPaginados.slice(inicio, fim);

        if (paginaDados.length === 0) {
            corpoTabela.append("<tr><td colspan='4'>Nenhum registro encontrado</td></tr>");
        } else {
            paginaDados.forEach(item => {
                corpoTabela.append(`
                    <tr class="linha-tb_temp_gs" data-id="${item.id}">
                        <td class="cln-tb_assis_lote_view">${item.ordem}</td>
                        <td>${item.nome}</td>
                        <td class="cln-tb_assis_lote_view">${item.cpf}</td>
                        <td class="cln-tb_assis_lote_view">
                            <button class="btn-remover_assis" data-id="${item.id}">Remover</button>
                        </td>
                    </tr>
                `);
            });
        }

        renderPaginacao();
    }

    // função para criar os botões de paginação
    function renderPaginacao() {
        const totalPaginas = Math.ceil(dadosPaginados.length / itensPorPagina);
        const paginacaoDiv = $("#paginacao-lista_temp_gs");
        paginacaoDiv.empty();

        if (totalPaginas <= 1) return; // sem paginação se só tiver 1 página

        // botão anterior
        if (paginaAtual > 1) {
            paginacaoDiv.append(`<button class="btn-pagina" data-pagina="${paginaAtual - 1}">Anterior</button>`);
        }

        // botões de números
        for (let i = 1; i <= totalPaginas; i++) {
            paginacaoDiv.append(`
                <button class="btn-pagina ${i === paginaAtual ? 'ativo' : ''}" data-pagina="${i}">
                    ${i}
                </button>
            `);
        }

        // botão próximo
        if (paginaAtual < totalPaginas) {
            paginacaoDiv.append(`<button class="btn-pagina" data-pagina="${paginaAtual + 1}">Próximo</button>`);
        }
    }

    // evento clique nos botões de paginação
    $(document).on("click", ".btn-pagina", function () {
        paginaAtual = parseInt($(this).data("pagina"));
        renderTabela(paginaAtual);
    });


// Renderiza a tabela temporária com as configurações==============================================================================================
$(document).ready(function () {
     // validação antes de enviar
    $(document).off("click", "#btn-verificar");$(document).on("click", "#btn-verificar", function (e) {
        const nome_lote   = $("#input-nome_lote").val();
        const data_evento = $("#input-data_evento").val();
        const tip_assistencia = $("#tipo_assistencia").val();
        const vinculo = $("#vinculo").val();

        // troca texto do botão
        const $btn = $(this);
        const textoOriginal = $btn.text();
        $btn.text("Verificando...").prop("disabled", true);

        $.ajax({
            url: urlGeradorSenhas,
            method: "POST",
            data: {
                action: "verificar",
                tip_assistencia: tip_assistencia,
                vinculo: vinculo,
                csrfmiddlewaretoken: csrftoken
            },
            success: function (data) {
                dadosPaginados = data.dados; // salva todos os registros
                paginaAtual = 1; // sempre começa na página 1
                renderTabela(paginaAtual);

                $("#area-geracao_senhas_gs").css("height", "auto");
                $("#area-conteudo_editor_lote").css("height", "auto");
                $("#quant-senhas").text("Total de senhas: " + data.quantidade);
                $("#tipo_assistencia, #vinculo").prop("disabled", true);
                $("#btn-gerar").show();
                $("#btn-limpar").show();
                $("#btn-verificar").hide();
            },
            error: function (xhr, status, error) {
                console.error("Erro:", error);
            },
            complete: function () {
                $btn.text(textoOriginal).prop("disabled", false);
            }
        });
    });
});

    // remover linha da tabela
    $(document).off("click", ".btn-remover_assis");
    $(document).on("click", ".btn-remover_assis", function () {
        $(this).closest("tr").remove();
        atualizarContador();
    });
    
    function atualizarContador() {
        const total = $("#corpo-tb_assis_lote tr").length;
        $("#quant-senhas").text(total);
    }


    // limpar formulário e tabela
    $(document).off("click", "#btn-limpar");$(document).on("click", "#btn-limpar", function () {
        $("#form-gerar_senhas")[0].reset();
        $("#corpo-tb_assis_lote").empty();
        $("#area-conteudo_editor_lote").css("height", "0");
        $("#tipo_assistencia, #vinculo").prop("disabled", false);
        $("#area-geracao_senhas_gs").css("height", "0");
        $("#btn-gerar").hide();
        $("#btn-limpar").hide();
        $("#btn-verificar").show();
        $('#area-exibicao').load(urlGeradorSenhas);
    });
});

// Controle da Barra de Edição do Lote =====================================================================================
const barraToggle = document.getElementById('barra-editor_lote');
const areaEditor = document.getElementById('area-conteudo_editor_lote');
let aberto = false;

barraToggle.addEventListener('click', function () {
    aberto = !aberto;

    if (aberto) {
        areaEditor.style.height = 'auto';
        areaEditor.style.overflow = 'hidden';
    } else {
        areaEditor.style.height = '0';
        
    }

    barraToggle.innerText = aberto 
        ? '➖ Editar Lote' 
        : '➕ Editar Lote';
});

// Salvando o Lote -> é chamada pelo onclick no botão do form, então deixa como tá... ======================
function gerarLote() {
    const nome_lote   = $("#input-nome_lote").val();
    const data_evento = $("#input-data_evento").val();
    const tipo_assistencia = $("#tipo_assistencia").val();
    const vinculo     = $("#vinculo").val(); 
    const mensagem    = $("#input-mensagem").val();
    const inter_inicial = $("#input-inter_inicial").val();
    const inter_final   = $("#input-inter_final").val();

    // valida campos obrigatórios
    if (!nome_lote || !data_evento) {
        exibirMensagemAviso("Campos obrigatórios:<br>Nome do lote e Data do evento");
        return;
    }

    // muda o texto do botão
    const $btn = $("#btn-gerar");
    $btn.text("Gerando...");
    $btn.prop("disabled", true); // evitar clique duplo

    const todosIDs = dadosPaginados.map(item => item.id); // coleta todos os IDs renderizados no front
    console.log('O intervalo recebido foi: ', todosIDs)
    const idsSelecionados = todosIDs.slice(inter_inicial - 1, inter_final); // fatia a lista de IDs conforme o intervalo visual

    $.ajax({
        url: urlGeradorSenhas,
        method: "POST",
        data: {
            action: "gerar",
            nome_lote: nome_lote,
            data_evento: data_evento,
            tipo_assistencia: tipo_assistencia,
            vinculo: vinculo,
            mensagem: mensagem,
            mensagem: mensagem,
            "ids[]": idsSelecionados, // <-- lista de IDs reais
            csrfmiddlewaretoken: csrftoken
        },
        success: function(data) {
            if (data.success) {
                exibirMensagemSucesso("Lote gerado com sucesso!");
                $btn.text("Gerar");
                $btn.prop("disabled", false);

                $.ajax({
                    method: "GET",
                    data: { action: "listar" }, // se vc tiver um 'listar' na view
                    success: function(html) {
                        // Atualiza a div onde o template é injetado
                        $("#area-lista-lotes").html(html);
                    },
                    error: function() {
                        exibirMensagemFalha("Erro ao recarregar a lista de lotes.");
                    }
                });
            } else {
                exibirMensagemFalha("Erro ao gerar lote:<br> " + data.message);
                $btn.text("Gerar");
                $btn.prop("disabled", false);
            }
        },
        error: function(xhr, status, error) {
            console.error("Erro:", error);
            exibirMensagemFalha("Erro no servidor ao gerar o lote.");
            $btn.text("Gerar");
            $btn.prop("disabled", false);
        }
    });
}

// Controle do redirecionamento dos Lotes Detalhados ===========================================
$(document).on('click.assist', '.btn-detalhar_lote', function(e){
  e.preventDefault();
  const idLote = $(this).data('id');
  if (!idLote) {
    Msg('ID do Lote não encontrado!');
    return;
  }
  // URL correta do lote
  const urlFicha = `/gerar-senhas/detalhes/${idLote}/`;

  // Carrega via AJAX
  $.get(urlFicha)
    .done(function(data) {
        $('#area-exibicao').load(urlFicha);  // insere HTML no container
    })
    .fail(function() {
        Msg('Erro ao carregar o lote!');
    });
});

