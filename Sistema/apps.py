from django.apps import AppConfig

class SistemaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Sistema'

    def ready(self):
        from django.db.models.signals import post_migrate
        from .signals import criar_grupos_e_permissoes, criar_modulos_padrao

        post_migrate.connect(criar_modulos_padrao, sender=self)
        post_migrate.connect(criar_grupos_e_permissoes, sender=self)
