from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType
from .models import Modulos

def criar_modulos_padrao(sender, **kwargs):
    modulos = ["Assistencial", "Suprimentos", "ATF"]
    for nome in modulos:
        Modulos.objects.get_or_create(nome=nome)

def criar_grupos_e_permissoes(sender, **kwargs):
    """
    Cria automaticamente permissões e grupos por módulo.
    Para adicionar novos módulos, basta incluir na estrutura `modulos`.
    """
    modulos = {
        "Suprimentos": {
            "permissoes": [
                ("acesso_suprimentos", "Parâmetro obrigatório supri"),
                ("solicitar_materiais", "Pode solicitar materiais"),
                ("consultar_estoque", "Pode consultar estoque"),
                ("listar_itens_almoxarifado", "Pode listar ítens do almoxarifado"),
                ("cadastrar_itens_almoxarifado", "Pode cadastrar ítens no almoxarifado"),
                ("editar_itens_almoxarifado", "Pode editar ítens do almoxarifado"),
                ("registrar_entrada", "Pode registrar nova entrada"),
                ("registrar_saida", "Pode registrar nova saída"),
                ("ver_historico_movimentacao", "Pode ver histórico de movimentação"),
                ("ver_relatorios_indicadores", "Pode ver relatórios e indicadores"),
                ("ver_cadastros_gerencia_estoque", "Pode ver e cadastrar marcas, fornecedores e categorias"),
            ],
            "grupos": {
                "Adm de Estoque": "all",
                "Autorizador de Estoque": [
                    "acesso_suprimentos", "solicitar_materiais", "consultar_estoque",
                    "listar_itens_almoxarifado", "registrar_entrada", "registrar_saida"
                ],
                "Gerente do Esotoque": [
                    "acesso_suprimentos", "solicitar_materiais", "consultar_estoque",
                    "listar_itens_almoxarifado", "registrar_entrada", "registrar_saida", "ver_cadastros_gerencia_estoque"
                ],
                "Requisitante M": [
                    "acesso_suprimentos", "solicitar_materiais", "consultar_estoque"
                ]
            }
        },

        "Assistencial": {
            "permissoes": [
                ("acesso_assistencia", "Parâmetro obrigatório assis"),
                ("cadastrar_assistido", "Cadastrar novo assistido"),
                ("visualizar_visitantes", "Visualizar visitantes"),
                ("editar_visitantes", "Editar visitantes"),
                ("deletar_visitantes", "Deletar visitantes"),
                ("visualizar_obreiros_mediuns", "Visualizar obreiros e médiuns"),
                ("editar_obreiros_mediuns", "Editar obreiros e médiuns"),
                ("entregar_cesta_basica", "Entregar cesta básica"),
                ("visualizar_senhas_lote", "Visualizar senhas em lote"),
                ("gerar_senhas_lote", "Gerar senhas em lote"),
                ("visualizar_gestao_doc", "Visualizar Gestão de Documentos"),
            ],
            "grupos": {
                "Aux assistencial I": ["visualizar_visitantes", "editar_visitantes"],
                "Aux assistencial II": ["cadastrar_assistido", "visualizar_visitantes", "editar_visitantes"],
                "Aux assistencial III": [
                    "cadastrar_assistido", "visualizar_visitantes", "editar_visitantes",
                    "visualizar_obreiros_mediuns", "editar_obreiros_mediuns"
                ],
                "Entregador de Cesta": ["entregar_cesta_basica"],
                "Gerente Assistencial I": [
                    "cadastrar_assistido", "visualizar_visitantes", "editar_visitantes",
                    "visualizar_obreiros_mediuns", "editar_obreiros_mediuns", "Visualizar Gestão de Documentos"
                ],
                "Adm Assistencial": "all",
            }
        }
    }

    # usamos um content_type "genérico" só para guardar as permissões
    content_type = ContentType.objects.get_for_model(Modulos)

    for nome_modulo, info_modulo in modulos.items():
        # garante que o módulo existe
        modulo, _ = Modulos.objects.get_or_create(nome=nome_modulo)

        # cria permissões do módulo
        permissoes_obj = []
        for codename, nome in info_modulo["permissoes"]:
            perm, _ = Permission.objects.get_or_create(
                codename=codename,
                name=nome,
                content_type=content_type
            )
            permissoes_obj.append(perm)

        # cria grupos do módulo e associa permissões
        for nome_grupo, permissoes_grupo in info_modulo["grupos"].items():
            grupo, _ = Group.objects.get_or_create(name=nome_grupo)

            if permissoes_grupo == "all":
                grupo.permissions.set(permissoes_obj)
            else:
                grupo.permissions.set([p for p in permissoes_obj if p.codename in permissoes_grupo])

            grupo.save()
