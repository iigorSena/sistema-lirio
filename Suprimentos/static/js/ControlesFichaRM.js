$(document).ready(function () {
    // 🔽 Remove qualquer handler anterior antes de registrar novamente
    $(document).off("submit", "#form-itens_rm_aprovacao");

    // 🔽 Registra o handler uma única vez
    $(document).on("submit", "#form-itens_rm_aprovacao", function (e) {
        e.preventDefault();

        let form = $(this);
        let pk = form.data("id");  // <- pega do data-id
        let url = `/autorizar-solicitacao-rm/ficha-suprimentos-rm/${pk}/`;

        let formData = form.serialize();

        $.ajax({
            type: "POST",
            url: url,
            data: formData,
            success: function (response) {
                if (response.success) {
                    exibirMensagemSucesso(response.message);

                    // 🔽 Recarrega a área sem acumular handlers
                    $("#area-exibicao").load(url, function () {
                        // depois do load, reativa o modo escuta
                        $(document).off("submit", "#form-itens_rm_aprovacao").on("submit", "#form-itens_rm_aprovacao", arguments.callee);
                    });
                } else {
                    exibirMensagemFalha("Erro: " + response.message);
                    if (response.errors) {
                        console.error(response.errors);
                    }
                }
            },
            error: function (xhr, status, error) {
                exibirMensagemFalha("Erro ao processar a solicitação: " + error);
            }
        });
    });
});

(function () {
    function verificarStatus() {
        const statusInput = document.querySelector("#input-status_rm");
        const btn = document.querySelector("#area-btn_liberar_rm");

        if (statusInput && btn) {
            if (statusInput.value === "Autorizado" || statusInput.value === "Negado") {
                btn.disabled = true;
                btn.classList.add("btn-disabled");
                btn.style.display = "none";
            } else {
                btn.disabled = false;
                btn.classList.remove("btn-disabled");
                btn.style.display = "flex";
            }
        }
    }

    // 🔽 Observa mudanças no DOM
    const observer = new MutationObserver(verificarStatus);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Executa de imediato
    verificarStatus();
})();
