from django import forms

from .models import FacilitadoresList, HistAtendATF, ArquivoATF

class CadFacilitadoresForm(forms.ModelForm):
    class Meta:
        model = FacilitadoresList
        fields = ['facilitador']
        
class EdiFacilitadoresForm(forms.ModelForm):
    class Meta:
        model = FacilitadoresList
        fields = ['facilitador', 'status']


class GerenHistAtendAtfForm(forms.ModelForm):
    facilitador = forms.ModelChoiceField(
        queryset=FacilitadoresList.objects.all(),
        widget=forms.Select(attrs={
            'class': 'form-control', 'id': 'select-nome_facilitador_atf'
        }),
    )
        
    class Meta:
        model = HistAtendATF
        fields = ['facilitador', 'quant_1_vez', 'quant_retorno', 'data']
        widgets = {
            'facilitador': forms.Select(attrs={'class': 'form-control'}),
            'quant_1_vez': forms.NumberInput(attrs={
                'class': 'form-control', 'placeholder': '1', 'id': 'input-1_vez_histatf'}),
            'quant_retorno': forms.NumberInput(attrs={
                'class': 'form-control', 'placeholder': '2', 'id': 'input-retono_histatf'}),
            'data': forms.DateInput(attrs={
                'class': 'form-control', 'placeholder': 'dd/mm/aaaa', 'type': 'date', 'id': 'input-data_histatf'})

        }
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['facilitador'].queryset = FacilitadoresList.objects.filter(status='ativo')

# Upload Arquivos
class UploadArquivoForm(forms.Form):
    ano = forms.ChoiceField(label="Ano")
    imagem = forms.FileField(label="Enviar Arquivos", required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['ano'].choices = [(str(y), str(y)) for y in range(2019, 2026)]