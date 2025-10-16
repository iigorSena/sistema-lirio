    // Delegação de evento com namespace
    $(document).off("click.buscarAssistido").on("click.buscarAssistido", "#btn-pesquisar-numero", function(e) {
        e.preventDefault();

        const cpfInput = document.getElementById('input-cpf_busca');
        if (!cpfInput) return;

        const cpf = cpfInput.value.trim();

        if (cpf === '') {
            const btnValidar = document.getElementById('btn-validar-atendimento');
            if (btnValidar) btnValidar.disabled = true;
            exibirMensagemAviso('Favor informe o CPF!');
            return;
        }

        fetch(`/buscar-assistido/?cpf=${cpf}`)
            .then(response => response.json())
            .then(data => {
                const btnValidar = document.getElementById('btn-validar-atendimento');

                if (data.status === 'ok') {
                    document.getElementById('nome').value = data.nome;
                    document.getElementById('data_nasci').value = data.data_nasci;
                    const nomeMae = document.querySelector('input[name="nome_mae"]');
                    if (nomeMae) nomeMae.value = data.nome_mae;
                    document.getElementById('id_assistido').value = data.id;

                    if (btnValidar) btnValidar.disabled = false;
                    exibirMensagemSucesso('Registro encontrado!');
                } else {
                    if (btnValidar) btnValidar.disabled = true;
                    exibirMensagemFalha('CPF não encontrado!');
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                ocultarMensagemDepois('msg-negacao');
            });
    });



    // Limitador de caracteres do Input-CPF =================================================
    $(document).off("input.limitadorCPF").on("input.limitadorCPF", "#input-cpf_busca", function () {
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 11) {
            this.value = this.value.slice(0, 11);
        }
    });

    // Delegação de paste com namespace
    $(document).off("paste.limitadorCPF").on("paste.limitadorCPF", "#input-cpf_busca", function (e) {
        e.preventDefault();
        const texto = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
        const apenasNumeros = texto.replace(/\D/g, '').slice(0, 11);
        this.value = apenasNumeros;
    });




    // Controle do cadastro de Histórico ========================================
    $(document).off("submit.cadHistorico").on("submit.cadHistorico", "#form-cad_hist_atend", function(e) {
        e.preventDefault();
        const form = this;
        const formData = new FormData(form);

        fetch('/entrega-cesta/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                exibirMensagemSucesso('Entrega de Cesta realizada:)');
                form.reset();  // limpa o form após salvar

                // limpa campos da tela
                const btnValidar = document.getElementById('btn-validar-atendimento');
                if (btnValidar) btnValidar.disabled = true;

                const nome = document.getElementById('nome');
                if (nome) nome.value = '';

                const dataNasci = document.getElementById('data_nasci');
                if (dataNasci) dataNasci.value = '';

                const nomeMae = document.querySelector('input[name="nome_mae"]');
                if (nomeMae) nomeMae.value = '';

                const idAssistido = document.getElementById('id_assistido');
                if (idAssistido) idAssistido.value = '';

                const cpfInput = document.getElementById('input-cpf_busca');
                if (cpfInput) cpfInput.value = '';
            } else {
                ocultarMensagemDepois('msg-gravacao-falhou');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar:', error);
            exibirMensagemFalha('Algo deu errado, entrega não realizada:(');
        });
    });


