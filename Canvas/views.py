from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Canvas
from django.views import View
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin


from .models import Canvas

class GerenciaCanvasView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = 'Canvas/Gerenciador_Canvas.html'

    def get(self, request):
        canvas = Canvas.objects.all()

        context = {
            'canvas': canvas,
        }
        return render(request, self.template_name, context)


def editor(request, template_id=None):
    template_data = {}
    if template_id:
        # Carrega template existente
        template = get_object_or_404(Canvas, id=template_id)
        template_data = template.dados_json
    # Se não tiver ID, template_data fica vazio → cria novo canvas
    return render(request, 'Canvas/Editor_Canvas.html', {'template_data': template_data})


def save_template(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        template_id = data.get('id')
        nome = data.get('nome')
        dados_json = data.get('dados_json')
        
        if template_id:
            template = Canvas.objects.get(id=template_id)
            template.nome = nome
            template.dados_json = dados_json
            template.save()
        else:
            template = Canvas.objects.create(
                nome=nome,
                dados_json=dados_json,
                usuario=request.user
            )
        return JsonResponse({'success': True, 'id': template.id})
