/**
 * carousels.js · IMAX
 * ---------------------------------------------------------------------------
 * Carrusel accesible en JavaScript vanilla (sin dependencias).
 *
 * Marcado esperado:
 *   <div class="carousel" data-carousel data-autoplay data-mode="slide|fade">
 *     <div class="carousel__viewport">
 *       <ul class="carousel__track">
 *         <li class="carousel__slide">…</li>
 *       </ul>
 *     </div>
 *     <div class="carousel__controls">
 *       <button data-carousel-prev>…</button>
 *       <div class="carousel__dots" data-carousel-dots></div>
 *       <button data-carousel-next>…</button>
 *     </div>
 *   </div>
 *
 * - Diapositivas visibles por vista: CSS (--carousel-per-view), así el
 *   responsive vive en la hoja de estilos.
 * - Autoplay: el temporizador es la animación CSS de la barra de progreso del
 *   punto activo ("animationend" ⇒ siguiente). Pausar = animation-play-state,
 *   por lo que al reanudar continúa donde se quedó.
 * - Se pausa con hover, foco de teclado, pestaña oculta o fuera de pantalla.
 * - Soporta swipe (pointer events) y flechas del teclado.
 */
(function () {
    "use strict";

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function Carousel(root) {
        this.root = root;
        this.viewport = root.querySelector(".carousel__viewport");
        // En modo "fade" las diapositivas pueden ir directamente en el viewport
        this.track = root.querySelector(".carousel__track") || this.viewport;
        this.slides = Array.prototype.slice.call(root.querySelectorAll(".carousel__slide"));
        this.dotsWrap = root.querySelector("[data-carousel-dots]");
        this.prevBtn = root.querySelector("[data-carousel-prev]");
        this.nextBtn = root.querySelector("[data-carousel-next]");
        this.mode = root.getAttribute("data-mode") || "slide";
        this.autoplay = root.hasAttribute("data-autoplay") && !prefersReducedMotion;
        this.index = 0;
        this.pauseReasons = {};

        if (!this.track || this.slides.length === 0) return;

        this.bind();
        this.update();
        this.buildDots();
        this.goTo(0, true);

        if (this.autoplay) root.classList.add("is-autoplay");
    }

    /* Número de diapositivas visibles (definido en CSS) */
    Carousel.prototype.perView = function () {
        if (this.mode === "fade") return 1;
        var value = parseInt(getComputedStyle(this.root).getPropertyValue("--carousel-per-view"), 10);
        return Math.max(1, Math.min(value || 1, this.slides.length));
    };

    Carousel.prototype.update = function () {
        this.maxIndex = Math.max(0, this.slides.length - this.perView());
    };

    Carousel.prototype.buildDots = function () {
        if (!this.dotsWrap) return;
        var self = this;
        var count = this.maxIndex + 1;
        if (this.dots && this.dots.length === count) return;

        this.dotsWrap.innerHTML = "";
        this.dots = [];
        for (var i = 0; i < count; i++) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.className = "carousel__dot";
            dot.setAttribute("aria-label", "Ir a la diapositiva " + (i + 1) + " de " + count);
            (function (n) {
                dot.addEventListener("click", function () { self.goTo(n); });
            })(i);
            this.dotsWrap.appendChild(dot);
            this.dots.push(dot);
        }
    };

    Carousel.prototype.goTo = function (target, instant) {
        var total = this.maxIndex + 1;
        this.index = ((target % total) + total) % total; // bucle infinito

        if (this.mode === "fade") {
            var active = this.index;
            this.slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
        } else {
            var slideWidth = this.slides[0].getBoundingClientRect().width;
            var gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
            this.offset = -this.index * (slideWidth + gap);
            if (instant) this.track.style.transition = "none";
            this.track.style.transform = "translate3d(" + this.offset + "px,0,0)";
            if (instant) {
                void this.track.offsetWidth;
                this.track.style.transition = "";
            }
        }

        this.syncA11y();
        this.restartTimer();
    };

    Carousel.prototype.next = function () { this.goTo(this.index + 1); };
    Carousel.prototype.prev = function () { this.goTo(this.index - 1); };

    /* Reinicia la animación de progreso del punto activo */
    Carousel.prototype.restartTimer = function () {
        if (!this.dots) return;
        var current = this.index;
        this.dots.forEach(function (dot, i) {
            if (i === current) {
                dot.removeAttribute("aria-current");
                void dot.offsetWidth; // fuerza reflow para reiniciar la animación
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    };

    Carousel.prototype.syncA11y = function () {
        var start = this.index;
        var end = this.mode === "fade" ? start : start + this.perView() - 1;
        this.slides.forEach(function (slide, i) {
            var visible = i >= start && i <= end;
            slide.setAttribute("aria-hidden", visible ? "false" : "true");
            // Los enlaces de diapositivas ocultas no deben recibir foco
            Array.prototype.forEach.call(slide.querySelectorAll("a, button"), function (el) {
                if (visible) el.removeAttribute("tabindex");
                else el.setAttribute("tabindex", "-1");
            });
        });
    };

    /* Pausa con motivos acumulables (hover, foco, pestaña, visibilidad) */
    Carousel.prototype.pause = function (reason) {
        this.pauseReasons[reason] = true;
        this.root.classList.add("is-paused");
    };

    Carousel.prototype.resume = function (reason) {
        delete this.pauseReasons[reason];
        if (Object.keys(this.pauseReasons).length === 0) this.root.classList.remove("is-paused");
    };

    Carousel.prototype.bind = function () {
        var self = this;

        if (this.prevBtn) this.prevBtn.addEventListener("click", function () { self.prev(); });
        if (this.nextBtn) this.nextBtn.addEventListener("click", function () { self.next(); });

        // El punto activo lleva el temporizador del autoplay
        if (this.dotsWrap) {
            this.dotsWrap.addEventListener("animationend", function (e) {
                if (e.animationName === "carousel-progress") self.next();
            });
        }

        // Pausa al pasar el mouse o al navegar con teclado dentro del carrusel
        this.viewport.addEventListener("mouseenter", function () { self.pause("hover"); });
        this.viewport.addEventListener("mouseleave", function () { self.resume("hover"); });
        // Solo el foco de teclado pausa: un clic en las flechas no debe detenerlo
        this.root.addEventListener("focusin", function (e) {
            var keyboard = true;
            try { keyboard = e.target.matches(":focus-visible"); } catch (err) { /* navegador antiguo */ }
            if (keyboard) self.pause("focus");
        });
        this.root.addEventListener("focusout", function (e) {
            if (!self.root.contains(e.relatedTarget)) self.resume("focus");
        });

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) self.pause("tab");
            else self.resume("tab");
        });

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) self.resume("offscreen");
                    else self.pause("offscreen");
                });
            }, { threshold: 0.25 }).observe(this.root);
        }

        // Teclado
        this.root.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight") { e.preventDefault(); self.next(); }
            if (e.key === "ArrowLeft") { e.preventDefault(); self.prev(); }
        });

        // Swipe / arrastre con pointer events
        var startX = 0, deltaX = 0, dragging = false, moved = false;

        this.viewport.addEventListener("pointerdown", function (e) {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            dragging = true;
            moved = false;
            startX = e.clientX;
            deltaX = 0;
        });

        this.viewport.addEventListener("pointermove", function (e) {
            if (!dragging) return;
            deltaX = e.clientX - startX;
            if (Math.abs(deltaX) > 6 && !moved) {
                moved = true;
                self.root.classList.add("is-dragging");
                self.pause("drag");
            }
            if (moved && self.mode !== "fade") {
                self.track.style.transform = "translate3d(" + (self.offset + deltaX) + "px,0,0)";
            }
        });

        function endDrag() {
            if (!dragging) return;
            dragging = false;
            self.root.classList.remove("is-dragging");
            self.resume("drag");
            if (!moved) return;
            if (deltaX < -50) self.next();
            else if (deltaX > 50) self.prev();
            else self.goTo(self.index);
        }

        this.viewport.addEventListener("pointerup", endDrag);
        this.viewport.addEventListener("pointercancel", endDrag);
        this.viewport.addEventListener("pointerleave", endDrag);

        // Evita que un arrastre dispare el clic del enlace de la tarjeta
        this.viewport.addEventListener("click", function (e) {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                moved = false;
            }
        }, true);

        this.viewport.addEventListener("dragstart", function (e) { e.preventDefault(); });

        // Recalcula al cambiar el tamaño (cambia --carousel-per-view)
        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                self.update();
                self.buildDots();
                self.goTo(Math.min(self.index, self.maxIndex), true);
            }, 150);
        });
    };

    /* Marquee de clientes: duplica la lista para un bucle sin saltos */
    function initMarquee(marquee) {
        var track = marquee.querySelector(".clients__track");
        if (!track) return;
        var clone = track.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(clone.querySelectorAll("a, button"), function (el) {
            el.setAttribute("tabindex", "-1");
        });
        marquee.appendChild(clone);
    }

    /* Contadores animados de las cifras */
    function initCounters() {
        var counters = document.querySelectorAll("[data-count]");
        if (!counters.length) return;

        function animate(el) {
            var target = parseInt(el.getAttribute("data-count"), 10);
            var formatter = new Intl.NumberFormat("es-PE");
            if (prefersReducedMotion) {
                el.textContent = formatter.format(target);
                return;
            }
            var duration = 1800;
            var start = null;
            function step(ts) {
                if (start === null) start = ts;
                var progress = Math.min((ts - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = formatter.format(Math.round(target * eased));
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        if (!("IntersectionObserver" in window)) {
            Array.prototype.forEach.call(counters, animate);
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        Array.prototype.forEach.call(counters, function (el) { observer.observe(el); });
    }

    function init() {
        Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (el) {
            new Carousel(el);
        });
        Array.prototype.forEach.call(document.querySelectorAll("[data-marquee]"), initMarquee);
        initCounters();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

    window.ImaxCarousel = Carousel;
})();
