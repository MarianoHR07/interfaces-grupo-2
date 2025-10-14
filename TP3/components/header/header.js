"use strict";

import { loadPage } from "../../js/index.js";

document.addEventListener("DOMContentLoaded", async () => {
    const header = document.querySelector(".header-index");

    if (!header) throw new Error("El contenedor con id 'header-container' no se encontró en el DOM.");
    
    fetch("components/header/header-template.html")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo cargar el archivo header-template.html");
            return res.text();
        })
        .then(html => {
            
            header.innerHTML = html;
                
            const template = document.getElementById("header-template");
            if (!template) throw new Error("Error: No se encontró el <template> con id 'header-template'.");

            const clone = template.content.cloneNode(true);
            header.appendChild(clone);

            const returnHome = document.querySelector(".header-logo");
            returnHome.addEventListener("click", () => {
                loadPage("home.html");
            });

            // Obtiene el elemento del avatar del usuario en el header.
            // El header-user-avatar se encuentra dentro de la clase header-user.
            const userAvatar = document.querySelector('.header-user-avatar');
            
            // Obtiene el elemento de la tarjeta de perfil que queremos mostrar/ocultar.
            const profileCard = document.querySelector('.profile-card');
            
            if (userAvatar && profileCard) {
                // Agrega un escuchador de eventos de clic al avatar del usuario.
                userAvatar.addEventListener('click', (event) => {
                    // Evita que el clic se propague al documento. Esto es importante
                    // para que el evento de cierre global no se active al mismo tiempo.
                    event.stopPropagation();
                    
                    // Alterna la clase 'active' en la tarjeta de perfil.
                    // 'toggle' agrega la clase si no está presente y la quita si ya está.
                    profileCard.classList.toggle('active');
                });
            }
            
            // Agrega un escuchador de eventos de clic al documento para cerrar la tarjeta.
            document.addEventListener('click', (event) => {
                // Si el clic no se hizo dentro de la tarjeta de perfil
                // y tampoco en el avatar que la activa, entonces la oculta.
                if (!profileCard.contains(event.target) && !userAvatar.contains(event.target)) {
                    profileCard.classList.remove('active');
                }
            });
            
        });

});

