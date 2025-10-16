// Chama a URL da Solicitação de Materiais ==============================================================
$(document).ready(function () {
    $('.btn_nova_rm').click(function () {
        let url = $(this).data('url'); 
        $('#area-exibicao').load(url, function () {
        });
    });
});