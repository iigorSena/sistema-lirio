// Controle do Jquery ==============================================================
$(document).ready(function () {
    $('.btn-nav_menu').click(function () {
        let url = $(this).data('url'); 
        $('#area-exibicao').load(url, function () {
        });
    });
});


// CSRF token =================================================================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie("csrftoken");

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^GET|HEAD|OPTIONS|TRACE$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

