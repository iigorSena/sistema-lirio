# models.py
from django.db import models
from django.contrib.auth.models import Group

# TB Módulos
class Modulos(models.Model):
    nome = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return self.nome

class GrupoModulo(models.Model):
    grupo = models.OneToOneField(Group, on_delete=models.CASCADE, related_name="modulo_grupo")
    modulo = models.ForeignKey(Modulos, on_delete=models.CASCADE, related_name="grupos")

    def __str__(self):
        return f"{self.grupo.name} ({self.modulo.nome})"