// Controle do Select2 requisitante =============================================
$(document).ready(function() {
    $('#select-requisitante').select2({
        placeholder: "Selecione...",
        allowClear: true,
        width: '100%'
    });
});
// Controle do Select2 Material =============================================
$(document).ready(function() {
    $('#select-nova_solic_materiais').select2({
        placeholder: "Selecione...",
        allowClear: true,
        width: '100%'
    });
});

// ======================= Lista Temporária ==========================
(function () {
    // Controle do botão voltar
    $(document).off("click", "#btn-voltar_minhas_req").on("click", "#btn-voltar_minhas_req", function () {
        const url = $(this).data("url");
        $("#area-exibicao").load(url);
    });

    // ====== Add materiais a lista de temporária =======
    $(document).off("click", "#btn-add_material_solic").on("click", "#btn-add_material_solic", function (e) {
        e.preventDefault();   

        const selectMaterial = document.getElementById("select-nova_solic_materiais");
        const quantidade = document.getElementById("input-quant_number").value;

        if (!selectMaterial || !quantidade || quantidade <= 0) {
            exibirMensagemAviso("Selecione um material e informe a quantidade válida!");
            return;
        }
        const idMaterial = selectMaterial.value;
        const nomeMaterial = selectMaterial.options[selectMaterial.selectedIndex].text;
        const undMedida = selectMaterial.options[selectMaterial.selectedIndex].dataset.unidade || "-";

        const tbody = document.getElementById("body-revisar_solic_materiais");
        if (!tbody) {
            exibirMensagemFalha("Erro ao localizar a tabela de itens!");
            return;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="cln-nome_padrao">${nomeMaterial}<input type="hidden" name="materiais[]" value="${idMaterial}"></td>
            <td class="cln-text_padrao">${undMedida}</td>
            <td class="cln-text_padrao">${quantidade}<input type="hidden" name="quantidades[]" value="${quantidade}"></td>
            <td class="cln-elementos_padrao"><button type="button" class="btn-excluir" id="btn-remover_item_lista_solic_${idMaterial}">Remover</button></td>
        `;
        tbody.appendChild(row);

        // Atualiza botão enviar
        let botaoEnviar = document.getElementById("btn-criar_solic_material");
        if (botaoEnviar) botaoEnviar.disabled = tbody.children.length === 0;

        // Limpa os campos
        document.getElementById("input-busca_materiais").value = "";
        document.getElementById("input-material_escolhido").value = "";
        document.getElementById("input-undMedida_escolhida").value = "";
        document.getElementById("input-quant_number").value = "";
    });

    // ====== Remove materiais da lista (id dinâmico) ======
    $(document).off("click", "[id^='btn-remover_item_lista_solic_']").on("click", "[id^='btn-remover_item_lista_solic_']", function (e) {
        e.preventDefault();

        // Remove a linha da tabela
        $(this).closest("tr").remove();

        // Atualiza o botão enviar
        let tbody = document.querySelector("#body-revisar_solic_materiais");
        let botaoEnviar = document.getElementById("btn-criar_solic_material");
        if (tbody && botaoEnviar) {
            botaoEnviar.disabled = tbody.children.length === 0;
        }
    });


    //============= Salvamento da Solicitação de Materiais ===============================
    $(document).off("submit.formSolicMateriais").on("submit.formSolicMateriais", "#form-solic_materiais", function (e) {
        e.preventDefault(); // não deixa recarregar a página
        let formData = new FormData(this);
        fetch(urlSolicMateriais, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
            }
        })
        .then(res => res.json())
        .then(data => {
            let botaoEnviar = document.getElementById("btn-criar_solic_material");
            if (data.success) {
                exibirMensagemSucesso(data.message);
                botaoEnviar.disabled = true;
                // limpa tabela e campos
                document.querySelector("#body-revisar_solic_materiais").innerHTML = "";
            } else {
                exibirMensagemFalha("Erro: " + (data.message || "Ocorreu um erro inesperado."));
            }
        })
        .catch(err => console.error("Erro no envio:", err));
        }
    );

})();
