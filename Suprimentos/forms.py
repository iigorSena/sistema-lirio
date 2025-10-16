from django import forms
from django.contrib.auth import get_user_model
User = get_user_model()


from .models import (
    tb_itens, tb_categorias_itens, tb_fornecedores, tb_marcas, tb_rg_entradas, tb_rm, tb_soli_materiais,
    tb_autorizacoes_saida)

class CadItemForm(forms.ModelForm):
    class Meta:
        model = tb_itens
        fields = ["nome", "descricao", "status", "categoria", "unidade_medida",
                  "estoque_minimo", "estoque_maximo"]

class NovaEntradaSupriForm(forms.ModelForm):
    class Meta:
        model = tb_rg_entradas
        fields = [
            "material", "marca", "fornecedor", "tip_entrada", "quantidade",
            "valor_und", "valor_total", "num_nota", "lote", "validade_lote"
        ]

    material = forms.ModelChoiceField(
        queryset=tb_itens.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select select2'})
    )

    marca = forms.ModelChoiceField(
        queryset=tb_marcas.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select select2'})
    )

    fornecedor = forms.ModelChoiceField(
        queryset=tb_fornecedores.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select select2'})
    )
   
#Lógica do forms de solicitação de materiais
class SolicMateriaisForm(forms.ModelForm):
    requisitante = forms.ModelChoiceField(
        queryset=User.objects.none(),  # vamos definir no view
        widget=forms.Select(attrs={'class': 'form-select select2 select-padrao', 'id': 'select-requisitante'}),
        required=True,
        label='Requisitante'
    )
    item = forms.ModelChoiceField(
        queryset=tb_itens.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select select2 select-padrao', 'id':'select-nova_solic_materiais'})
    )
    class Meta:
        model = tb_soli_materiais
        fields = ['material', 'quant_solicitada']

class AutorizarSolicRMForm(forms.ModelForm):
    class Meta:
        model = tb_autorizacoes_saida
        fields = ['status']
        
class QuantLiberadaItensForm(forms.ModelForm):
    class Meta:
        model = tb_soli_materiais
        fields = ['quant_liberada']

# Forms para Cad da Gerêcia
class CadCategItemForm(forms.ModelForm): # Cadastro das Categorias
    class Meta:
        model = tb_categorias_itens
        fields= ['nome']

class CadMarcaItemForm(forms.ModelForm): # Cadastro das Marcas
    class Meta:
        model = tb_marcas
        fields= ['nome']

class CadFornecedorForm(forms.ModelForm):  # Cadastro dos Fornecedores
    class Meta:
        model = tb_fornecedores
        fields = [
            'nome','cnpj','telefone1','telefone2','email','cep','uf','localidade',
            'bairro','logradouro','numero','observacao',
        ]
