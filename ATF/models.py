from django.db import models

# Facilitadores
class FacilitadoresList(models.Model):
    STATUS_CHOICES=[
        ('ativo', 'Ativo'),
        ('inativo', 'Inativo'),
    ]
    
    facilitador = models.CharField(max_length=50, verbose_name="Facilitador")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ativo")

    def __str__(self):
        return self.facilitador

# Histórico
class HistAtendATF(models.Model):
    facilitador = models.ForeignKey(FacilitadoresList, on_delete=models.CASCADE, related_name="atendimentos")
    quant_1_vez = models.PositiveIntegerField(null=False, blank=False, default=0, verbose_name="Quant. 1° vez")
    quant_retorno = models.PositiveIntegerField(null=False, blank=False, default=0, verbose_name="Quant. Retorno")
    data = models.DateField(null=False, blank=False, verbose_name="Data")

    def __str__(self):
        return f"{self.facilitador} - {self.data}"

# Arquivo
class ArquivoATF(models.Model):
    nome = models.CharField(max_length=255)  # nome da pessoa, usado no nome do arquivo
    ano = models.IntegerField()
    imagem = models.ImageField(upload_to='ATF/img/Prontuarios/')  # não será usado diretamente
    data_envio = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} - {self.ano}"