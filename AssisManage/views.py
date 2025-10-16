import csv
import io
from datetime import date
from django.utils import timezone
from django.utils.timezone import now
from django.db.models import Q, CharField
from django.contrib import messages
from django.views import View
from django.urls import reverse_lazy
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render, get_object_or_404
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.db.models.functions import Cast
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin

#forms
from .forms import (CadAssisMassa, FichaAssistidoForm, LoteSenhasForm, LoteDetalhadoForm, AddSenhaForm, 
                    EntragaCestasForm)
# models
from .models import tb_assis, tb_assis_hist, tb_lote_senhas, tb_senhas_assis, tb_vinculos, tb_tip_assistencias
# Auxiliares
from .Views_Auxiliar.canvas import gerar_cartoes
from .Views_Auxiliar.Cad_Secundario import gerar_senhas_do_lote
       
# Listar Visitantes =========================================================================================================
class ListarVisitantesView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_assis
    template_name = "AssisManage/Listar_Visitantes.html"

    def get(self, request, *args, **kwargs): 
        busca = request.GET.get('busca', '')              # Texto digitado
        criterio = request.GET.get('criterio', 'tudo')    # Critério (select)
        filtro = request.GET.get('filtro', 'data')        # Radio (data ou az)

        assistidos = tb_assis.objects.filter(vinculo__vinculo="Visitante")

        # 🔹 Aplica busca conforme critério
        if criterio == "id":
            if busca.isdigit():  # garante que é número
                assistidos = assistidos.filter(id=int(busca))
            else:
                assistidos = assistidos.none()
        elif criterio == "name":
            assistidos = assistidos.filter(name__icontains=busca)
        elif criterio == "cpf":
            assistidos = assistidos.filter(cpf__icontains=busca)
        else:  # tudo
            assistidos = assistidos.annotate(id_str=Cast("id", CharField())).filter(
                Q(id_str__icontains=busca) |
                Q(name__icontains=busca) |
                Q(cpf__icontains=busca)
            )
        # 🔹 Ordenação por filtro
        if filtro == "az":
            assistidos = assistidos.order_by("name")
        else:  # "data" ou default
            assistidos = assistidos.order_by("id")

        # Conta registros depois do filtro
        total_registros = assistidos.count()

        # Paginação
        paginator = Paginator(assistidos, 30)  # registros por página
        page_number = request.GET.get('page')
        try:
            assistidos = paginator.page(page_number)
        except PageNotAnInteger:
            assistidos = paginator.page(1)
        except EmptyPage:
            assistidos = paginator.page(paginator.num_pages)

        context = {
            'total_registros': total_registros,  # já filtrado
            'busca': busca,
            'criterio': criterio,
            'filtro': filtro,
            'assistido': assistidos
        }
        return render(request, self.template_name, context)


        
# Cadasatro em Massa ============================================================================
class CadAssisMassaView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = 'AssisManage/CadMassa_Assistido.html'

    def get(self, request):
        form = CadAssisMassa()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = CadAssisMassa(request.POST, request.FILES)
        if form.is_valid():
            try:
                arquivo = request.FILES['arquivo_csv']
                # Decodifica removendo BOM (\ufeff) e prepara o buffer
                decoded_file = arquivo.read().decode('utf-8-sig')
                csv_file = io.StringIO(decoded_file)
                reader = csv.DictReader(csv_file, delimiter=';')  # Define delimitador ;

                try:
                    tip_assistencia_padrao = tb_tip_assistencias.objects.get(id=2)
                except tb_tip_assistencias.DoesNotExist:
                    messages.error(request, "Tipo de assistência padrão (id=2) não encontrado.")
                    return redirect('CadAssisMassa')

                erros = 0
                for linha in reader:
                    cpf = linha.get('cpf')
                    if not cpf:
                        print(f"[ERRO] CPF ausente na linha: {linha}")
                        erros += 1
                        continue

                    try:
                        obj, _ = tb_assis.objects.update_or_create(
                            cpf=cpf,
                            defaults={
                                'name': linha.get('name'),
                                'telefone': linha.get('telefone'),
                                'seg_telefone': linha.get('telefone'),
                                'data_nasci': linha.get('data_nasci') or None,
                                'nome_mae': linha.get('nome_mae'),
                                'cep': linha.get('cep'),
                                'cidade': linha.get('cidade'),
                                'bairro': linha.get('bairro'),
                                'logradouro': linha.get('logradouro'),
                                'numero': linha.get('numero'),
                                'observacao': linha.get('observacao'),
                                'data_cadastro': linha.get('data_cadastro') or None,
                            }
                        )
                        obj.tip_assistencia.set([tip_assistencia_padrao])
                    except Exception as e:
                        print(f"[ERRO] CPF {cpf}: {e}")
                        erros += 1

                if erros == 0:
                    messages.success(request, "Importação concluída com sucesso!")
                else:
                    messages.warning(request, f"Importação concluída com {erros} erro(s). Verifique o console para detalhes.")

                return redirect('CadAssisMassa')

            except Exception as e:
                messages.error(request, f"Ocorreu um erro ao processar o arquivo: {str(e)}")
                return redirect('CadAssisMassa')

        messages.error(request, "Formulário inválido. Verifique os campos.")
        return render(request, self.template_name, {'form': form})


# Ficha do Assistido ===================================================================
class FichaAssistidoView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = "AssisManage/Ficha_Visitante.html"
    form_class = FichaAssistidoForm

    def get(self, request, *args, **kwargs):
        pk = self.kwargs.get("pk")
        assistido = get_object_or_404(tb_assis, pk=pk)
        historico_assistencias = tb_assis_hist.objects.filter(id_assistido=pk).order_by('-data')
        historico_senhas = tb_senhas_assis.objects.filter(assistido_id=pk)

        # Encontrar o PK anterior e próximo
        try:
            pk_anterior = tb_assis.objects.filter(pk__lt=pk).order_by('-pk').first()
            pk_anterior = pk_anterior.pk if pk_anterior else None
        except:
            pk_anterior = None

        try:
            pk_proxima = tb_assis.objects.filter(pk__gt=pk).order_by('pk').first()
            pk_proxima = pk_proxima.pk if pk_proxima else None
        except:
            pk_proxima = None
            
        vinculos = tb_vinculos.objects.filter(status='Ativo')

        context = {
            "Fassistido": assistido,
            "form": self.form_class(instance=assistido),
            "Hassistido": historico_assistencias,
            "Hsenhas": historico_senhas,
            "pk_anterior": pk_anterior,
            "pk_proxima": pk_proxima,
            "vinculos": vinculos,
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        pk = self.kwargs.get("pk")
        assistido = get_object_or_404(tb_assis, pk=pk)
        form = self.form_class(request.POST, instance=assistido)

        if form.is_valid():
            assistido = form.save(commit=False) 

            if "tip_assistencia" in form.cleaned_data:
                assistido.tip_assistencia.set(form.cleaned_data["tip_assistencia"])
            assistido.ultima_alteracao = request.user
            assistido.save()
            
            return JsonResponse({
                "success": True,
                "message": "Ficha salva com sucesso!",
                "id": assistido.pk
            })
        errors = {field: [str(e) for e in errs] for field, errs in form.errors.items()}
        return JsonResponse({
            "success": False,
            "message": "Erro ao salvar a ficha: ",
            "errors": errors
        })

#Gerador de Lotes e Senhas ================================================================================
class GeradorSenhasView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = 'AssisManage/Gerador_Senhas.html'

    def get(self, request):
        tipos_assistencia = tb_tip_assistencias.objects.all()
        vinculos= tb_vinculos.objects.filter(status="Ativo")
        form = LoteSenhasForm()
        lotes = tb_lote_senhas.objects.all().order_by('-id')

        context = {
            'loteform': form,
            'tipos_assistencia': tipos_assistencia,
            'vinculos' : vinculos,
            'lotes': lotes,
            'today': now().date()
        }
        return render(request, self.template_name, context)

    def post(self, request):
        action = request.POST.get("action")

        if action == "verificar":
            tip_assistencia = int(request.POST.get("tip_assistencia"))
            vinculo = int(request.POST.get("vinculo"))

            resultados = (tb_assis.objects.filter(tip_assistencia=tip_assistencia, vinculo=vinculo).order_by("name").values("id", "name", "cpf"))
            
            # adiciona ordem sequencial (1º, 2º, 3º...)
            dados = []
            for idx, r in enumerate(resultados, start=1):
                dados.append({
                    "ordem": f"{idx}º",
                    "id": r["id"],   # mantemos id real p/ remover/gerar senhas
                    "nome": r["name"],
                    "cpf": r["cpf"],
                })

            return JsonResponse({
                "quantidade": len(dados),
                "dados": dados
            })
            
        elif action == "gerar":
            form = LoteSenhasForm(request.POST)
            if form.is_valid():
                lote = form.save(commit=False)
                lote.ultima_alteracao = request.user
                
                # Pega lista de IDs enviada pelo front
                ids_assistidos = request.POST.getlist("ids[]")  # precisa do [] no name ao enviar no ajax
                print(f'O intervalo recebido é: ', ids_assistidos)
                selecionados = tb_assis.objects.filter(id__in=ids_assistidos).order_by("name")
                lote.senhas_validas = selecionados.count()

                ultima_senha = tb_senhas_assis.objects.filter(
                    lote_origem__tipo_assistencia_id=lote.tipo_assistencia_id
                ).order_by('-senha').first()
                
                # Se não houver senhas ainda, começa do 1
                proxima_senha = ultima_senha.senha + 1 if ultima_senha else 1
                lote.proxima_senha = proxima_senha  # opcional, se quiser salvar no lote
               
                lote.save()
                gerar_senhas_do_lote(lote, selecionados, proxima_senha)
                
                return JsonResponse({"success": True})
            else:
                erros = form.errors.as_json()
                return JsonResponse({"success": False, "message": erros})
    
        # Retorno padrão caso action seja inválida ou ausente
        return JsonResponse({"success": False, "message": "Ação inválida ou não informada."})
    

# Lote Detalhado ===========================================================================================
class LoteDetalhado(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = "AssisManage/Lote_Detalhado.html"
    
    def get(self, request, lote_id, *args, **kwargs):
        lote = get_object_or_404(tb_lote_senhas, id=lote_id)
        senhas_lote = tb_senhas_assis.objects.filter(lote_origem=lote)
        form = LoteDetalhadoForm(instance=lote)
        add_senha_form = AddSenhaForm()
        
        context = {
            'lote' : lote,
            'senhas_lote' : senhas_lote,
            'form' : form,
            'add_senha_form': add_senha_form,
        }
        return render(request, self.template_name, context)
    
    @method_decorator(csrf_exempt)
    def post(self, request, lote_id, *args, **kwargs):
        lote = get_object_or_404(tb_lote_senhas, id=lote_id)
        senha_id = request.POST.get("senha_id")

        # Caso seja exclusão de senha
        if senha_id:
            try:
                senha = tb_senhas_assis.objects.get(id=senha_id, lote_origem_id=lote_id)
                senha.delete()
                return JsonResponse({"success": True, "id": senha_id})
            except tb_senhas_assis.DoesNotExist:
                return JsonResponse({"success": False, "error": "Senha não encontrada"}, status=404)
            
        # Adicionar nova senha
        if request.POST.get("action") == "add_senha":
            form = AddSenhaForm(request.POST)
            if form.is_valid():
                nova_senha = form.save(commit=False)
                nova_senha.lote_origem = lote
                nova_senha.data_entrega = lote.senhas.first().data_entrega if lote.senhas.exists() else None
                nova_senha.status = "Emitida"
                # A senha numérica será gerada automaticamente com base no último registro
                ultima_senha = tb_senhas_assis.objects.filter(lote_origem=lote).order_by("-senha").first()
                nova_senha.senha = (ultima_senha.senha + 1) if ultima_senha else 1
                nova_senha.save()
                return JsonResponse({
                    "success": True,
                    "id": nova_senha.id,
                    "assistido": str(nova_senha.assistido),
                    "senha": nova_senha.senha
                })
            else:
                return JsonResponse({"success": False, "errors": form.errors}, status=400)

        # Caso seja edição do lote (nome ou status)
        lote = get_object_or_404(tb_lote_senhas, id=lote_id)
        form = LoteDetalhadoForm(request.POST, instance=lote)

        if form.is_valid():
            form.save()
            return JsonResponse({
                "success": True,
                "message": "Lote atualizado com sucesso",
                "nome_lote": form.instance.nome_lote,
                "status": form.instance.status,
            })
        else:
            return JsonResponse({
                "success": False,
                "error": form.errors.as_json()
            }, status=400)
    
    
    
# Gestão de Documentos ======================================================================================
class GestaoDocumentosView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = "AssisManage/Gestao_Cartoes.html"

    def get(self, request, *args, **kwargs):
        lote_id = kwargs.get("lote_id")
  
        if lote_id:
            return self.gerar_cartoes(request, lote_id)
        else:
            lotes = tb_lote_senhas.objects.filter(status='Ativo').order_by('-id')
            return render(request, self.template_name, {"lotes": lotes})
    
    def gerar_cartoes(self, request, lote_id):
        lote = get_object_or_404(tb_lote_senhas, id=lote_id)
        return gerar_cartoes(lote)


# Entrega de Cestas ==========================================================================
class EntregaCestasView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
     
    def get(self, request):
        form = EntragaCestasForm(initial={
            'tip_assistencia': 2,
            'local': 1,
            'data': date.today(),
            })
        return render(request, 'AssisManage/Entregar_Cestas.html', {'FormCadHist': form})

    def post(self, request):
        id_assistido = request.POST.get('id_assistido')
        form = EntragaCestasForm(request.POST)
        
        if form.is_valid() and id_assistido:
            hist = form.save(commit=False)
            hist.id_assistido = id_assistido
            hist.save()
            return JsonResponse({'status': 'ok'})
    
        return JsonResponse({'status': 'erro'})
    
class BuscarAssistidoPorCPF(View):
    def get(self, request):
        cpf = request.GET.get('cpf')
        try:
            assistido = tb_assis.objects.get(cpf=cpf)
            data = {
                'id' : assistido.id,
                'nome': assistido.name,
                'data_nasci': assistido.data_nasci.strftime('%d/%m/%Y') if assistido.data_nasci else '',
                'nome_mae': assistido.nome_mae,
                'status': 'ok',
            }
        except tb_assis.DoesNotExist:
            data = {'status': 'nao_encontrado'}

        return JsonResponse(data)