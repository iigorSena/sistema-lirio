//Chama o POP-UP de Cadastro de Atendimento
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btn-pop_cad_hist_atend_atf").addEventListener("click", function () {
        document.getElementById("sombra-popup_cad_atend_atf").style.display = "block";
        document.getElementById("form-Cad_Atend_Atf").style.display = "block";
    });

    document.getElementById("area-btn_close_cd_atend_atf").addEventListener("click", function () {
        document.getElementById("sombra-popup_cad_atend_atf").style.display = "none";
        document.getElementById("form-Cad_Atend_Atf").style.display = "none";
    });
});

//Cadastra um novo Atendimento
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-Cad_Atend_Atf");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        formData.append("csrfmiddlewaretoken", document.querySelector("[name=csrfmiddlewaretoken]").value);

        fetch("", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Atendimento cadastrado com sucesso!");
                location.reload(); // Atualiza a página
            } else {
                alert("Erro ao cadastrar: " + JSON.stringify(data.errors));
            }
        })
        .catch(error => console.error("Erro na requisição:", error));
    });
});


// Função de controle da visibilidade dos botões:
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("#cln-acao_tb_Hist_Atend_Atf").forEach(td => {
        let row = td.closest("tr"); // Pega a linha da tabela correspondente
        let lapisBtn = td.querySelector("button img[src*='lapis-amarelo.png']").parentElement;
        let lixeiraBtn = td.querySelector("button img[src*='lixeira.png']").parentElement;
        let cancelarBtn = td.querySelector("button img[src*='cancelar.png']").parentElement;
        let inputFields = row.querySelectorAll(".input-tb_Hist_Atend_Atf");  // Todos os campos de entrada na linha

        // Impede que a ação do botão recarregue a página
        function toggleButtons(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Evento para o botão lápis amarelo (habilitar edição)
        lapisBtn.addEventListener("click", function (event) {
            toggleButtons(event);
            lapisBtn.style.display = "none"; 
            lixeiraBtn.style.display = "block";
            cancelarBtn.style.display = "block";

            // Habilita todos os campos de input para edição
            inputFields.forEach(input => {
                input.removeAttribute("disabled");
            });
        });

        // Evento para o botão cancelar (desabilitar edição)
        cancelarBtn.addEventListener("click", function (event) {
            toggleButtons(event);
            lapisBtn.style.display = "block"; 
            lixeiraBtn.style.display = "none";
            cancelarBtn.style.display = "none";

            // Desabilita todos os campos de input novamente
            inputFields.forEach(input => {
                input.setAttribute("disabled", "true");
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("[id^='btn-confirmar_tb_hist_atf_']").forEach(button => {
        let id = button.getAttribute("data-id");

        button.addEventListener("click", function() {
            let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

            let facilitador = document.querySelector(`#facilitador-tb_hist_atf_${id}`).value;
            let quant_1_vez = document.querySelector(`#1vez-tb_hist_atf_${id}`).value;
            let quant_retorno = document.querySelector(`#retoro-tb_hist_atf_${id}`).value;
            let data = document.querySelector(`#data-tb_hist_atf_${id}`).value;

            fetch(window.location.href, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `historico_id=${id}&facilitador=${encodeURIComponent(facilitador)}&quant_1_vez=${encodeURIComponent(quant_1_vez)}&quant_retorno=${encodeURIComponent(quant_retorno)}&data=${encodeURIComponent(data)}&action=update`
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Registro atualizado com sucesso!");
                    location.reload();
                } else if (data.status === "error" && data.errors) {
                    alert("Erro ao atualizar: " + JSON.stringify(data.errors));
                } else {
                    alert("Erro desconhecido ao atualizar.");
                }
            })
            .catch(error => console.error("Erro na requisição:", error));
        });
    });
});



// Função para exclusão de registro
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".btn-action_Hist_Atend_Atf").forEach(button => {
        if (!button.dataset.listener) {  // Evita múltiplos eventos
            button.dataset.listener = "true";

            let img = button.querySelector("img");

            // Excluir histórico
            if (img && img.src.includes("lixeira.png")) {
                button.addEventListener("click", function () {
                    let id = this.getAttribute("data-id");
                    let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

                    if (confirm("Tem certeza que deseja excluir este registro?")) {
                        fetch(window.location.href, {
                            method: "POST",
                            headers: {
                                "X-CSRFToken": csrfToken,
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: `historico_id=${id}&action=delete`
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === "success") {
                                alert("Registro excluído com sucesso!");
                                window.location.reload(); // Recarrega a página após a exclusão
                            } else {
                                alert("Erro ao excluir: " + (data.message || "Falha desconhecida"));
                            }
                        })
                        .catch(error => {
                            console.error("Erro na requisição:", error);
                        });
                    }
                });
            }
        }
    });
});
