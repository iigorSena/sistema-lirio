from django.contrib import admin
from django.urls import path

from HomePage.views import home, login_view, logout_view
from AssisManage.views import CadAssis
from AssisManage.views import FichaAssistido
from Atendimento.views import Atendimento
from Atendimento.views import salvar_historico

urlpatterns = [
    path('administracao/', admin.site.urls),
    path('', login_view, name = 'login'),
    path('logout/', logout_view, name = 'logout'),
    path('home/', home, name = 'home'),
    
    path('cadastro-assistencial/', CadAssis.as_view(), name = 'CadAssis'),
    path('cadastro-assistencial/ficha-assistido/<int:pk>/', FichaAssistido.as_view(), name = 'ficha-assistido'),
    
    path('atendimento/', Atendimento.as_view(), name = 'atendimento'),
    path('atendimento/<int:pk>/', Atendimento.as_view(), name = 'atendimento_pk'),
    path('atendimento/salvar-historico/', salvar_historico, name='salvar_historico'),


]
