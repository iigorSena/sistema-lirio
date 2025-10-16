from django.utils import timezone
from urllib import request
from django.db.models import F
from django.utils.timezone import now
from django.db.models import Q
from django.views import View
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect, render
from django.views.generic import TemplateView
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin

User = get_user_model()

#forms
from .forms import (
    CadItemForm, NovaEntradaSupriForm, SolicMateriaisForm, AutorizarSolicRMForm, QuantLiberadaItensForm,
    CadCategItemForm, CadMarcaItemForm, CadFornecedorForm)
#models
from .models import tb_itens, tb_fornecedores, tb_categorias_itens, tb_marcas, tb_estoque, tb_rm, tb_soli_materiais, tb_autorizacoes_saida

#Ver Requisições de materiais ======================================================
class ReqMateriaisView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = 'Suprimentos/Requisicao_Materiais.html'

    def get(self, request, *args, **kwargs):
        busca = self.request.GET.get('busca', '')

        # Busca apenas RMs do usuário logado
        itens = tb_autorizacoes_saida.objects.select_related("Nrm").filter(
            Nrm__solicitante=request.user
        ).order_by('-Nrm__data_solic')

        if busca:
            itens = itens.filter(Nrm__Nrm__icontains=busca)  # busca pelo nº da RM

        context = {
            'busca': busca,
            'RM': itens,  # lista de autorizações + dados da RM
        }
        return render(request, self.template_name, context)

#Listar Suprimentos ================================================================
class ListItensView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_itens
    template_name = 'Suprimentos/Listar_Itens.html'

    def get(self, request, *args, **kwargs ):
        busca = self.request.GET.get('busca', '') #Barra de buscas
        
        if busca:
            itens = tb_itens.objects.filter(
                Q(id__icontains=busca) | Q(nome__icontains=busca)
            )
        else:
            itens = tb_itens.objects.all()
        
        # Paginação
        paginator = Paginator(itens, 30) #=> registros por página
        page_number = self.request.GET.get('page')
        
        try:
            itens = paginator.page(page_number)
        except PageNotAnInteger:
            itens = paginator.page(1)
        except EmptyPage:
            itens = paginator.page(paginator.num_pages)
            
        context = {
            'busca' : busca,
            'total_itens' : tb_itens.objects.count(),
            'itens' : itens 
        }
        return render (request, self.template_name, context)
    
#Cadastrar Novo Ítem ================================================================
class CadItemView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_itens
    template_name = 'Suprimentos/Cadastrar_Item.html'

    def get(self, request, *args, **kwargs ):    
        context={
            'CadItem' : CadItemForm(), 
        }
        return render (request, self.template_name, context)
    
    def post(self, request, *args, **kwargs):
        form =CadItemForm(request.POST)

        if form.is_valid():
            item = form.save(commit=False)
            item.cadastrador = request.user
            item.save()
            
            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse({"success": True, "message": "Ítem casdastrado com sucesso!"})
            
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            # retorna erros de validação em JSON
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
        
        itens_erros = tb_itens.objects.all().values("nome", "descricao", "marca", "categoria", "unidade_medida", "fornecedor", "estoque_minimo", "estoque_maximo")
        context ={
            'form' : form,
            'itens_erros' : itens_erros
        }
        return render (request, self.template_name, context)
    
#Ficha Ítens ============================================================================
class FichaItemView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = "Suprimentos/Ficha_Item.html"
    form_class = CadItemForm

    def get(self , request, *args, **kwargs):
        pk = self.kwargs.get("pk")
        item = get_object_or_404(tb_itens, pk=pk)
        categorias = tb_categorias_itens.objects.all()

        context = {
          "FItem" : item,
          "Categorias" : categorias    
        }
        return render(request, self.template_name, context)
    
    def post(self, request, *args, **kwargs):
        pk = self.kwargs.get("pk")
        item = get_object_or_404(tb_itens, pk=pk)

        form = self.form_class(request.POST, instance=item)
        if form.is_valid():
            item = form.save(commit=False)
            item.ultima_alteracao = request.user
            form.save()
            return JsonResponse({"success": True, "message": "Item atualizado com sucesso!"})
        else:
            # Retornar erros do form em JSON
            errors = {field: error.get_json_data() for field, error in form.errors.items()}
            return JsonResponse({
                "success": False,
                "message": "Erro ao atualizar ítem! ",
                "errors": errors
            })

# Moviemntação de Estoque =============================================================
#Entradas
class NovaEntradaSupriView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = "Suprimentos/Nova_Entrada_Supri.html"
    form_class = NovaEntradaSupriForm
    
    def get(self, request,*args, **kwargs):
        context ={
            'NovaEntrad' : self.form_class(),
            'today': now().date()
        }
        return render(request, self.template_name, context )
    
    def post(self, request, *args, **kwargs):
        form = NovaEntradaSupriForm(request.POST)

        if form.is_valid():
            NovaEnt = form.save(commit=False)
            NovaEnt.cadastrador = request.user
            NovaEnt.save()
            return JsonResponse({"success": True, "message": "Nota cadastrada com sucesso!"})
        else:
            # Retornar erros do form em JSON
            errors = {field: error.get_json_data() for field, error in form.errors.items()}
            return JsonResponse({
                "success": False,
                "message": "Erro ao cadastrar Nota!",
                "errors": errors
            })
#Saídas
class SolicitarMateriaisView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    template_name = "Suprimentos/Solicitar_Materiais.html"
    
    def get(self, request, *args, **kwargs):
        form = SolicMateriaisForm()
        form.fields['requisitante'].queryset = User.objects.all().order_by('first_name')
        context = {'MatForm': form}
        return render(request, self.template_name, context)
    
    def post(self, request, *args, **kwargs):
        try:
            requisitante_id = request.POST.get("requisitante")
            requisitante = User.objects.filter(id=requisitante_id).first()
            if not requisitante:
                return JsonResponse({"success": False, "message": "Usuário requisitante inválido."})

            nova_rm = tb_rm.objects.create(solicitante=requisitante)
            # Recebe arrays de materiais e quantidades
            materiais = request.POST.getlist("materiais[]")
            quantidades = request.POST.getlist("quantidades[]")
            
            for mat_id, quant in zip(materiais, quantidades):
                tb_soli_materiais.objects.create(
                    pedido=nova_rm,
                    material_id=mat_id,
                    quant_solicitada=quant,
                    tip_saida =  'Consumo'
                )
            # Cria a autorização pendente automaticamente
            tb_autorizacoes_saida.objects.create(
                Nrm=nova_rm,
                status="Pendente",
                autorizador=None,
                data_autor=None
                )
            return JsonResponse({"success": True, "message": "Solicitação de materiais criada!"})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({"success": False, "message": f"Erro interno: {str(e)}"})
        

# Autorizar Solicitações =======================================================================================
class AutrizarSolicView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_autorizacoes_saida
    template_name = "Suprimentos/Autorizar_Solicitacoesrm.html"
    
    def get(self, request, *args, **kwargs):
        busca = self.request.GET.get('busca', '').strip()
        itens = tb_autorizacoes_saida.objects.select_related("Nrm")
        
        if busca:
            itens = tb_autorizacoes_saida.objects.filter(
                Q(Nrm__rm__icontains=busca)
            )
        else:
            itens = tb_autorizacoes_saida.objects.all().order_by('-Nrm__rm')

        context = {
            'total': tb_autorizacoes_saida.objects.count(),
            'autorizacoes': itens,
            'busca': busca,
        }
        return render(request, self.template_name, context)
    
# Autorizar ficha da RM
class AutorizarFichaSolicView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_autorizacoes_saida
    template_name = "Suprimentos/Ficha_Solicitacao_rm.html"
    
    def get(self, request, *args, **kwargs):
        pk = self.kwargs.get("pk")
        ficharm = get_object_or_404(tb_autorizacoes_saida, pk=pk)
        itensrm = ficharm.Nrm.itens.select_related("material").all() # Pega todos os itens vinculados à RM dessa autorização
        context = {
            'Drm' : ficharm,
            'itensrm' : itensrm
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        pk = self.kwargs.get("pk")
        ficharm = get_object_or_404(tb_autorizacoes_saida, pk=pk)
        itensrm = ficharm.Nrm.itens.all()

        status_selecionado = request.POST.get("status_rm") #Pega o valor selecionado no select

        if status_selecionado not in ["Autorizado", "Negado"]: #Verificação antes de prosseguir
            return JsonResponse({
                "success": False,
                "message": "Selecione Autorizar ou Negar antes de confirmar!"
            })

        # Atualiza status, autorizador e data da autorização
        ficharm.status = status_selecionado
        ficharm.autorizador = request.user
        ficharm.data_autor = timezone.now()  # sempre registra a data
        ficharm.save()

        # Atualiza quantidade liberada apenas se for autorizado
        if status_selecionado == "Autorizado":
            from .models import tb_estoque

            for item in itensrm:
                campo = f"quant_liberada_{item.id}"
                valor = request.POST.get(campo)
                if valor is not None and valor.isdigit():
                    quant_liberada = int(valor)
                    item.quant_liberada = quant_liberada
                    item.save()

                    # Buscar estoques ordenados por validade (asc), depois por ID (asc)
                    estoques = (
                        tb_estoque.objects
                        .filter(material=item.material)
                        .order_by("validade", "id")
                    )

                    if not estoques.exists():
                        return JsonResponse({
                            "success": False,
                            "message": f"Material {item.material} não possui estoque cadastrado."
                        })

                    qtd_restante = quant_liberada

                    for estoque in estoques:
                        if qtd_restante <= 0:
                            break

                        if estoque.quantidade_atual >= qtd_restante:
                            # dá baixa parcial ou total no mesmo lote
                            estoque.quantidade_atual -= qtd_restante
                            estoque.save()
                            qtd_restante = 0
                        else:
                            # consome tudo desse lote e continua no próximo
                            qtd_restante -= estoque.quantidade_atual
                            estoque.quantidade_atual = 0
                            estoque.save()

                    if qtd_restante > 0:
                        return JsonResponse({
                            "success": False,
                            "message": f"Estoque insuficiente para {item.material}. "
                                    f"Faltaram {qtd_restante} unidades."
                        })

        return JsonResponse({
            "success": True,
            "message": f"RM {status_selecionado.lower()} com sucesso!"
        })

    
# Consulta ao Estoque =============================================================
class ConsultarEstoqueView(LoginRequiredMixin, TemplateView):
    login_url = reverse_lazy('login')
    template_name = "Suprimentos/Consultar_Estoque.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Busca todos os registros de estoque
        estoque = tb_estoque.objects.select_related("material").all()

        context["estoque"] = estoque
        return context
    
# Gerenciar Categorias Ítens =============================================================
class CadCategItensView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_categorias_itens
    template_name = "Suprimentos/Cad_Categorias_Itens.html"

    def get(self, request, *args, **kwargs):
        categorias = tb_categorias_itens.objects.all()

        context = {
            'categorias': categorias,
        }
        return render(request, self.template_name, context)
    
    def post(self, request, *args, **kwargs):
        form = CadCategItemForm(request.POST)
        if form.is_valid():
            categoria = form.save()
            return JsonResponse({
                "success": True,
                "id": categoria.id,
                "nome": categoria.nome,
                "status": categoria.status
            })
        else:
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
        
# Gerenciar Marcas =============================================================
class CadMarcasItensView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_marcas
    template_name = "Suprimentos/Cad_Marcas_Itens.html"

    def get(self, request, *args, **kwargs):
        marcas = tb_marcas.objects.all()

        context = {
            'marcas': marcas,
        }
        return render(request, self.template_name, context)
    
    def post(self, request, *args, **kwargs):
        form = CadMarcaItemForm(request.POST)
        if form.is_valid():
            marca = form.save()
            return JsonResponse({
                "success": True,
                "id": marca.id,
                "nome": marca.nome,
                "status": marca.status
            })
        else:
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
        
# Gerenciar Forncedores =============================================================
class CadFornecedoresItensView(LoginRequiredMixin, View):
    login_url = reverse_lazy('login')
    model = tb_fornecedores
    template_name = "Suprimentos/Cad_Fornecedores.html"

    def get(self, request, *args, **kwargs):
        fornecedores = tb_fornecedores.objects.all()

        context = {
            'fornecedores': fornecedores,
        }
        return render(request, self.template_name, context)
    
    def post(self, request, *args, **kwargs):
        form =CadFornecedorForm(request.POST)

        if form.is_valid():
            fornecedor = form.save(commit=False)
            fornecedor.save()
            
            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse({"success": True, "message": "Fornecedor casdastrado com sucesso!"})
            
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            # retorna erros de validação em JSON
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
        
        itens_erros = tb_itens.objects.all().values( 'nome','cnpj','telefone1','telefone2','email','cep','uf','localidade',
                                                    'bairro','logradouro','numero','observacao', )
        context ={
            'form' : form,
            'itens_erros' : itens_erros
        }
        return render (request, self.template_name, context)
    