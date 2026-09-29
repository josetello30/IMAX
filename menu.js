// Menú móvil: alterna la visibilidad y sincroniza aria-expanded
const btnMenu = document.querySelector("#btn-menu");
const menuList = document.querySelector("#menu-list");

if (btnMenu && menuList) {
    btnMenu.addEventListener("click", () => {
        const open = menuList.classList.toggle("mostrar");
        btnMenu.setAttribute("aria-expanded", String(open));
    });
}
