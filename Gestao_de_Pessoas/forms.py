from django import forms
from django.core.exceptions import ValidationError


from AssisManage.models import tb_assis, tb_tip_assistencias

class CadAssisForm(forms.ModelForm):
    tip_assistencia = forms.ModelMultipleChoiceField(
        queryset=tb_tip_assistencias.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        label="Tipos de Assistência",
        required=False
    )
    class Meta:
        model = tb_assis
        fields = ["name", "telefone", "seg_telefone", "cpf", "data_nasci",
                  "nome_mae", "cep", "cidade", "bairro", "logradouro",
                  "numero","vinculo", "tip_assistencia", "observacao"]
        
    def clean_cpf(self):
        cpf = self.cleaned_data.get("cpf")
        if tb_assis.objects.filter(cpf=cpf).exists():
            raise ValidationError("CPF já cadastrado!")
        return cpf