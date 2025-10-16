function IniciarScripts() {
    // Ativar listeners
    ativarEventos();
}

function ativarEventos(csrftoken) {
    // Voltar item
    $(document).off("click", "#btn-voltar_item_form").on("click", "#btn-voltar_item_form", function () {
        let url = $(this).data("url");
        $("#area-exibicao").load(url, function () {
            initFormCadItem();
        });
    });

    // Editar
    $(document).off("click", "#btn-editar_item_form").on("click", "#btn-editar_item_form", function () {
        const inputsItens = document.querySelectorAll(".input-ficha_item");
        let valoresOriginais = {};

        inputsItens.forEach((input, i) => {
            valoresOriginais[i] = input.value;
            input.removeAttribute("disabled");
        });

        $("#btn-editar_item_form").hide();
        $("#btn-salvar_item_form, #btn-cancelar_item_form").show();

        // Guardar valores para cancelar
        $(document).data("valoresOriginais", valoresOriginais);
    });

    // Cancelar
    $(document).off("click", "#btn-cancelar_item_form").on("click", "#btn-cancelar_item_form", function () {
        const inputsItens = document.querySelectorAll(".input-ficha_item");
        const valoresOriginais = $(document).data("valoresOriginais") || {};

        inputsItens.forEach((input, i) => {
            input.value = valoresOriginais[i];
            input.setAttribute("disabled", "true");
        });

        $("#btn-editar_item_form").show();
        $("#btn-salvar_item_form, #btn-cancelar_item_form").hide();
    });

    // Salvar (form submit)
    $(document).off("submit", "#form-ficha_item_supri").on("submit", "#form-ficha_item_supri", function (e) {
        e.preventDefault();

        const form = this;
        const idItem = form.dataset.id;
        if (!idItem) {
            console.error("ID do item não encontrado!");
            return;
        }

        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
            console.log(key, ":", value);
        }
        console.groupEnd();

        const baseUrlElement = document.getElementById("area-data_url_ficha_item");
        if (!baseUrlElement) {
            console.error("[ERRO] Elemento #area-data_url_ficha_item não encontrado!");
            return;
        }

        const baseUrl = baseUrlElement.dataset.urlEditarficha;
        const url = baseUrl.replace("0", idItem);

        fetch(url, {
            method: "POST",
            body: formData,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrftoken
            }
        })
        .then(response => response.json().catch(() => {
            throw new Error("Resposta não está em JSON");
        }))
        .then(data => {
            console.log("[DEBUG] Resposta do servidor:", data);
            if (data.success) {
                exibirMensagemSucesso("Ítem atualizado com sucesso");
                $("#area-exibicao").load(url, function () {
                    IniciarScripts(csrftoken); // reativa os listeners
                });
            } else {
                let mensagem = data.message || "Erro ao atualizar ítem.";
                if (data.errors) {
                    const erros = [];
                    for (const campo in data.errors) {
                        if (Array.isArray(data.errors[campo])) {
                            erros.push(`${campo}: ${data.errors[campo].join(", ")}`);
                        } else {
                            erros.push(`${campo}: ${data.errors[campo]}`);
                        }
                    }
                    if (erros.length > 0) {
                        mensagem += "\n" + erros.join("\n");
                    }
                }
                exibirMensagemFalha(mensagem);
            }
        })
        .catch(error => {
            console.error(error);
            exibirMensagemFalha("Erro inesperado ao atualizar o ítem!");
        });
    });
}
