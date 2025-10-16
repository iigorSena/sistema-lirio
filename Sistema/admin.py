from django.contrib import admin
from .models import Modulos, GrupoModulo

@admin.register(Modulos)
class ModuloSistema(admin.ModelAdmin):
    list_display = ("nome","qtd_grupos", "listar_grupos")
    search_fields = ("nome", "grupos__grupo__name")
    ordering = ("nome",)
    
    def qtd_grupos(self, obj):
        return obj.grupos.count()
    qtd_grupos.short_description = "Total de grupos"
    
    def listar_grupos(self, obj):
        return ", ".join(g.grupo.name for g in obj.grupos.all())
    listar_grupos.short_description = "Grupos associados"

@admin.register(GrupoModulo)
class GrupoModuloSistema(admin.ModelAdmin):
    list_display = ("grupo", "modulo")
    list_filter = ("modulo",)
    ordering = ("grupo__name",)
    
