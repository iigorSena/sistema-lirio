document.addEventListener('DOMContentLoaded', () => {
    const btnCadTbAssis = document.getElementById('btn-cad-tb-assis');
    const popupFormCadAssis = document.getElementById('sombra-popup-form-cadassis');
    const closePopup = document.getElementById('close-popup-cadassis');

    if (btnCadTbAssis && popupFormCadAssis && closePopup) {
        btnCadTbAssis.addEventListener('click', (event) => {
            event.preventDefault();
            popupFormCadAssis.style.display = 'block';
        });

        closePopup.addEventListener('click', () => {
            popupFormCadAssis.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === popupFormCadAssis) {
                popupFormCadAssis.style.display = 'none';
            }
        });
    } else {
        console.error("Um ou mais elementos não foram encontrados no DOM.");
    }
});
