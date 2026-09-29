/**
 * site.js · IMAX
 * Comportamientos globales ligeros: aparición al hacer scroll y header
 * con sombra al desplazarse.
 */
(function () {
    "use strict";

    // Aparición de elementos .reveal al entrar en el viewport
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
        Array.prototype.forEach.call(revealEls, function (el) { observer.observe(el); });
    } else {
        Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("visible"); });
    }

    // Header: añade sombra cuando la página se desplaza
    var header = document.querySelector(".header-web-light");
    if (header) {
        var onScroll = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }
})();
