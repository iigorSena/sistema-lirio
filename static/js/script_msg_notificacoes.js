// Mensagem de Sucesso =======================================================
function exibirMensagemSucesso(msg) {
    let container = document.querySelector(".messages");

    // Se não existir, cria o container
    if (!container) {
        container = document.createElement("ul");
        container.classList.add("messages");
        document.body.prepend(container);
    }

    const li = document.createElement("li");
    li.className = "msg-sucesso msg-notificacao"; // mesmo que message.tags
    li.innerHTML  = msg;

    // Gera um id único
    const msgId = "msg_" + Date.now();
    li.id = msgId;
    container.appendChild(li);

    ocultarMensagemDepois(msgId);
}

// Mensagem de Aviso =======================================================
function exibirMensagemAviso(msg) {
    let container = document.querySelector(".messages");

    // Se não existir, cria o container
    if (!container) {
        container = document.createElement("ul");
        container.classList.add("messages");
        document.body.prepend(container);
    }

    const li = document.createElement("li");
    li.className = "msg-aviso msg-notificacao"; // mesmo que message.tags
    li.innerHTML  = msg;

    // Gera um id único
    const msgId = "msg_" + Date.now();
    li.id = msgId;
    container.appendChild(li);

    ocultarMensagemDepois(msgId);
}

// Mensagem de Falha =======================================================
function exibirMensagemFalha(msg) {
    let container = document.querySelector(".messages");

    // Se não existir, cria o container
    if (!container) {
        container = document.createElement("ul");
        container.classList.add("messages");
        document.body.prepend(container);
    }

    const li = document.createElement("li");
    li.className = "msg-falha msg-notificacao"; // mesmo que message.tags
    li.innerHTML  = msg;

    // Gera um id único
    const msgId = "msg_" + Date.now();
    li.id = msgId;
    container.appendChild(li);

    ocultarMensagemDepois(msgId);
}

// Mensagem de CPF já cadastrado ============================================
function MsgCPFCadastrado(msg = "CPF já cadastrado ou em branco!") {
    let container = document.querySelector(".messages");

    // Se não existir, cria o container
    if (!container) {
        container = document.createElement("ul");
        container.classList.add("messages");
        document.body.prepend(container);
    }

    const li = document.createElement("li");
    li.className = "msg-cpf-error msg-notificacao";
    li.innerHTML  = msg;

    // Gera um id único
    const msgId = "msg_" + Date.now();
    li.id = msgId;
    container.appendChild(li);

    ocultarMensagemDepois(msgId);
}
// Mensagem de Selecione uma Assistência ============================================
function MsgErroTipAssistencia(msg) {
    let container = document.querySelector(".messages");

    if (!container) {
        container = document.createElement("ul");
        container.classList.add("messages");
        document.body.prepend(container);
    }

    const li = document.createElement("li");
    li.className = "error-tip-assistencia msg-notificacao";
    li.textContent = msg;

    const msgId = "msg_" + Date.now();
    li.id = msgId;
    container.appendChild(li);

    ocultarMensagemDepois(msgId);
}

// Oculta a mensagem============================================================
const ocultarMensagemDepois = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Reinicia o estado visível
    el.classList.remove('oculto');
    el.style.display = 'block';

    // Força reflow para aplicar transição (necessário em alguns navegadores)
    void el.offsetWidth;

    // Inicia fade-out após 4.5s
    setTimeout(() => {
        el.classList.add('oculto');
    }, 4500);

    // Remove do layout após a transição (em 5s total)
    setTimeout(() => {
        el.style.display = 'none';
        el.classList.remove('oculto'); // limpa classe para próxima vez
    }, 5000);
};


// Script global de mensagens =================================================================

// Cria a div do modal se ainda não existir
if ($("#global-confirm-modal").length === 0) {
    $("body").append(`
        <div id="global-confirm-modal" class="hidden">
            <div class="confirm-modal-content">
                <p id="global-confirm-message"></p>
                <div class="confirm-modal-buttons">
                    <button id="global-confirm-yes">Confirmar</button>
                    <button id="global-confirm-no">Cancelar</button>
                </div>
            </div>
        </div>
    `);

    // Estilo do modal
    $("<style>").prop("type", "text/css").html(`
        #global-confirm-modal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        #global-confirm-modal.hidden { display: none; }
        .confirm-modal-content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .confirm-modal-buttons { margin-top: 20px; }
        .confirm-modal-buttons button {
            margin: 0 10px;
            padding: 8px 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        #global-confirm-yes { background-color: #28a745; color: #fff; }
        #global-confirm-no { background-color: #dc3545; color: #fff; }
    `).appendTo("head");
}

// Função para exibir o modal de confirmação
function exibirPopUpPergunta(message, onConfirm, onCancel) {
    $("#global-confirm-message").text(message);
    $("#global-confirm-modal").removeClass("hidden");

    // Remove event listeners anteriores para evitar duplicidade
    $("#global-confirm-yes").off("click").on("click", function() {
        $("#global-confirm-modal").addClass("hidden");
        if (typeof onConfirm === "function") onConfirm();
    });

    $("#global-confirm-no").off("click").on("click", function() {
        $("#global-confirm-modal").addClass("hidden");
        if (typeof onCancel === "function") onCancel();
    });
}
