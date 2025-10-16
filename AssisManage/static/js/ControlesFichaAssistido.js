(function () {
    console.log("Script do template ficha-assistido carregado...");

    // ---------------------------
    // 🔹 Navegação e botão voltar
    // ---------------------------
    $(document).off("click", ".btn-navegacao").on("click", ".btn-navegacao", function (e) {
        e.preventDefault();
        const url = $(this).data("url");
        if (!url) return;
        $("#area-exibicao").load(url); // o global chama de novo o script do novo template
    });

    $(document).off("click", "#btn-voltar-form").on("click", "#btn-voltar-form", function () {
        const url = $(this).data("url");
        $("#area-exibicao").load(url);
    });

    // ---------------------------
    // 🔹 Controle de edição
    // ---------------------------
    $(document).off("click", "#btn-editar-form").on("click", "#btn-editar-form", function () {
        toggleEdicao(true);
    });

    $(document).off("click", "#btn-cancelar-form").on("click", "#btn-cancelar-form", function () {
        toggleEdicao(false);
    });

    function toggleEdicao(ativo) {
        const btnEditar = document.getElementById("btn-editar-form");
        const btnCancelar = document.getElementById("btn-cancelar-form");
        const btnSalvar = document.getElementById("btn-salvar-form");
        const btnAnterior = document.getElementById("btn-anterior-form");
        const btnSeguinte = document.getElementById("btn-seguinte-form");
        const btnVoltar = document.getElementById("btn-voltar-form");
        const inputs = document.querySelectorAll(".input-form");
        const checkboxes = document.querySelectorAll(".checkbox-padrao input[type=checkbox]");

        if (!btnEditar || !btnCancelar || !btnSalvar) return;

        btnEditar.style.display = ativo ? "none" : "block";
        btnCancelar.style.display = ativo ? "block" : "none";
        btnSalvar.style.display = ativo ? "block" : "none";
        if (btnAnterior) btnAnterior.style.display = ativo ? "none" : "block";
        if (btnSeguinte) btnSeguinte.style.display = ativo ? "none" : "block";
        if (btnVoltar) btnVoltar.style.display = ativo ? "none" : "block";

        inputs.forEach(i => i.disabled = !ativo);
        checkboxes.forEach(cb => cb.disabled = !ativo);
    }

    // ---------------------------
    // 🔹 Máscaras de campos
    // ---------------------------
    $(document).off("input", "#input-tel").on("input", "#input-tel", function () {
        this.value = mascaraTelefone(this.value);
    });

    $(document).off("input", "#input-tel2").on("input", "#input-tel2", function () {
        this.value = mascaraTelefone(this.value);
    });

    $(document).off("input", "#input-cpf").on("input", "#input-cpf", function () {
        this.value = mascaraCPF(this.value);
    });

    $(document).off("input", "#cep").on("input", "#cep", function () {
        this.value = mascaraCEP(this.value);
    });

    $(document).off("click", ".btn-salvar").on("click", ".btn-salvar", function () {
        const tel1 = document.getElementById("input-tel");
        const tel2 = document.getElementById("input-tel2");
        const cpf = document.getElementById("input-cpf");
        const cep = document.getElementById("cep");
        if (tel1) tel1.value = tel1.value.replace(/\D/g, "");
        if (tel2) tel2.value = tel2.value.replace(/\D/g, "");
        if (cpf) cpf.value = cpf.value.replace(/\D/g, "");
        if (cep) cep.value = cep.value.replace(/\D/g, "");
    });

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

    // ---------------------------
    // 🔹 Salvamento
    // ---------------------------
    $(document).off("submit", "#ficha-assistido-form").on("submit", "#ficha-assistido-form", function (e) {
        e.preventDefault();
        if (!validarTipAssistencia()) return;

        const form = this;
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
                "X-CSRFToken": form.dataset.csrf
            }
        })
            .then(r => r.json().catch(() => { throw new Error("Resposta não está em JSON"); }))
            .then(data => {
                if (data.success) {
                    exibirMensagemSucesso(data.message);
                    $("#area-exibicao").load(url); // o global recarrega e reativa só este script
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
    });

    // ---------------------------
    // 🔹 Validação
    // ---------------------------
    function validarTipAssistencia() {
        const checkboxes = document.querySelectorAll("#area-tip_assistencia input[type='checkbox']");
        const selecionado = Array.from(checkboxes).some(cb => cb.checked);
        if (!selecionado) {
            MsgErroTipAssistencia("Escolha ao menos um tipo de assistência.");
            return false;
        }
        return true;
    }

})();
