document.addEventListener("DOMContentLoaded", function () {
    const btnEditar = document.getElementById("btn-editar-form");
    const btnSalvar = document.getElementById("btn-salvar-form");
    const btnCancelar = document.getElementById("btn-cancelar-form");
    const checkboxes = document.querySelectorAll("#area-tip_assistencia .checkbox-item");
    const inputs = document.querySelectorAll(".input-form");
    const telInput = document.getElementById("input-tel");
    const dateInput = document.getElementById("input-data_nascimento");
    const cpfInput = document.getElementById("input-cpf");
    const cepInput = document.getElementById("cep");

    // Inicialmente, exibir apenas os itens selecionados
    checkboxes.forEach((item) => {
        const isSelected = item.dataset.selected === "true";
        if (!isSelected) {
            item.style.display = "none"; // Oculta itens não selecionados
        }
    });

    // Evento para habilitar edição
    btnEditar.addEventListener("click", function () {
        btnEditar.style.display = "none"; // Oculta o botão Editar
        btnSalvar.style.display = "block"; // Mostra o botão Salvar
        btnCancelar.style.display = "block"; // Mostra o botão Cancelar

        // Habilita os inputs para edição
        inputs.forEach((input) => {
            input.disabled = false;
        });

        // Exibir todos os itens e habilitar as checkboxes para edição
        checkboxes.forEach((item) => {
            item.style.display = "block"; // Mostra todos os itens
            const checkbox = item.querySelector("input[type='checkbox']");
            checkbox.disabled = false; // Habilita a edição
        });

        // Lógica específica para o campo "Tipo de Assistência"
        const tipoAssistenciaSelect = document.getElementById("tip_assistencia");

        // Atualiza o campo para exibir todas as opções ao habilitar edição
        tipoAssistenciaSelect.disabled = false; // Habilita o campo
        tipoAssistenciaSelect.innerHTML = `
            <option value="Atendimento Fraterno">Atendimento Fraterno</option>
            <option value="Cesta Básica de Natal">Cesta Básica de Natal</option>
        `;

        // Preserva as opções previamente selecionadas
        const selectedValues = JSON.parse(tipoAssistenciaSelect.dataset.selectedValues || "[]");
        selectedValues.forEach((value) => {
            const option = [...tipoAssistenciaSelect.options].find(opt => opt.value === value);
            if (option) option.selected = true;
        });
    });


    // Evento para cancelar edição
    btnCancelar.addEventListener("click", function () {
        btnEditar.style.display = "block";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "none";

        // Reverte alterações e desabilita os inputs
        inputs.forEach((input) => {
            input.value = input.defaultValue; // Restaura o valor inicial
            input.disabled = true;
        });
    });

    // Evento para salvar edição ============================================================
    btnSalvar.addEventListener("click", function () {
        if (dateInput) {
            dateInput.value = formatDate(dateInput.value); // Formata para YYYY-MM-DD
        }
        if (cpfInput) {
            cpfInput.value = removeCPFMask(cpfInput.value); // Remove máscara do CPF
        }
        if (cepInput) {
            cepInput.value = cepInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        }
        if (telInput) {
            telInput.value = removePhoneMask(telInput.value); // Remove a máscara do telefone
        }
        document.getElementById("ficha-assistido-form").submit();
    });
    

    // Eventos para formatação em tempo real =====================================================
    cpfInput.addEventListener("input", function () {
        this.value = formatCPF(this.value);   
    });
    if (cepInput) {
        cepInput.addEventListener("input", function () {
            cepInput.value = formatCEP(cepInput.value);
        });
    }
    if (dateInput) {
        dateInput.addEventListener("input", function () {
            dateInput.value = formatDateInput(dateInput.value);
        });
    }
    if (telInput) {
        telInput.addEventListener("input", function () {
            this.value = formatPhone(this.value);
        });
    }

    // Função para formatar telefone
    function formatPhone(value) {
        value = value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
        return value
            .replace(/^(\d{2})(\d)/, "($1) $2") // Adiciona parênteses no DDD e espaço após o DDD
            .replace(/(\d{1})(\d{4})(\d)/, "$1 $2-$3") // Adiciona espaço após o primeiro dígito e hífen entre os últimos grupos
            .substring(0, 16); // Limita o comprimento ao formato
    }
    // Função para remover a máscara do telefone
    function removePhoneMask(value) {
        return value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
    }

    // Função para formatar a data enquanto o usuário digita
    function formatDateInput(date) {
        return date
            .replace(/\D/g, "") // Remove todos os caracteres não numéricos
            .replace(/(\d{2})(\d)/, "$1/$2") // Adiciona a primeira barra após os 2 primeiros dígitos
            .replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3") // Adiciona a segunda barra após os 4 primeiros dígitos
            .substring(0, 10); // Limita o comprimento ao formato DD/MM/YYYY
    }

    // Função para formatar a data para o padrão YYYY/MM/DD
    function isTextDate(date) {
        return /\d{2}\sde\s\w+\sde\s\d{4}/.test(date);
    }

    
    function formatDate(date) {
        const parts = date.split("/"); 
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Função para formatar CPF
    function formatCPF(value) {
        value = value.replace(/\D/g, "");
        // Aplica a máscara de CPF
        return value
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
            .substring(0, 14);
    }
    // Função para remover a máscara do CPF
    function removeCPFMask(value) {
        return value.replace(/\D/g, "");
    }

    function formatCEP(cep) {
        return cep.replace(/\D/g, "")
            .replace(/^(\d{5})(\d{3})$/, "$1-$2")
            .substring(0, 9);
    }
});