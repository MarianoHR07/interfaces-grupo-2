"use strict";

// function initFooter(container){
    // const footer = document.querySelector(".footer-index");

    // fetch("components/footer/footer.html")
    //     .then(res => res.text())
    //     .then(html => {
    //         footer.innerHTML = html;
    //     });
// }

document.addEventListener('DOMContentLoaded', () => {

    const contenedor = document.querySelector(".footer-index");

    // if (!contenedor) {
    //     console.error("Error: El contenedor con id 'footer-index' no se encontró en el DOM.");
    //     return;
    // }

    if (!contenedor) throw new Error("Error: El contenedor con id 'footer-index' no se encontró en el DOM.");

    fetch("components/footer/footer-template.html")
        .then(res => {
            if (!res.ok) throw new Error(`Error al cargar la plantilla: ${res.statusText} (${res.status})`);
            return res.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const template = doc.getElementById("footer-template");

            if (!template) {
                console.error("Error: No se encontró el <template> con id 'footer-template'.");
                return;
            }

            const clone = template.content.cloneNode(true);
            contenedor.appendChild(clone);
        })
        .catch(err => console.error("Error cargando el template:", err));
});
