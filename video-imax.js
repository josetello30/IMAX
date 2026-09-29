/**
 * video-imax.js
 * Abre y cierra el popup modal del Video IMAX con iframe dinámico (autoplay)
 */
document.addEventListener("DOMContentLoaded", function () {
    const btnOpenVideo = document.getElementById("btn-open-video");
    const videoModal = document.getElementById("video-modal-overlay");
    const btnCloseVideo = document.getElementById("video-modal-close");
    const videoIframeContainer = document.getElementById("video-iframe-container");

    const videoId = "eGW5rRap7Ec";

    if (btnOpenVideo && videoModal && videoIframeContainer) {
        // Abrir popup y cargar iframe
        btnOpenVideo.addEventListener("click", function () {
            videoIframeContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
                    title="Video IMAX" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>
            `;
            videoModal.classList.add("activo");
            document.body.style.overflow = "hidden"; // Evita scroll de fondo
        });

        // Función para cerrar modal
        function cerrarModal() {
            videoModal.classList.remove("activo");
            videoIframeContainer.innerHTML = ""; // Detiene la reproducción del video
            document.body.style.overflow = "";
        }

        // Eventos de cierre
        if (btnCloseVideo) {
            btnCloseVideo.addEventListener("click", cerrarModal);
        }

        // Clic fuera del contenedor del video
        videoModal.addEventListener("click", function (e) {
            if (e.target === videoModal) {
                cerrarModal();
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && videoModal.classList.contains("activo")) {
                cerrarModal();
            }
        });
    }
});
