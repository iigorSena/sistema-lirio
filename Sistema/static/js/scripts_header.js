function toggleMenuMobile() {
    const menu = document.getElementById("menu-mobile");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// Fecha o menu ao clicar fora
document.addEventListener("click", function(e) {
    const menu = document.getElementById("menu-mobile");
    const btnMenu = document.getElementById("btn-menu-mobile"); // id do botão que abre o menu

    if (!menu || !btnMenu) return;

    // Se o clique não foi no botão e não foi dentro do menu
    if (e.target !== btnMenu && !menu.contains(e.target)) {
        menu.style.display = "none";
    }
});
