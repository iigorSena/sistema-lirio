//Chama o POP-UP de Cadastro de Atendimento
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btn-pop_cad_geren_facilitador_atf").addEventListener("click", function () {
        document.getElementById("sombra-popup_cad_facilitador_atf").style.display = "block";
        document.getElementById("form-Cad_facilitador_Atf").style.display = "block";
    });

    document.getElementById("area-btn_close_cd_facilitador_atf").addEventListener("click", function () {
        document.getElementById("sombra-popup_cad_facilitador_atf").style.display = "none";
        document.getElementById("form-Cad_facilitador_Atf").style.display = "none";
    });
});

// Função Salvar um novo Registro
document.addEventListener("DOMContentLoaded", function () {
    // Captura o botão de cadastro (ajuste o seletor conforme necessário)
    let btnCadastrar = document.querySelector("#btn-cad_facilitador_atf");

    if (btnCadastrar) {
        btnCadastrar.addEventListener("click", function () {
            let nomeFacilitador = document.querySelector("input[name='facilitador']").value;
            let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

            if (!nomeFacilitador.trim()) {
                alert("Por favor, insira o nome do facilitador.");
                return;
            }

            fetch(window.location.href, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `facilitador=${encodeURIComponent(nomeFacilitador)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Facilitador cadastrado com sucesso!");
                    location.reload(); // Atualiza a página para mostrar o novo registro
                } else {
                    alert("Erro ao cadastrar: " + JSON.stringify(data.errors));
                }
            })
            .catch(error => console.error("Erro na requisição:", error));
        });
    }
});


// Função para salvar Registro Editado ================================================================
document.querySelectorAll(".btn-action_geren_facili").forEach(button => {
    let img = button.querySelector("img");

    if (img && img.src.includes("confirmar.png")) {
        button.addEventListener("click", function() {
            let id = this.getAttribute("data-id");
            let inputNome = document.querySelector(`input.input-tb_geren_facili[data-id='${id}']`);
            let nome = inputNome ? inputNome.value.trim() : "";
            let selectStatus = document.querySelector(`select.input-tb_geren_facili[data-id='${id}']`);
            let status = selectStatus ? selectStatus.value : "";


            if (!nome) {
                alert("O nome do facilitador não pode estar vazio.");
                return;
            }

            let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

            fetch(window.location.href, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `facilitador_id=${id}&facilitador=${encodeURIComponent(nome)}&status=${encodeURIComponent(status)}&action=update`
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    window.location.reload();
                } else {
                    window.location.reload();;
                }
            })
            .catch(error => console.error("Erro na requisição:", error));
        });
    }
});

//Função para excluir FAcilitador ======================================================
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".btn-action_geren_facili").forEach(button => {
        if (!button.dataset.listener) { // Evita múltiplos eventos
            button.dataset.listener = "true";

            let img = button.querySelector("img");

            // Excluir facilitador
            if (img && img.src.includes("lixeira.png")) {  
                button.addEventListener("click", function () {
                    let id = this.getAttribute("data-id");
                    let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

                    if (confirm("Tem certeza que deseja excluir este facilitador?")) {
                        fetch(window.location.href, {  
                            method: "POST",
                            headers: {
                                "X-CSRFToken": csrfToken,
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: `facilitador_id=${id}&action=delete`
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === "deleted") {
                                alert("Facilitador excluído com sucesso!");
                                let row = document.querySelector(`.input-tb_geren_facili[data-id='${id}']`)?.closest("tr");
                                if (row) row.remove();
                            } else {
                                alert("Erro ao excluir: " + (data.message || "Falha desconhecida"));
                            }
                        })
                        .catch(error => {
                            console.error("Erro na requisição:", error);
                            alert("Erro ao excluir. Verifique o console para mais detalhes.");
                        });
                    }
                });
            }
        }
    });
});

// Função de controle da visibilidade dos botões =============================================================================
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("#cln-acao_tb_geren_facili").forEach(td => {
        let row = td.closest("tr"); // Pega a linha da tabela correspondente
        let lapisBtn = td.querySelector("button img[src*='lapis-amarelo.png']").parentElement;
        let confirmarBtn = td.querySelector("button img[src*='confirmar.png']").parentElement;
        let lixeiraBtn = td.querySelector("button img[src*='lixeira.png']").parentElement;
        let cancelarBtn = td.querySelector("button img[src*='cancelar.png']").parentElement;
        let inputFacilitador = row.querySelector("input.input-tb_geren_facili");
        let selectStatus = row.querySelector("select.input-tb_geren_facili");

        // Armazena os valores originais
        let valorOriginalFacilitador = inputFacilitador.value;
        let valorOriginalStatus = selectStatus.value;

        // Impede que a ação do botão recarregue a página
        function toggleButtons(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Evento para o botão lápis amarelo (habilitar edição)
        lapisBtn.addEventListener("click", function (event) {
            toggleButtons(event);
            lapisBtn.style.display = "none"; 
            confirmarBtn.style.display = "block";
            lixeiraBtn.style.display = "block";
            cancelarBtn.style.display = "block";

            inputFacilitador.removeAttribute("disabled");
            selectStatus.removeAttribute("disabled");

            // Armazena os valores originais no momento da edição
            valorOriginalFacilitador = inputFacilitador.value;
            valorOriginalStatus = selectStatus.value;
        });

        // Cancela edição e restaura valores antigos
        cancelarBtn.addEventListener("click", function (event) {
            toggleButtons(event);
            lapisBtn.style.display = "block"; 
            confirmarBtn.style.display = "none";
            lixeiraBtn.style.display = "none";
            cancelarBtn.style.display = "none";

            inputFacilitador.value = valorOriginalFacilitador;
            selectStatus.value = valorOriginalStatus;

            inputFacilitador.setAttribute("disabled", "true");
            selectStatus.setAttribute("disabled", "true");
        });
    });
});