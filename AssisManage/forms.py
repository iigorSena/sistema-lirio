from django import forms
from django.db.models import Max
from django.forms import TextInput
from datetime import date
from django.core.exceptions import ValidationError


from .models import tb_assis, tb_assis_hist, tb_tip_assistencias, tb_lote_senhas, tb_senhas_assis




#==================================================================================================================
class CadAssisMassa(forms.Form):
    arquivo_csv = forms.FileField(label="Arquivo CSV")

#===================================================================================================================
class FichaAssistidoForm(forms.ModelForm):
    tip_assistencia = forms.ModelMultipleChoiceField(
        queryset=tb_tip_assistencias.objects.all(),
        widget=forms.CheckboxSelectMultiple(attrs={'disabled': True}),
        label="Tipos de Assistência"
    )
        
    class Meta:
        model = tb_assis
        fields = ["name", "telefone", "seg_telefone", "cpf", "data_nasci", "nome_mae",
                  "cep", "cidade", "bairro", "logradouro", "numero",
                  "tip_assistencia", "vinculo", "observacao"]

# Gerador de Senhas ===================================================================================================================
class LoteSenhasForm(forms.ModelForm):
    class Meta:
        model = tb_lote_senhas
        fields = ["nome_lote", "tipo_assistencia", "vinculo",
                  "data_evento", "mensagem", ]
        
class LoteDetalhadoForm(forms.ModelForm):
    class Meta:
        model = tb_lote_senhas
        fields = ["nome_lote", "status"]

class AddSenhaForm(forms.ModelForm):
    assistido = forms.ModelChoiceField(
        queryset=tb_assis.objects.all(),
        widget=forms.Select(attrs={'class': 'form-control'}),
        label="Assistido"
    )
    class Meta:
        model = tb_senhas_assis
        fields = ['assistido']

#===================================================================================================================
class EntragaCestasForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(EntragaCestasForm, self).__init__(*args, **kwargs)
        self.fields['data'].initial = date.today()

    class Meta:
        model = tb_assis_hist
        fields = ['id_assistido', 'tip_assistencia', 'local', 'data']
        widgets = {
            'data': forms.DateInput(
                attrs={'type': 'date'},
                format='%Y-%m-%d'  # <-- ESSENCIAL para pré-preencher corretamente
            ),
        }