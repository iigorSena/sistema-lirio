from django.apps import AppConfig
from django.db.models.signals import post_migrate

class AssismanageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'AssisManage'

    def ready(self):
        post_migrate.connect(criar_opcoes_padrao, sender=self)

def criar_opcoes_padrao(sender, **kwargs):
    from AssisManage.models import tb_tip_assistencias  # Importa o modelo
    opcoes_padrao = ["Atendimento Fraterno", "Cesta Básica de Natal"]
    for opcao in opcoes_padrao:
        tb_tip_assistencias.objects.get_or_create(tip_assis=opcao)