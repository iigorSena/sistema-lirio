from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import ListView, UpdateView
from django.forms import modelform_factory, TextInput
from django.shortcuts import render
from django.db.models import Q
from django.db import transaction


from .models import tb_assis, tb_assis_hist, tb_tip_assistencias

class CadAssis(ListView):
    model = tb_assis
    template_name = "AssisManage/CadAssis.html"  # Define o template
    context_object_name = "nome_assistidos"  # Define o nome da variável de contexto no template
    total_registros = tb_assis.objects.count()

    def get_queryset(self):
        busca = self.request.GET.get('busca', '')  # Obtém o valor da busca
        if busca:
            return tb_assis.objects.filter(
                Q(id__icontains=busca) | Q(name__icontains=busca) | Q(cpf__icontains=busca)
            ).values('id', 'name', 'data_nasci', 'cpf')
        return tb_assis.objects.all().values('id', 'name', 'data_nasci', 'cpf')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_registros'] = tb_assis.objects.count()

        # Cria o formulário dinâmico e adiciona ao contexto
        FormCadastro = modelform_factory(
        tb_assis,
        fields=["name", "telefone", "cpf", "data_nasci", "nome_mae", "cep", "cidade", "bairro", "logradouro", "numero"],
        widgets={
            "name": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o nome completo"}),
            "telefone": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "(00) 9 9999-9999"}),
            "cpf": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o CPF"}),
            "data_nasci": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "dd/mm/aaaa"}),
            "nome_mae": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o nome da mãe"}),
            "cep": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o CEP"}),
            "cidade": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite a cidade"}),
            "bairro": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o bairro"}),
            "logradouro": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o logradouro"}),
            "numero": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Número"}),
        }
    )
        context['form'] = FormCadastro()  # Adiciona o formulário vazio
        context['busca'] = self.request.GET.get('busca', '')  # Adiciona o valor de busca no contexto
        return context

    def post(self, request, *args, **kwargs):
        # Lida com o envio do formulário
        FormCadastro = modelform_factory(
        tb_assis,
        fields=["name", "telefone", "cpf", "data_nasci", "nome_mae", "cep", "cidade", "bairro", "logradouro", "numero"],
        widgets={
            "name": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o nome completo"}),
            "telefone": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "(00) 9 9999-9999"}),
            "cpf": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o CPF"}),
            "data_nasci": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "dd/mm/aaaa"}),
            "nome_mae": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o nome da mãe"}),
            "cep": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o CEP"}),
            "cidade": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite a cidade"}),
            "bairro": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o bairro"}),
            "logradouro": TextInput(attrs={"class": "input-form-cadassis", "placeholder": "Digite o logradouro"}),
            "numero": TextInput(attrs={"class": "input-form-cadassis", "style": "width: 15px", "placeholder": "Número"}),
        }
    )
        form = FormCadastro(request.POST)

        if form.is_valid():
            form.save()  # Salva o novo assistido
            return HttpResponseRedirect(reverse_lazy('CadAssis'))

        else:
            # Recarrega a página com os erros do formulário
            context = self.get_context_data(**kwargs)
            context['form'] = form
            return self.render_to_response(context)



class FichaAssistido(UpdateView):
    model = tb_assis
    template_name = "AssisManage/FichaAssistido.html"
    context_object_name = "Fassistido"
    fields = []  # Não define automaticamente campos no formulário

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['all_tipos_assis'] = tb_tip_assistencias.objects.all()
        context['tip_assistencia_values'] = self.object.tip_assistencia.all().values_list('id', flat=True)
        context['editable'] = True  # Adiciona informações de edição ao contexto
        
        return context
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        data = request.POST

        # Atualiza os campos manualmente
        self.object.name = data.get("input-nome")
        self.object.telefone = data.get("telefone")
        self.object.cpf = data.get("cpf")
        self.object.data_nasci = data.get("data_nascimento")
        self.object.nome_mae = data.get("nome_mae")
        self.object.cep = data.get("cep")
        self.object.cidade = data.get("cidade")
        self.object.bairro = data.get("bairro")
        self.object.logradouro = data.get("logradouro")
        self.object.numero = data.get("numero")
        self.object.save()  # Salvar antes de atualizar Many-to-Many

        # Obter IDs dos checkboxes marcados
        tip_assistencia_ids = data.getlist("tip_assistencia")

        # IDs existentes na tabela intermediária
        existing_assistance_ids = self.object.tip_assistencia.all().values_list('id', flat=True)

        # Atualizar Many-to-Many: adicionar novos e remover não selecionados
        to_add = [int(id) for id in tip_assistencia_ids if int(id) not in existing_assistance_ids]
        to_remove = [id for id in existing_assistance_ids if str(id) not in tip_assistencia_ids]

        # Adicionar novas assistências
        for tipo_id in to_add:
            try:
                tipo = tb_tip_assistencias.objects.get(id=tipo_id)
                self.object.tip_assistencia.add(tipo)
            except tb_tip_assistencias.DoesNotExist:
                pass  # Ignorar IDs inválidos

        # Remover assistências desmarcadas
        for tipo_id in to_remove:
            try:
                tipo = tb_tip_assistencias.objects.get(id=tipo_id)
                self.object.tip_assistencia.remove(tipo)
            except tb_tip_assistencias.DoesNotExist:
                pass  # Ignorar IDs inválidos

        return HttpResponseRedirect(self.request.path_info)


class HistAss(ListView):
    model = tb_assis_hist
    template_name = "AssisManage/FichaAssistido.html"  # Define o template
    context_object_name = "Hassistido"  # Define o nome da variável de contexto no template

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Cria o formulário dinâmico e adiciona ao contexto
        FormHistorico = modelform_factory(
        tb_assis_hist,
        fields=["data", "local", "numero", "tip_assistencia",],
        widgets={
            "data": TextInput(attrs={"class": "input-form-cadassis"}),
            "local": TextInput(attrs={"class": "input-form-cadassis"}),
            "numero": TextInput(attrs={"class": "input-form-cadassis"}),
            "tip_assistencia": TextInput(attrs={"class": "input-form-cadassis"}),
        }
    )
        context['form'] = FormHistorico()  # Adiciona o formulário vazio
        context['busca'] = self.request.GET.get('busca', '')  # Adiciona o valor de busca no contexto
        return context