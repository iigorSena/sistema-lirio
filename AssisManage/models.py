from django.db import models


#Cada Class abaixo representa uma tabela

class tb_tip_assistencias(models.Model):
    tip_assis = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.tip_assis


class tb_assis(models.Model):
    name = models.CharField(max_length=70, null=True, blank=True)
    telefone = models.CharField(max_length=15, null=True, blank=True)
    cpf = models.CharField(max_length=11, unique=True, null=True, blank=True)
    data_nasci = models.DateField(null=True, blank=True)
    nome_mae = models.CharField(max_length=70, null=True, blank=True)
    cep = models.CharField(max_length=8, null=True, blank=True)
    cidade = models.CharField(max_length=50, null=True, blank=True)
    bairro = models.CharField(max_length=50, null=True, blank=True)
    logradouro = models.CharField(max_length=50, null=True, blank=True)
    numero = models.CharField(max_length=8, null=True, blank=True)
    tip_assistencia = models.ManyToManyField(tb_tip_assistencias, related_name="tipos_assis", blank=True)

    def __str__(self):
        return self.name



class tb_assis_hist(models.Model):
    tip_assistencia = models.CharField(max_length=50, null=True, blank=False)
    data = models.DateField(max_length=10, null=True, blank=False)
    local = models.CharField(max_length=50, null=True, blank=False)
    numero = models.IntegerField(null=True, blank=False)
