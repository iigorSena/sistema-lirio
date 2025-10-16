// SCRIPT PARA CARREGAMENTO DOS PRONTUÁRIOS ===============================
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-upload_prt");
    const areaCarregamento = document.getElementById("area-carregamento_upload_prt");
    const btnUpload = document.getElementById("btn-upload_prt");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const xhr = new XMLHttpRequest();

        // Limpa e cria a barra
        areaCarregamento.innerHTML = `
            <div style="width: 100%; background-color: #ddd; border-radius: 6px; overflow: hidden;">
                <div id="barra-progresso"
                    style="width: 0%;
                        height: 20px;
                        background-color: #00bcd4;
                        text-align: center;
                        color: white;
                        font-size: 13px;
                        font-weight: bold;
                        transition: width 0.4s ease;">0%</div>
            </div>
        `;

        const barra = document.getElementById("barra-progresso");

        xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                barra.style.width = percent + "%";
                barra.textContent = percent + "%";
            }
        });

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    barra.style.backgroundColor = "#4caf50";
                    barra.textContent = "Carregamento concluído!";
                    form.reset();
                } else {
                    barra.style.backgroundColor = "#f44336";
                    barra.textContent = "Erro no carregamento!";
                }
            }
        };

        xhr.open("POST", form.action);
        xhr.setRequestHeader("X-CSRFToken", form.querySelector('[name=csrfmiddlewaretoken]').value);
        xhr.send(formData);
    });
});


// SCRIPT PARA VISUALIZAÇÃO DOS PRONTUÁRIOS ================================
document.addEventListener("DOMContentLoaded", function () {
    const checkboxTodosAnos = document.getElementById("check-todos_anos");
    const btnBuscar = document.getElementById("btn-pesquisar-tb-prt");
    const inputBusca = document.getElementById("input-busca_prt");
    const selectAno = document.getElementById("select-ano_visu");
    const tbody = document.getElementById("tbody-prontuarios");

    checkboxTodosAnos.addEventListener("change", function () {
        selectAno.disabled = this.checked;
    });

    btnBuscar.addEventListener("click", function () {
        const nome = inputBusca.value.trim();
        const anoSelecionado = selectAno.value;
        const todosAnos = checkboxTodosAnos.checked;

        if (!nome && !todosAnos && !anoSelecionado) {
            tbody.innerHTML = `<tr><td colspan="3">Nenhum prontuário encontrado.</td></tr>`;
            return;
        }

        let url = `?busca_prt=${encodeURIComponent(nome)}`;
        if (todosAnos) {
            url += `&todos_anos=1`;
        } else {
            url += `&ano=${encodeURIComponent(anoSelecionado)}`;
        }

        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const newTbody = doc.getElementById("tbody-prontuarios");
                if (newTbody) {
                    tbody.innerHTML = newTbody.innerHTML;
                    bindPopupLinks();
                }
            });
    });

    function bindPopupLinks() {
        document.querySelectorAll('.link-img-prt').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const imgUrl = this.dataset.imgUrl;
                const popup = document.getElementById("popup-img_prt");
                popup.innerHTML = `
                    <div class="popup-overlay">
                        <div class="popup-exibicao_prt">
                            <img src="${imgUrl}" alt="Imagem do prontuário" style="max-width:80vw; max-height:80vh;">
                            <br><button onclick="this.closest('.popup-overlay').remove()" class="btn-padrao">Fechar</button>
                        </div>
                    </div>
                `;
            });
        });
    }

    bindPopupLinks(); // ativa links ao carregar pela primeira vez
});
