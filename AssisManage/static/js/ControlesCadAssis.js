// CSRF token =================================================================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie("csrftoken");

// ============================================================================
// Máscaras e validações em modo escuta
// ============================================================================

$(document).on("input", "#input-tel, #input-tel2", function () {
    let valor = $(this).val().replace(/\D/g, "");
    valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    valor = valor.replace(/(\d{4})-(\d{5})$/, "$1$2");
    $(this).val(valor);
});

// Antes de salvar → remove máscara de tel/cpf/cep
$(document).on("click", ".btn-cad_edit", function () {
    $("#input-tel, #input-tel2, #input-cpf, #cep").each(function () {
        $(this).val($(this).val().replace(/\D/g, ""));
    });
});

// CPF
$(document).on("input", "#input-cpf", function () {
    let valor = $(this).val().replace(/\D/g, "");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    $(this).val(valor);
});

// CEP
$(document).on("input", "#cep", function () {
    let valor = $(this).val().replace(/\D/g, "").slice(0, 8);
    if (valor.length >= 6) {
        $(this).val(`${valor.slice(0, 2)}.${valor.slice(2, 5)}-${valor.slice(5, 8)}`);
    } else if (valor.length >= 3) {
        $(this).val(`${valor.slice(0, 2)}.${valor.slice(2)}`);
    } else {
        $(this).val(valor);
    }
});

// ============================================================================
// Submissão do form via AJAX
// ============================================================================
$(document).on("submit", "#form-cadassis", function (e) {
    e.preventDefault();

    if (!validarTipAssistencia()) return; // Verifica checkbox

    const form = this;
    const formData = new FormData(form);

    fetch(urlCadastrarAssistido, {
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
            exibirMensagemSucesso("Assistido cadastrado com Sucesso!");
        } else {
            console.log(data.errors);
            MsgCPFCadastrado();
        }
    })
    .catch(err => {
        console.error("Erro:", err);
        alert("Erro no envio do formulário.");
    });
});

// ============================================================================
// Validação do checkbox Tipos de Assistência
// ============================================================================
function validarTipAssistencia() {
    const checkboxes = document.querySelectorAll('#area-tip_assis-form-cadassis input[type="checkbox"]');
    let algumSelecionado = false;

    checkboxes.forEach(cb => {
        if (cb.checked) algumSelecionado = true;
    });

    if (!algumSelecionado) {
        MsgErroTipAssistencia("Escolha ao menos um tipo de assistência.");
        return false;
    }
    return true;
}
