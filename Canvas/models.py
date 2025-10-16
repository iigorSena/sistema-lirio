from django.db import models
from django.contrib.auth.models import User

class Canvas(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    dados_json = models.JSONField()  # Guarda posições, cores, fontes, imagens etc.
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nome} ({self.usuario.username})"
