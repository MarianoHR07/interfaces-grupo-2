"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const footer = document.querySelector(".footer-index");
    if (!footer) throw new Error("No se encontró el contenedor .footer-index");

    try {
        const res = await fetch("components/footer/footer-template.html");
        if (!res.ok) throw new Error(`Error al cargar el template (${res.status})`);
        const html = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const template = doc.getElementById("footer-template");

        if (!template) throw new Error("No se encontró el <template> con id='footer-template'");

        // Limpia el contenedor antes de insertar (por seguridad)
        footer.innerHTML = "";

        // Inserta el contenido del template
        const clone = template.content.cloneNode(true);
        footer.appendChild(clone);

        // (Opcional) si querés que el botón “ir arriba” funcione:
        const scrollToTopBtn = footer.querySelector(".scroll-to-top a");
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

    } catch (err) {
        console.error("Error cargando el footer:", err);
    }
});
