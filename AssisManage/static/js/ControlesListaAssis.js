// Click em botão da tabela -> carrega ficha
$(document).on('click.assist', '.btn-acao-tb-assis', function(e){
  e.preventDefault();
  const idAssistido = $(this).data('id');
  if (!idAssistido) {
    Msg('ID do assistido não encontrado!');
    return;
  }
  const urlFicha = `/lista-visitantes/ficha/${idAssistido}/`;
  loadArea(urlFicha);
});

// Submit do formulário de busca -> carrega listagem com query e filtro
$(document).off('submit', '#form-input-pesquisa-tb-assis');
$(document).on('submit', '#form-input-pesquisa-tb-assis', function(e){
    e.preventDefault();

    const busca    = $.trim($('#input-busca_listar_visitante').val() || '');
    const criterio = $('#select-criterio_listar_visitantes').val() || 'tudo';
    const filtro   = $('input[name="filtro"]:checked').val() || 'data';

    // monta querystring
    let params = [];
    if (busca)    params.push(`busca=${encodeURIComponent(busca)}`);
    if (criterio) params.push(`criterio=${encodeURIComponent(criterio)}`);
    if (filtro)   params.push(`filtro=${encodeURIComponent(filtro)}`);

    const url = params.length > 0 ? `${urlListaAssistidos}?${params.join("&")}` : urlListaAssistidos;

    // carrega a listagem via AJAX
    $('#area-exibicao').load(url, function(response, status, xhr){
        if (status === 'error') {
            console.error('Erro ao carregar', xhr.status, xhr.statusText, '->', url);
        }
    });

    console.log('URL gerada:', url);
});


// Paginação (links de paginação podem estar em #area-paginacao ou no conteúdo carregado)
$(document).on('click.assist', '#area-paginacao .controle-page, #area-exibicao .controle-page', function(e){
  e.preventDefault();
  const url = $(this).attr('href');
  if (!url) return;
  loadArea(url);
});

// função utilitária para carregar a área principal
function loadArea(url) {
  $('#area-exibicao').load(url, function(response, status, xhr){
    if (status === 'error') {
      console.error('Erro ao carregar', xhr.status, xhr.statusText, '->', url);
      return;
    }
  });
}

