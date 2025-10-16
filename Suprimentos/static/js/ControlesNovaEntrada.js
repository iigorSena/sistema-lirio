// Controle do Select2 =============================================
$(document).ready(function() {
    $('.select2').select2({
        placeholder: "Selecione...",
        allowClear: true,
        width: '100%'
    });
});

// Controles dos campos de valor ===========================================
$(document).ready(function () {

    const $tipoEntrada = $("#id_tip_entrada");
    const $quant = $("#input-quant_form_nova_entrada_supri");
    const $valorUnd = $("#input-valorund_form_nova_entrada_supri");
    const $total = $("#input-valortotal_form_nova_entrada_supri");

    // --- Funções auxiliares ---
    function formatarMoeda(valor) {
        valor = valor.replace(/\D/g, "");
        valor = (valor / 100).toFixed(2) + "";
        valor = valor.replace(".", ",");
        valor = "R$ " + valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return valor;
    }

    function verificarTipoEntrada() {
        if ($tipoEntrada.val() === "Compra") {
            $valorUnd.prop("disabled", false);
        } else {
            $valorUnd.val("R$ 0,00").prop("disabled", true);
        }
    }

    function calcularValorTotal() {
        const quant = parseFloat($quant.val().replace(",", ".")) || 0;
        let valor = $valorUnd.val().replace(/[^\d,]/g, "").replace(",", ".") || "0";
        valor = parseFloat(valor) || 0;

        const total = quant * valor;
        $total.val(total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
    }

    // --- Escuta mudanças no input valor unitário ---
    $(document).off("input", "#input-valorund_form_nova_entrada_supri");
    $(document).on("input", "#input-valorund_form_nova_entrada_supri", function () {
        let valor = $(this).val();
        $(this).val(formatarMoeda(valor));
        calcularValorTotal();
    });

    // --- Escuta blur valor unitário ---
    $(document).off("blur", "#input-valorund_form_nova_entrada_supri");
    $(document).on("blur", "#input-valorund_form_nova_entrada_supri", function () {
        if ($(this).val().includes("-")) {
            $(this).val("R$ 0,00");
            calcularValorTotal();
        }
    });

    // --- Escuta mudanças na quantidade ---
    $(document).off("input", "#input-quant_form_nova_entrada_supri");
    $(document).on("input", "#input-quant_form_nova_entrada_supri", function () {
        calcularValorTotal();
    });

    // --- Escuta mudança de tipo de entrada ---
    $(document).off("change", "#id_tip_entrada");
    $(document).on("change", "#id_tip_entrada", function () {
        verificarTipoEntrada();
        calcularValorTotal();
    });

    // Inicial
    verificarTipoEntrada();
    calcularValorTotal();
});


// ======================= Salvamento do form via AJAX ==========================
document.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "form-nova_entrada_supri") {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        fetch(urlNovaEntrada, {
            method: "POST",
            body: formData,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": csrftoken
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                form.reset();
                exibirMensagemSucesso(data.message);
            } else {
                let mensagem = data.message || "Erro ao salvar a ficha.";
                if (data.errors) {
                    const erros = [];
                    for (const campo in data.errors) {
                        const listaErros = data.errors[campo];
                        if (Array.isArray(listaErros)) {
                            listaErros.forEach(errObj => {
                                if (errObj.message) erros.push(`${campo}: ${errObj.message}`);
                                else erros.push(`${campo}: ${JSON.stringify(errObj)}`);
                            });
                        } else {
                            erros.push(`${campo}: ${data.errors[campo]}`);
                        }
                    }
                    if (erros.length) mensagem += "\n" + erros.join("\n");
                }
                exibirMensagemFalha(mensagem);
            }
        })
        .catch(err => {
            console.error("Erro:", err);
            exibirMensagemFalha("Erro inesperado ao salvar a ficha.");
        });
    }
});
