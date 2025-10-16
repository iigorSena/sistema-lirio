import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from AssisManage.models import tb_assis
from AssisManage.models import tb_assis_hist

class Atendimento(View):
    template_name = "Atendimento/atendimento.html"
    model = tb_assis

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        """
        Verifica o número enviado e retorna os dados do atendimento.
        """
        numero = request.POST.get('numero')
        try:
            assistido = self.model.objects.get(id=numero)
            data = {
                "name": assistido.name,
                "cpf": assistido.cpf,
                "data_nasci": assistido.data_nasci.strftime('%d/%m/%Y') if assistido.data_nasci else '',
                "id": assistido.id,
            }
            return JsonResponse(data)
        except self.model.DoesNotExist:
            return JsonResponse({"error": "Registro não encontrado"}, status=404)
        

@csrf_exempt
def salvar_historico(request):
    if request.method == 'POST':
        try:
            # Decodifica o corpo da requisição
            data = json.loads(request.body)
            tip_assistencia = data.get('tip_assistencia')
            local = data.get('local')
            data_atendimento = data.get('data')
            numero = data.get('numero')

            # Valida os dados recebidos
            if not all([tip_assistencia, local, data_atendimento, numero]):
                return JsonResponse({"error": "Dados incompletos fornecidos."}, status=400)

            # Salva os dados na tabela
            tb_assis_hist.objects.create(
                tip_assistencia=tip_assistencia,
                local=local,
                data=data_atendimento,
                numero=numero
            )

            # Retorna sucesso
            return JsonResponse({"message": "Gravação bem-sucedida"}, status=200)

        except Exception as e:
            # Em caso de erro, retorna mensagem
            return JsonResponse({"error": "Erro ao gravar os dados", "details": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)