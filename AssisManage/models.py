from django.db import models
from django.db.models import PROTECT
from django.conf import settings 


#TB Tipos de Assistencias
class tb_tip_assistencias(models.Model):
    tip_assis = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.tip_assis

#TB Locais
class tb_locais(models.Model):
    local = models.CharField(max_length=50)

    def __str__(self):
        return self.local

#TB Vínculos
class tb_vinculos(models.Model):
    vinculo = models.CharField(max_length=40)
    STATUS_CHOICES=[
        ('Ativo', 'ativo'),
        ('Inativo', 'inativo')
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Ativo', verbose_name='Status')
    
    def __str__(self):
        return self.vinculo

#TB Assistidos
class tb_assis(models.Model):
    name = models.CharField(max_length=70, null=True, blank=True)
    telefone = models.CharField(max_length=15, null=True, blank=True)
    seg_telefone = models.CharField(max_length=15, null=True, blank=True)
    cpf = models.CharField(max_length=11, unique=True, null=True, blank=True)
    data_nasci = models.DateField(null=True, blank=True)
    nome_mae = models.CharField(max_length=70, null=True, blank=True)
    cep = models.CharField(max_length=8, null=True, blank=True)
    cidade = models.CharField(max_length=50, null=True, blank=True)
    bairro = models.CharField(max_length=80, null=True, blank=True)
    logradouro = models.CharField(max_length=80, null=True, blank=True)
    numero = models.CharField(max_length=8, null=True, blank=True)
    tip_assistencia = models.ManyToManyField(tb_tip_assistencias, related_name="tipos_assis", blank=True)
    vinculo = models.ForeignKey(tb_vinculos, on_delete=models.PROTECT, related_name="vinculos", null=True, blank=True)
    observacao = models.CharField(max_length=200, null=True, blank=True)
    ultima_alteracao = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='alteracoes_assistido'
    )
    data_cadastro = models.DateField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.name


#Emissão de senhas ======================================================================================
class tb_lote_senhas(models.Model):
    nome_lote = models.CharField(max_length=20)
    senhas_validas = models.IntegerField(default=0)
    tipo_assistencia = models.ForeignKey(tb_tip_assistencias, on_delete=models.PROTECT, related_name="assistencias_lote")
    vinculo = models.ForeignKey(tb_vinculos, on_delete=models.PROTECT, related_name="vinculos_lote")
    data_evento = models.DateField(null=True, blank=True)
    mensagem = models.CharField(max_length=100, null=True, blank=True)
    STATUS_CHOICES=[
        ('Ativo', 'Ativo'),
        ('Inativo', 'Inativo')
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Ativo', verbose_name='Status')
    ultima_alteracao = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='cadastro_senhas_lote'
    )
    def __str__(self):
            return f'Lote: {self.nome_lote}'    

# TB Senhas
class tb_senhas_assis(models.Model):
    lote_origem = models.ForeignKey(tb_lote_senhas, on_delete=models.PROTECT, related_name="senhas")
    assistido = models.ForeignKey("tb_assis", on_delete=models.PROTECT, related_name="assistidos")
    senha = models.IntegerField()
    data_entrega = models.DateField(max_length=10, null=True, blank=True)
    data_entrega_confi = models.DateTimeField(max_length=10, null=True, blank=True)
    STATUS_CHOICES=[
        ('Emitida', 'Emitida'),
        ('Confirmada', 'Confirmada'),
        ('Cancelada', 'Cancelada'),
    ]
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='Emitida', verbose_name='Status')
    entregador = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='entregador_cesta')

    def __str__(self):
        return f'Senha {self.senha} - Assistido {self.assistido}'

#TB Histórico Assistencial ===============================================================
class tb_assis_hist(models.Model):
    id_assistido = models.IntegerField( blank=True)
    tip_assistencia = models.ForeignKey(tb_tip_assistencias, on_delete=PROTECT, related_name="tipos_assistencia")
    local = models.ForeignKey(tb_locais, on_delete=PROTECT, related_name='locais', blank=True)
    data = models.DateField(max_length=10, null=True, blank=False)
    atendente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='atendente'
    )
    senha = models.CharField(max_length=12, null=True, blank=True)

    def __str__(self):
        return self.id_assistido