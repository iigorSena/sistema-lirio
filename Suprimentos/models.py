from django.db import models
from django.utils import timezone
from django.conf import settings 


# TB Categotias =================================
class tb_categorias_itens(models.Model):
    STATUS_CHOICES = [
        ('Ativo', 'Ativo'),
        ('Inativo', 'Inativo'),
    ]

    nome = models.CharField(max_length=100)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='Ativo')

    def __str__(self):
        return self.nome
    
# TB Marcas ====================================
class tb_marcas(models.Model):
    STATUS_CHOICES = [
        ('Ativo', 'Ativo'),
        ('Inativo', 'Inativo'),
    ]

    nome = models.CharField(max_length=100)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='Ativo')

    def __str__(self):
        return self.nome

#TB Fornecedores =============================
class tb_fornecedores(models.Model):
    STATUS_CHOICES = [
        ('Ativo', 'Ativo'),
        ('Inativo', 'Inativo'),
    ]
    nome = models.CharField(max_length=100)
    cnpj = models.CharField(max_length=14, unique=True)
    telefone1 = models.CharField(max_length=20, blank=True, null=True)
    telefone2 = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    cep = models.CharField(max_length=8, null=True, blank=True)
    uf = models.CharField(max_length=25, null=True, blank=True)
    localidade = models.CharField(max_length=50, null=True, blank=True)
    bairro = models.CharField(max_length=80, null=True, blank=True)
    logradouro = models.CharField(max_length=80, null=True, blank=True)
    numero = models.CharField(max_length=8, null=True, blank=True)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='Ativo')
    observacao = models.CharField(max_length=250, null=True, blank=True)

    def __str__(self):
        return self.nome

#TB Ítens ===================================================================================
class tb_itens(models.Model):
    UNIDADE_MEDIDA_CHOICES = [
        ('UN', 'Unidade'),
        ('KG', 'Quilograma'),
        ('LT', 'Litro'),
        ('CX', 'Caixa'),
        ('MT', 'Metro'),
    ]

    STATUS_CHOICES = [
        ('Ativo', 'Ativo'),
        ('Inativo', 'Inativo'),
    ]

    nome = models.CharField(max_length=70)
    descricao = models.TextField(max_length=200, blank=True, null=True)
    categoria = models.ForeignKey(tb_categorias_itens, on_delete=models.CASCADE, related_name='categorias',)
    unidade_medida = models.CharField(max_length=2, choices=UNIDADE_MEDIDA_CHOICES)
    estoque_minimo = models.PositiveIntegerField(default=0)
    estoque_maximo = models.PositiveIntegerField(null=True, blank=True)
    data_cadastro = models.DateTimeField(default=timezone.now, editable=False)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='Inativo')
    cadastrador = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='cadastrador_usuario'
    )
    ultima_alteracao = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='alteracoes_usuario'
    )

    def __str__(self):
        return self.nome

#TB Registro de Entradas ===================================================================================
class tb_rg_entradas(models.Model):
    TIPO_ENTRADA_CHOICES = [
        ('Compra', 'Compra'),
        ('Doação', 'Doação'),
        ('Produção', 'Produção'),
    ]

    material = models.ForeignKey(tb_itens, on_delete=models.CASCADE, related_name='materiais_entrada',)
    marca = models.ForeignKey(tb_marcas, on_delete=models.CASCADE, related_name='marcas',)
    fornecedor = models.ForeignKey(tb_fornecedores, on_delete=models.CASCADE, related_name='fornecedores',)
    tip_entrada = models.CharField(max_length=10, choices=TIPO_ENTRADA_CHOICES,)
    quantidade = models.PositiveIntegerField()
    valor_und = models.CharField(max_length=10)
    valor_total = models.CharField(max_length=10)
    num_nota = models.PositiveIntegerField(null=True, blank=True)
    lote = models.CharField(max_length=10, null=True, blank=True)
    validade_lote = models.DateField(null=True, blank=True)
    data_cadastro = models.DateTimeField(default=timezone.now, editable=False)
    cadastrador = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.material
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # primeiro salva a entrada

        # Atualizar ou criar estoque
        from .models import tb_estoque  # importar aqui para evitar import circular

        estoque, created = tb_estoque.objects.get_or_create(
            material=self.material,
            marca=self.marca,
            lote=self.lote,
            validade=self.validade_lote,
            defaults={"quantidade_atual": 0}
        )
        estoque.quantidade_atual += self.quantidade
        estoque.save()

#TB Registro de Saídas ===================================================================================
class tb_rm(models.Model):
    rm = models.CharField(max_length=10, unique=True, editable=False)  # Nº gerado automático
    data_solic = models.DateTimeField(default=timezone.now, editable=False)
    solicitante = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="solicitacoes"
    )

    def save(self, *args, **kwargs):
        if not self.rm:
            ultimo = tb_rm.objects.order_by('-id').first()
            prox_num = 1 if not ultimo else int(ultimo.rm[2:]) + 1
            self.rm = f"{prox_num:04d}"  # Ex: RM0001, RM0002
        super().save(*args, **kwargs)


class tb_soli_materiais(models.Model):
    TIPO_SAIDA_CHOICES = [
        ('Consumo', 'Consumo'),
        ('Perda', 'Perda'),
        ('Avariado', 'Avariado'),
        ('Outro', 'Outro'),
    ]
    
    pedido = models.ForeignKey(tb_rm, on_delete=models.CASCADE, related_name="itens")
    material = models.ForeignKey(tb_itens, on_delete=models.CASCADE)
    quant_solicitada = models.PositiveIntegerField()
    quant_liberada = models.PositiveIntegerField(null=True, blank=True)
    tip_saida = models.CharField(max_length=10, choices=TIPO_SAIDA_CHOICES)

class tb_autorizacoes_saida(models.Model):
    STATUS_CHOICES = [
        ('Pendente', 'Pendente'),
        ('Autorizado', 'Autorizado'),
        ('Negado', 'Negado'),
    ]
    
    Nrm = models.ForeignKey(tb_rm, on_delete=models.CASCADE, related_name="autorizacoes")
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='Pendente')
    autorizador = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="autorizacoes_saida"
    )
    data_autor = models.DateTimeField(null=True, blank=True)

#TB Consulta do Estoque ===================================================================================
class tb_estoque(models.Model):
    material = models.ForeignKey(tb_itens, on_delete=models.CASCADE, related_name="estoque")
    marca = models.ForeignKey(tb_marcas, on_delete=models.CASCADE, related_name="marca")
    lote = models.CharField(max_length=10, null=True, blank=True)
    validade = models.DateField(null=True, blank=True)
    quantidade_atual = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.material} | Lote: {self.lote or '-'} | Val: {self.validade or '-'}"
    