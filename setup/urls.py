from django.urls import path
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static


from Sistema.views import Home, login_view, logout_view

from Gestao_de_Pessoas.views import CadAssisView

from AssisManage.views import (
    CadAssisMassaView, ListarVisitantesView, BuscarAssistidoPorCPF, FichaAssistidoView, EntregaCestasView, GeradorSenhasView, LoteDetalhado, GestaoDocumentosView)

from ATF.views import GerenAtfView, HistAtfView, ArquivoViews, DashboardView

from Suprimentos.views import (
    ListItensView, CadItemView, FichaItemView, NovaEntradaSupriView, ConsultarEstoqueView, ReqMateriaisView, SolicitarMateriaisView, AutrizarSolicView, AutorizarFichaSolicView,
    CadCategItensView, CadMarcasItensView, CadFornecedoresItensView)

from Canvas.views import GerenciaCanvasView, editor, save_template

urlpatterns = [
    path('', login_view, name = 'login'),
    path('logout/', logout_view, name = 'logout'),
    path('home/', Home.as_view(), name = 'home'),
    path('administracao/', admin.site.urls),
    
    #Link Gestão de Pessoas -----------------------------------------------------------------------------------------------
    path('cadastrar-assistido/', CadAssisView.as_view(), name = 'cadastrar-assistido'),

    #Liks Assistência -----------------------------------------------------------------------------------------------
    path('lista-visitantes/', ListarVisitantesView.as_view(), name = 'lista-visitantes'),
    path('cadastro-massa/', CadAssisMassaView.as_view(), name = 'CadAssisMassa'),
    path('lista-visitantes/ficha/<int:pk>/', FichaAssistidoView.as_view(), name = 'ficha-visitante'),
    
    path('gerar-senhas/', GeradorSenhasView.as_view(), name='gerador-senhas'),
    path('gerar-senhas/detalhes/<int:lote_id>/', LoteDetalhado.as_view(), name='lote-detalhado'),

    path('entrega-cesta/', EntregaCestasView.as_view(), name = 'entrega-cesta'),
    path('buscar-assistido/', BuscarAssistidoPorCPF.as_view(), name='buscar_assistido'),
    
    path("gestao-documentos/", GestaoDocumentosView.as_view() , name="gestao-doc"),
    path("gestao-documentos/gerar/<int:lote_id>/", GestaoDocumentosView.as_view(), name="gerar_cartoes"),

    #Gerenciamento do ATF -------------------------------------------------------------------------------------------
    path('dashboard-atf/', DashboardView.as_view(), name='dashboard-atf'),
    path('historico-atf/', HistAtfView.as_view(), name='historico-atf'),

    path('atf-gerenciamento/', GerenAtfView.as_view(), name='atf-gerenciamento'),
    path('atf-gerenciamento/atualizar/<int:pk>/', GerenAtfView.as_view(), name='atf-geren-atualizar-facil'),
    path('atf-gerenciamento/excluir/<int:pk>/', GerenAtfView.as_view(), name='atf-geren-excluir-facil'),

    path('atf-arquivo/', ArquivoViews.as_view(), name='atf-arquivo'),

    # Canvas -----------------------------------------------------------------------------------------------------------------
    path('gerenciador-canvas/', GerenciaCanvasView.as_view(), name='gerenciador_canvas'),
    path('canvas/editor/', editor, name='canvas-editor'),
    path('editor/<int:template_id>/', editor, name='canvas-editor-load'),
    path('save/', save_template, name='canvas-save-template'),

    #Gerenciamento do Suprimentos -------------------------------------------------------------------------------------
    path('requisicao-materiais/', ReqMateriaisView.as_view(), name='requisicao_materiais'),
    path('solicitar-materiais/', SolicitarMateriaisView.as_view(), name='solicitar_materiais'),

    path('cadastrar-item/', CadItemView.as_view(), name='cadastrar-item'),
    path('listar-itens/', ListItensView.as_view(), name='listar-itens'),
    path('listar-itens/ficha-suprimentos-item/<int:pk>/', FichaItemView.as_view(), name='ficha-suprimentos-item'),
    
    path('nova-entrada-suprimentos/', NovaEntradaSupriView.as_view(), name='nova-entrada-supri'),
    path('autorizar-solicitacao-rm/', AutrizarSolicView.as_view(), name='autorizar-solicitacao-rm'),
    path('autorizar-solicitacao-rm/ficha-suprimentos-rm/<int:pk>/', AutorizarFichaSolicView.as_view(), name='autorizar_ficha_solicitacao_rm'),

    path("consultar-estoque/", ConsultarEstoqueView.as_view(), name="consultar_estoque"),

    path("cadastro-categorias_itens/", CadCategItensView.as_view(), name="cad_categorias_itens"),
    path("cadastro-marcas_itens/", CadMarcasItensView.as_view(), name="cad_marcas_itens"),
    path("cadastro-fornecedores_itens/", CadFornecedoresItensView.as_view(), name="cad_fornecedor_itens"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)