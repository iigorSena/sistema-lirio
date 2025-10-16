// Alterna a imagem dos botões recolher ===========================================================
$(document).off("click", "#img-recolher_menu").on("click", "#img-recolher_menu", function() {
    $("#area-menu").toggleClass("recolhido");

    // Alterna o display do outro botão
    const $desrecolher = $("#img-desrecolher_menu");
    if ($desrecolher.css("display") === "none") {
        $desrecolher.css("display", "block");
    } else {
        $desrecolher.css("display", "none");
    }
});

$(document).off("click", "#img-desrecolher_menu").on("click", "#img-desrecolher_menu", function() {
$("#area-menu").removeClass("recolhido");

    // Alterna o display do outro botão
    const $desrecolher = $("#img-desrecolher_menu");
    if ($desrecolher.css("display") === "block") {
        $desrecolher.css("display", "none");
    } else {
        $desrecolher.css("display", "none");
    }
});


// Controle do submenu Gestão de Pessoas ====================================================
document.addEventListener('DOMContentLoaded', function () {

    const btnMenuAssis = document.getElementById('btn-menu_gp');
    const barraSubmenu = document.getElementById('area-submenu_gp');
    const imgIcone = btnMenuAssis.querySelector('img');
    let aberto = false;

    btnMenuAssis.addEventListener('click', function () {
        aberto = !aberto;

        if (aberto) {
            barraSubmenu.style.height = 'auto';
            barraSubmenu.style.overflow = 'hidden';
            imgIcone.src = "/static/Sistema/images/menos.png";
        } else {
            barraSubmenu.style.height = '0';
            imgIcone.src = "/static/Sistema/images/mais.png";
        }
    });
});


// Controle do submenu Assistância ====================================================
document.addEventListener('DOMContentLoaded', function () {

    const btnMenuAssis = document.getElementById('btn-menu_assistencia');
    const barraSubmenu = document.getElementById('area-submenu_assistencia');
    const imgIcone = btnMenuAssis.querySelector('img');
    let aberto = false;

    btnMenuAssis.addEventListener('click', function () {
        aberto = !aberto;

        if (aberto) {
            barraSubmenu.style.height = 'auto';
            barraSubmenu.style.overflow = 'hidden';
            imgIcone.src = "/static/Sistema/images/menos.png";
        } else {
            barraSubmenu.style.height = '0';
            imgIcone.src = "/static/Sistema/images/mais.png";
        }
    });
});


// Controle do submenu Suprimentos ====================================================
document.addEventListener('DOMContentLoaded', function () {
    const btnMenuAssis = document.getElementById('btn-menu_suprimentos');
    const barraSubmenu = document.getElementById('area-submenu_suprimentos');
    const imgIcone = btnMenuAssis.querySelector('img');
    let aberto = false;

    btnMenuAssis.addEventListener('click', function () {
        aberto = !aberto;

        if (aberto) {
            barraSubmenu.style.height = 'auto';
            barraSubmenu.style.overflow = 'hidden';
            imgIcone.src = "/static/Sistema/images/menos.png";
        } else {
            barraSubmenu.style.height = '0';
            imgIcone.src = "/static/Sistema/images/mais.png";
        }
    });
})

// Controle genérico de submenus mobile ===================================================================
$(document).off("click", ".btn-submenudp").on("click", ".btn-submenudp", function () {
    const $btn = $(this);
    const barraId = $btn.data("target"); // pega o destino pelo atributo data-target
    const $barra = $("#" + barraId);

    // pega só o último <img> do botão (ícone de abrir/fechar)
    const $imgIcone = $btn.find("img").last();
    const aberto = $barra.hasClass("aberto");

    if (aberto) {
        $barra.removeClass("aberto").css("height", "0");
        $imgIcone.attr("src", "/static/Sistema/images/mais.png");
    } else {
        $barra.addClass("aberto").css({
            "height": "auto",
            "overflow": "hidden"
        });
        $imgIcone.attr("src", "/static/Sistema/images/menos.png");
    }
});