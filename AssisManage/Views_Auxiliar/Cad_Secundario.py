from AssisManage.models import tb_assis, tb_senhas_assis

def gerar_senhas_do_lote(lote, assistidos_queryset, inicio=1):
    """
    Gera as senhas válidas para um lote já cadastrado.
    Sequência de senhas reinicia para cada tipo de assistência do lote.
    Apenas assistidos com o vínculo definido no lote recebem senha.
    """
    sequencia = inicio  # começa da sequência passada pela view

    for assistido in assistidos_queryset:
        tb_senhas_assis.objects.create(
            lote_origem=lote,
            assistido=assistido,
            senha=sequencia,
            data_entrega=lote.data_evento,
            data_entrega_confi=None,
            entregador=None
        )
        sequencia += 1