function IniciarScripts(csrftoken) {
    console.log("Scripts iniciados...");

    // 🔹 Navegação entre fichas
    $(document).off("click", ".btn-navegacao").on("click", ".btn-navegacao", function (e) {
        e.preventDefault();
        let url = $(this).data("url");
        if (!url) return;
        $("#area-exibicao").load(url, function () {
            IniciarScripts(csrftoken);
        });
    });

    // 🔹 Botão voltar
    $(document).off("click", "#btn-voltar-form").on("click", "#btn-voltar-form", function () {
        let url = $(this).data("url");
        $("#area-exibicao").load(url, function () {
            IniciarScripts(csrftoken);
        });
    });

    // 🔹 Controle de edição da ficha
    const btnEditar = document.getElementById("btn-editar-form");
    const btnCancelar = document.getElementById("btn-cancelar-form");
    const btnSalvar = document.getElementById("btn-salvar-form");
    const btnAnterior = document.getElementById("btn-anterior-form");
    const btnSeguinte = document.getElementById("btn-seguinte-form");
    const btnVoltar = document.getElementById("btn-voltar-form");
    const inputs = document.querySelectorAll(".input-form");
    const checkboxesTipAssistencia = document.querySelectorAll(".checkbox-padrao input[type=checkbox]");

    if (btnEditar && btnCancelar && btnSalvar) {
        btnEditar.onclick = () => {
            toggleEdicao(true);
        };
        btnCancelar.onclick = () => {
            toggleEdicao(false);
        };
    }

    function toggleEdicao(ativo) {
        btnEditar.style.display = ativo ? "none" : "block";
        btnCancelar.style.display = ativo ? "block" : "none";
        btnSalvar.style.display = ativo ? "block" : "none";
        btnAnterior.style.display = ativo ? "none" : "block";
        btnSeguinte.style.display = ativo ? "none" : "block";
        btnVoltar.style.display = ativo ? "none" : "block";

        inputs.forEach(i => i.disabled = !ativo);
        checkboxesTipAssistencia.forEach(cb => cb.disabled = !ativo);
    }

    // 🔹 Máscaras
    aplicarMascaras();

    function aplicarMascaras() {
        const tel1 = document.getElementById("input-tel");
        const tel2 = document.getElementById("input-tel2");
        const cpf = document.getElementById("input-cpf");
        const cep = document.getElementById("cep");
        const btnSalvarForm = document.querySelector(".btn-salvar");

        function mascaraTelefone(v) {
            v = v.replace(/\D/g, "");
            v = v.replace(/^(\d{2})(\d)/, "($1) $2");
            v = v.replace(/(\d{5})(\d)/, "$1-$2");
            v = v.replace(/(\d{4})-(\d{5})$/, "$1$2");
            return v;
        }

        function mascaraCPF(v) {
            v = v.replace(/\D/g, "");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            return v;
        }

        function mascaraCEP(v) {
            v = v.replace(/\D/g, "").slice(0, 8);
            if (v.length >= 6) return `${v.slice(0, 2)}.${v.slice(2, 5)}-${v.slice(5, 8)}`;
            if (v.length >= 3) return `${v.slice(0, 2)}.${v.slice(2)}`;
            return v;
        }

        if (tel1) tel1.oninput = () => tel1.value = mascaraTelefone(tel1.value);
        if (tel2) tel2.oninput = () => tel2.value = mascaraTelefone(tel2.value);
        if (cpf) cpf.oninput = () => cpf.value = mascaraCPF(cpf.value);
        if (cep) cep.oninput = () => cep.value = mascaraCEP(cep.value);

        if (btnSalvarForm) {
            btnSalvarForm.onclick = () => {
                if (tel1) tel1.value = tel1.value.replace(/\D/g, "");
                if (tel2) tel2.value = tel2.value.replace(/\D/g, "");
                if (cpf) cpf.value = cpf.value.replace(/\D/g, "");
                if (cep) cep.value = cep.value.replace(/\D/g, "");
            };
        }
    }

    // 🔹 Salvamento da ficha
    const form = document.getElementById("ficha-assistido-form");
    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            if (!validarTipAssistencia()) return;

            const idAssistido = form.dataset.id;
            if (!idAssistido) {
                console.error("ID do assistido não encontrado!");
                return;
            }

            const formData = new FormData(form);
            const baseUrl = document.getElementById("area-data_url").dataset.urlEditar;
            const url = baseUrl.replace("0", idAssistido);

            fetch(url, {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": csrftoken
                }
            })
                .then(r => r.json().catch(() => { throw new Error("Resposta não está em JSON"); }))
                .then(data => {
                    if (data.success) {
                        exibirMensagemSucesso(data.message);
                        $("#area-exibicao").load(url, () => IniciarScripts(csrftoken));
                    } else {
                        let msg = data.message || "Erro ao salvar a ficha.";
                        if (data.errors) {
                            const erros = [];
                            for (const campo in data.errors) {
                                erros.push(`${campo}: ${[].concat(data.errors[campo]).join(", ")}`);
                            }
                            msg += "\n" + erros.join("\n");
                        }
                        exibirMensagemFalha(msg);
                    }
                })
                .catch(err => {
                    console.error("Erro no envio do formulário:", err);
                    exibirMensagemFalha("Erro inesperado ao salvar a ficha.");
                });
        };
    }
}

// 🔹 Validação do checkbox Tipos de Assistência
function validarTipAssistencia() {
    const checkboxes = document.querySelectorAll("#area-tip_assistencia input[type='checkbox']");
    const selecionado = Array.from(checkboxes).some(cb => cb.checked);
    if (!selecionado) {
        MsgErroTipAssistencia("Escolha ao menos um tipo de assistência.");
        return false;
    }
    return true;
}
