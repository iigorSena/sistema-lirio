from django.contrib import messages
from django.views import View
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin

from AssisManage.models import tb_assis
from .forms import CadAssisForm

# Gerenciar Assistidos ============================================================================
class CadAssisView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_assis
    template_name = "Gestao_de_Pessoas/Cadastrar_Assistido.html"

    def get(self, request, *args, **kwargs ):    
        context={
            'form': CadAssisForm(), #Add tag de cadastro
        }
        return render (request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        form = CadAssisForm(request.POST)
        
        if form.is_valid():
            assistido = form.save(commit=False)
            assistido.ultima_alteracao = request.user  
            assistido.save()
            form.save_m2m()
            messages.success(request, "Cadastro realizado com sucesso!")
            
            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse({"success": True, "message": "Cadastro realizado com sucesso!"})
            return redirect("CadAssis")
        
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            # retorna erros de validação em JSON
            return JsonResponse({"success": False, "errors": form.errors}, status=400)

        # Se o formulário não for válido, recarrega a página com os erros
        assistidos = tb_assis.objects.all().values('id', 'name', 'data_nasci', 'cpf')
        context = {
            'total_registros': tb_assis.objects.count(),
            'busca': request.POST.get('busca', ''),
            'form': form,  # Mantém os erros no formulário
            'assistido': assistidos
        }
        return render(request, self.template_name, context)