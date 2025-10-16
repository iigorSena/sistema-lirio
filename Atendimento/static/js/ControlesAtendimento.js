document.getElementById('btn-pesquisar-numero').addEventListener('click', function () {
    var numero = document.getElementById('input-checagem').value.trim();

    var msgAlerta = document.getElementById('msg-alerta-input-vazio');
    var msgConfirmacao = document.getElementById('msg-confirmacao');
    var msgNegacao = document.getElementById('msg-negacao');
    var msgSucessoGrav = document.getElementById('msg-gravacao-bem-sucedida');
    var msgFalhaGrav = document.getElementById('msg-gravacao-falhou');
    var dataField = document.getElementById('input-data');

    msgAlerta.style.display = 'none';
    msgConfirmacao.style.display = 'none';
    msgNegacao.style.display = 'none';
    msgSucessoGrav.style.display ='none';
    msgFalhaGrav.style.display = 'none';

    if (!numero) {
        msgAlerta.style.display = 'block';
        return; 
    }

    function formatCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        return cpf.length === 11 ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
    }

    // Obtendo o CSRF Token do cookie
    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch('/atendimento/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken  // Incluindo o token CSRF
        },
        body: `numero=${numero}`,
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            msgNegacao.style.display = 'block';
        } else {
            // Atualiza os dados com a resposta JSON
            document.getElementById('nome').value = data.name;
            document.getElementById('cpf').value = formatCPF(data.cpf || '');
            document.getElementById('data_nasci').value = data.data_nasci;
            document.getElementById('numero').value = data.id;

            const today = new Date();
            const formattedDate = today.toLocaleDateString('pt-BR', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
            dataField.textContent = formattedDate;

            msgConfirmacao.style.display = 'block';
            msgSucessoGrav.style.display = 'none';
            msgFalhaGrav.style.displey = 'none';
            verificarCampoNumero();
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        msgNegacao.style.display = 'block';
    });
});

// Função para verificar o estado do botão
function verificarCampoNumero() {
    const numeroInput = document.getElementById('numero');
    const validarBtn = document.getElementById('btn-validar-atendimento');

    const hasValue = numeroInput.value.trim() !== ""; // Verifica se o campo possui valor

    if (hasValue) {
        // Ativa o botão e ajusta os estilos
        validarBtn.disabled = false;
        validarBtn.style.color = "#051753";
        validarBtn.style.boxShadow = "0px 4px 15px black";
    } else {
        // Desativa o botão e ajusta os estilos
        validarBtn.disabled = true;
        validarBtn.style.color = "#737479";
        validarBtn.style.boxShadow = "none";
    }
}

document.getElementById('btn-validar-atendimento').addEventListener('click', function () {
    // Captura os valores dos campos
    const tipAssis = document.getElementById('input-tip_assis').textContent.trim();
    const local = document.getElementById('input-local').textContent.trim();
    const dataOriginal = document.getElementById('input-data').textContent.trim();
    const numero = document.getElementById('numero').value.trim();

     // Converte a data de DD/MM/AAAA para YYYY-MM-DD
     const dataConvertida = converterDataParaFormatoISO(dataOriginal);

    // Configura os dados a serem enviados
    const payload = {
        tip_assistencia: tipAssis,
        local: local,
        data: dataConvertida,
        numero: numero
    };

    // Envia os dados para o servidor
    fetch('/atendimento/salvar-historico/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(), // Função para obter o CSRF token
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (response.ok) {
                // Exibe a mensagem de sucesso
                document.getElementById('msg-gravacao-bem-sucedida').style.display = 'block';
                document.getElementById('msg-confirmacao').style.display = 'none';
            } else {
                // Exibe a mensagem de erro
                document.getElementById('msg-gravacao-falhou').style.display = 'block';
                document.getElementById('msg-confirmacao').style.display = 'none';
            }
        })
        .catch(error => {
            // Exibe a mensagem de erro em caso de exceção
            document.getElementById('msg-gravacao-falhou').style.display = 'block';
            document.getElementById('msg-confirmacao').style.display = 'none';
        });
});

// Converte DD/MM/AAAA para YYYY-MM-DD
function converterDataParaFormatoISO(data) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
}

// Obtém CSRF Token
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

