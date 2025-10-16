import os
import sys
from PIL import Image
from io import BytesIO
from urllib import request
from datetime import datetime, timedelta
from django.contrib import messages
from django.utils import timezone
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views import View
from django.db.models import Sum, F
from django.template.loader import render_to_string
from django.views.generic import TemplateView
from django.core.paginator import Paginator
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.contrib.auth.decorators import user_passes_test

from .models import FacilitadoresList, HistAtendATF, ArquivoATF
from .forms import CadFacilitadoresForm, EdiFacilitadoresForm, GerenHistAtendAtfForm, UploadArquivoForm

#Gerenciamento dos Facilitadores =========================================================================================
class GerenAtfView(LoginRequiredMixin, TemplateView):
    login_url = reverse_lazy('login')
    model = FacilitadoresList
    template_name = 'ATF/gerenciamento_atf.html'
    
    def get(self, request, *args, **kwargs):
        context = {
            'facilitadores_atf': FacilitadoresList.objects.all(), # Form com dados
            'CadFacilitador': CadFacilitadoresForm(),  # Form vazio para cadastro
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        facilitador_id = request.POST.get("facilitador_id")
        
        # Se não há ID, é um novo cadastro
        if not facilitador_id:
            form = CadFacilitadoresForm(request.POST)
            if form.is_valid():
                form.save()
                return JsonResponse({"status": "success", "message": "Facilitador cadastrado com sucesso!"})
            return JsonResponse({"status": "error", "errors": form.errors}, status=400)

        # Se for uma edição
        if request.POST.get("action") == "update":
            facilitador = get_object_or_404(FacilitadoresList, id=facilitador_id)
            form = EdiFacilitadoresForm(request.POST, instance=facilitador)

            if form.is_valid():
                form.save()
                messages.success(request, "Facilitador atualizado com sucesso!")
                return JsonResponse({"status": "success", "message": "Facilitador atualizado com sucesso!"})
            else:
                messages.error(request, "Erro ao atualizar facilitador.")
                return JsonResponse({"status": "error", "errors": form.errors})

        # Se for uma exclusão
        if request.POST.get("action") == "delete":
            return self.delete_facilitador(facilitador_id)

        return JsonResponse({"status": "error", "message": "Ação inválida."}, status=400)

        
    def delete_facilitador(self, facilitador_id):
        try:
            facilitador = get_object_or_404(FacilitadoresList, id=facilitador_id)
            facilitador.delete()
            return JsonResponse({"status": "deleted"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
        
# Histórico ====================================================================================
class HistAtfView(LoginRequiredMixin, TemplateView):
    login_url = reverse_lazy('login')
    model = HistAtendATF
    template_name = 'ATF/Hist_atf.html'
    form_class = GerenHistAtendAtfForm
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

         # Paginação
        historicos = self.model.objects.all().order_by('-data')
        paginator = Paginator(historicos, 20)  # 10 registros por página
        page_number = self.request.GET.get('page')  # número da página pela query string
        page_obj = paginator.get_page(page_number)

        context['page_obj'] = page_obj
        context['historicos_atf'] = page_obj.object_list #Form com valores
        context['CadHistAtf'] = self.form_class()  #Form vazio para cadastro
        return context
    
    def post(self, request, *args, **kwargs):
        historico_id = request.POST.get("historico_id")
        action = request.POST.get("action")  # Obtém a ação enviada no POST

        # Se não há ID, é um novo cadastro
        if not historico_id:
            form = self.form_class(request.POST)
            if form.is_valid():
                form.save()
                return JsonResponse({"status": "success", "message": "Atendimento cadastrado com sucesso!"})
            return JsonResponse({"status": "error", "errors": form.errors}, status=400)

        # Se for uma edição
        if action == "update" and historico_id:
            historico = get_object_or_404(self.model, id=historico_id)
            form = self.form_class(request.POST, instance=historico)

            if form.is_valid():
                form.save()
                return JsonResponse({"status": "success", "message": "Atendimento atualizado com sucesso!"})
            else:
                return JsonResponse({"status": "error", "errors": form.errors})

        # Se for uma exclusão
        if request.POST.get("action") == "delete":
            return self.delete_historico(historico_id)

        return JsonResponse({"status": "error", "message": "Ação inválida."}, status=400)

    
    def delete_historico(self, historico_id):
        try:
            historico = self.model.objects.get(id=historico_id)
            historico.delete()
            return JsonResponse({'status': 'success', 'message': 'Registro excluído com sucesso'})
        except self.model.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Registro não encontrado'})
        
# Arquivo ======================================================================
class ArquivoViews(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = 'ATF/Arquivo_atf.html'

    def get(self, request):
        formview = UploadArquivoForm()
        busca_nome = request.GET.get('busca_prt', '').strip()
        ano = request.GET.get('ano', '')
        todos_anos = request.GET.get('todos_anos') == '1'

        arquivos = ArquivoATF.objects.none()  # queryset vazio por padrão

        # Executa a busca só se algum critério for passado
        if busca_nome or ano or todos_anos:
            arquivos = ArquivoATF.objects.all()

            if ano and not todos_anos:
                arquivos = arquivos.filter(ano=ano)

            if busca_nome:
                arquivos = arquivos.filter(nome__icontains=busca_nome)

        return render(request, self.template_name, {
            'formview': formview,
            'arquivos': arquivos,
            'busca': busca_nome
        })
    
    def post(self, request):
        formupload = UploadArquivoForm(request.POST, request.FILES)
        if formupload.is_valid():
            ano = formupload.cleaned_data['ano']
            imagens = request.FILES.getlist('imagem')

            caminho_base = os.path.join(settings.BASE_DIR, 'ATF', 'static', 'ATF', 'img', 'Prontuarios')
            caminho_ano = os.path.join(caminho_base, ano)
            os.makedirs(caminho_ano, exist_ok=True)

            for imagem in imagens:
                nome_arquivo_original = imagem.name
                nome_sem_extensao = os.path.splitext(nome_arquivo_original)[0]
                nome_final = f"{nome_sem_extensao}.webp"

                caminho_final = os.path.join(caminho_ano, nome_final)

                imagem_pillow = Image.open(imagem)
                if imagem_pillow.mode != 'RGB':
                    imagem_pillow = imagem_pillow.convert('RGB')
                imagem_pillow.save(caminho_final, format='WEBP', quality=50, method=6)

                ArquivoATF.objects.create(
                    nome=nome_sem_extensao,
                    ano=int(ano),
                    imagem=f"ATF/img/Prontuarios/{ano}/{nome_final}"
                )

            return redirect('atf-arquivo')

        return render(request, self.template_name, {'formview': formupload})

# Dashboard ========================================================
class DashboardView(LoginRequiredMixin, TemplateView):
    login_url = reverse_lazy('login')
    template_name = 'ATF/dashboard_atf.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # 1. Datas do filtro
        hoje = timezone.now().date()
        primeiro_dia_mes = hoje.replace(day=1)
        data_inicio_str = self.request.GET.get('data_inicio')
        data_fim_str = self.request.GET.get('data_fim')
        facilitadores_disponiveis = FacilitadoresList.objects.all()


        try:
            data_inicio = datetime.strptime(data_inicio_str, '%Y-%m-%d').date() if data_inicio_str else primeiro_dia_mes
        except ValueError:
            data_inicio = primeiro_dia_mes

        try:
            data_fim = datetime.strptime(data_fim_str, '%Y-%m-%d').date() if data_fim_str else hoje
        except ValueError:
            data_fim = hoje
        
        # 2. Filtro aplicado
        historico_filtrado = HistAtendATF.objects.filter(data__range=(data_inicio, data_fim))
        
        facilitador_id = self.request.GET.get('facilitador')
        if facilitador_id:
            historico_filtrado = historico_filtrado.filter(facilitador_id=facilitador_id)

        # 3. Totais
        totais = historico_filtrado.aggregate(
            total_1_vez=Sum('quant_1_vez'),
            total_retorno=Sum('quant_retorno')
        )

        total_1_vez = totais['total_1_vez'] or 0
        total_retorno = totais['total_retorno'] or 0
        total_geral = total_1_vez + total_retorno
        media_atendimentos = (total_1_vez + total_retorno) / 2 if (total_1_vez + total_retorno) > 0 else 0


        # 4. Totais por facilitador (para o gráfico de barras)
        facilitadores_data = (
            historico_filtrado.values('facilitador__facilitador')
            .annotate(
                total_1_vez=Sum('quant_1_vez'),
                total_retorno=Sum('quant_retorno')
            ).order_by('facilitador__facilitador')
        )

        # Separar em listas para o Chart.js
        labels_facilitadores = [f['facilitador__facilitador'] for f in facilitadores_data]
        valores_1_vez = [f['total_1_vez'] or 0 for f in facilitadores_data]
        valores_retorno = [f['total_retorno'] or 0 for f in facilitadores_data]

        context.update({
            'total_geral': total_geral,
            'total_1_vez': total_1_vez,
            'total_retorno': total_retorno,
            'hoje': hoje.isoformat(),
            'data_inicio': data_inicio.isoformat(),
            'data_fim': data_fim.isoformat(),
            'facilitadores_disponiveis': facilitadores_disponiveis,
            'facilitador_selecionado': facilitador_id,
            'labels_facilitadores': labels_facilitadores,
            'valores_1_vez': valores_1_vez,
            'valores_retorno': valores_retorno,
            'media_atendimentos': media_atendimentos,
        })

        return context