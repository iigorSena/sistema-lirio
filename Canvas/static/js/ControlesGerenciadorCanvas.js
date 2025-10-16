$(document).off('click', '#btn-abrir-canvas').on('click', '#btn-abrir-canvas', function() {
    const width = screen.availWidth;
    const height = screen.availHeight;

    window.open(
        '/canvas/editor/',
        'EditorCanvas',
        `width=${width},height=${height},top=0,left=0,scrollbars=yes,resizable=yes`
    );
});
