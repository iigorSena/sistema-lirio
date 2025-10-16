document.addEventListener('DOMContentLoaded', function() {
    const canvas = new fabric.Canvas('area-edicao_canvas');

    function cmToPx(cm) {
        return cm * 37.795275591; // 1 cm ≈ 37.79 px
    }

    // Botão criar documento
    document.getElementById('btn-aplicar-tamanho').addEventListener('click', () => {
        let largura = parseFloat(document.getElementById('canvas-largura').value);
        let altura = parseFloat(document.getElementById('canvas-altura').value);
        const unidade = document.getElementById('canvas-unidade').value;

        if(unidade === 'cm') {
            largura = cmToPx(largura);
            altura = cmToPx(altura);
        }

        // Limpar documento anterior
        const objs = canvas.getObjects('rect').filter(o => o.docLayout);
        objs.forEach(o => canvas.remove(o));

        // Criar retângulo do documento
        const docRect = new fabric.Rect({
            left: 10,
            top: 10,
            width: Math.min(largura, canvas.getWidth() - 20),
            height: Math.min(altura, canvas.getHeight() - 20),
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
            selectable: true,
            hasControls: true,
            docLayout: true
        });

        canvas.add(docRect);
        canvas.setActiveObject(docRect);
        canvas.renderAll();
    });
});
