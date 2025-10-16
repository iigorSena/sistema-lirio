import os
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.platypus import Image
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.pagesizes import A4, landscape
from django.http import HttpResponse
from django.shortcuts import redirect, render, get_object_or_404

from AssisManage.models import tb_lote_senhas, tb_senhas_assis


# Gerar cartão de Natal ====================================================================================
def gerar_cartoes(lote):
        senhas_lote = tb_senhas_assis.objects.filter(lote_origem=lote).order_by("id")
        imagem_path = os.path.join(settings.BASE_DIR, 'media', 'Icones', 'ave-maria.png')

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="{lote.nome_lote}.pdf"'

        # Configuração do PDF na vertical (retrato)
        c = canvas.Canvas(response, pagesize=A4)
        c.setTitle(f"Cartões do Lote {lote.nome_lote}")
        largura, altura = A4  # altura > largura

        # Tamanho do cartão
        card_width = 9.1 * cm
        card_height = 5.12 * cm

        # Margens e espaçamento (reduzidos para aproximar mais os cartões)
        sangria = 0.9 * cm        # margem externa menor
        espacamento = 0.2 * cm    # distância entre cartões reduzida

        # Cálculo de quantas colunas e linhas cabem na página
        colunas = int((largura - 2 * sangria + espacamento) // (card_width + espacamento))
        linhas = int((altura - 2 * sangria + espacamento) // (card_height + espacamento))
        max_por_pagina = colunas * linhas

        # Posição inicial (canto superior esquerdo da área útil)
        x_inicial = sangria
        y_inicial = altura - sangria - card_height
        total_cartoes = lote.senhas_validas


        # Estilo para o parágrafo da mensagem
        estilo_mensagem = ParagraphStyle(
            name="Mensagem",
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12, # Espaçamento entre linhas
            leftIndent=0,
            rightIndent=0,
            textColor=HexColor("#00FFF2")  
        )
        # Estilo para o nome do assistido
        estilo_nome = ParagraphStyle(
            name="NomeAssistido",
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            leftIndent=0,
            rightIndent=0,
        )

        for i, senha_obj in enumerate(senhas_lote): #Configuração dos elementos dentro do cartão
            coluna = i % colunas
            linha = (i // colunas) % linhas
            x = x_inicial + coluna * (card_width + espacamento)
            y = y_inicial - linha * (card_height + espacamento)

            # Borda preta do cartão
            c.rect(x, y, card_width, card_height)

            # Retângulo na borda direita do cartão
            ret_width = 2.2 * cm
            c.setFillColor(HexColor("#00FFF2"))
            c.rect(x + card_width - ret_width, y, ret_width, card_height, fill=1, stroke=0)
            
            # --- Título dentro do cartão ---
            titulo = "Centro Espírita Jardim da Alma"
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(HexColor("#00FFF2"))
            titulo_width = c.stringWidth(titulo, "Helvetica-Bold", 10)
            titulo_x = x + (card_width - titulo_width) / 3
            titulo_y = y + card_height - 0.5*cm  # ligeiramente abaixo da borda superior
            c.drawString(titulo_x, titulo_y, titulo)

            # Círculo com ID do assistido
            if senha_obj.assistido:
                raio = 0.4 * cm  # tamanho da bolinha
                cx = x + 0.6 * cm  # posição x do centro do círculo
                cy = y + card_height - 0.80 * cm  # posição y do centro do círculo

                # Círculo branco com contorno preto
                c.setFillColor(HexColor("#ffffff"))
                c.setStrokeColor(HexColor("#00FFF2"))
                c.circle(cx, cy, raio, fill=1, stroke=1)

                # ID centralizado dentro do círculo
                c.setFillColor(HexColor("#000000"))
                c.setFont("Helvetica-Bold", 9)
                c.drawCentredString(cx, cy - 2, str(senha_obj.assistido.id))  # "-2" para ajustar verticalmente


            # Mensagem no canto superior esquerdo (40-50% do cartão)
            if lote.mensagem:
                largura_mensagem = card_width * 0.43  # largura da mensagem
                p = Paragraph(lote.mensagem, estilo_mensagem)
                p.wrapOn(c, largura_mensagem, card_height)
                p.drawOn(c, x + 0.3*cm, y + card_height - 3.5*cm)
                
            # Imagem abaixo da mensagem, antes do retângulo azul
            if os.path.exists(imagem_path):
                img = Image(imagem_path)
                img_height = 2.6 * cm
                proporcao = img.imageWidth / img.imageHeight
                img_width = img_height * proporcao
                img.drawHeight = img_height
                img.drawWidth = img_width
                # Posicionamento: x + margem esquerda, y + deslocamento vertical
                img.drawOn(c, x + 4*cm, y + card_height - 3.5*cm)  # ajuste y conforme necessário
            
            # data
            if senha_obj.assistido and senha_obj.assistido.name:
                c.setFillColor(HexColor("#00FFF2"))
                nome_formatado = senha_obj.assistido.name.lower().title()  
                largura_nome = card_width * 0.65  # 65% da largura do cartão
                p_nome = Paragraph(nome_formatado, estilo_nome)
                p_nome.wrapOn(c, largura_nome, card_height)
                p_nome.drawOn(c, x + 0.3*cm, y + 0.8*cm)

            # Data do evento no canto inferior esquerdo
            if lote.data_evento:
                c.setFont("Helvetica-Bold", 10)
                c.drawString(x + 0.3*cm, y + 0.4*cm, f"Data do evento: {lote.data_evento.strftime('%d/%m/%Y')}")
            
            # Número da senha sobre o retângulo azul, centralizado vertical e horizontalmente
            c.setFont("Helvetica-Bold", 25)
            c.setFillColor(HexColor("#ffffff"))  # texto branco
            senha_texto = str(senha_obj.senha).zfill(3)
            # Calcula posição para centralizar no retângulo azul
            text_width = c.stringWidth(senha_texto, "Helvetica-Bold", 25)
            text_x = x + card_width - ret_width + (ret_width - text_width) / 2
            text_y = y + (card_height / 2) - 5  # ajusta verticalmente
            c.drawString(text_x, text_y, senha_texto)
            
            # Linha abaixo do número da senha
            linha_altura = 0.05 * cm
            linha_largura = ret_width * 0.9
            linha_x = x + card_width - ret_width + (ret_width - linha_largura) / 2
            linha_y = text_y - 0.22*cm  # um pouco abaixo do número
            c.setFillColor(HexColor("#ffffff"))
            c.rect(linha_x, linha_y, linha_largura, linha_altura, fill=1, stroke=0)
            
            # Texto 'SENHA' abaixo da linha, centralizado
            c.setFont("Helvetica-Bold", 15)
            senha_label = "SENHA"
            label_width = c.stringWidth(senha_label, "Helvetica-Bold", 15)
            label_x = x + card_width - ret_width + (ret_width - label_width) / 2
            label_y = linha_y - 0.5*cm  # ajusta verticalmente abaixo da linha
            c.drawString(label_x, label_y, senha_label)

            # Quebra de página
            if (i + 1) % max_por_pagina == 0:
                c.showPage()

        c.showPage()  # garante que a última página seja salva
        c.save()
        return response
