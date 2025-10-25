"use strict";
// 1. Importa desde game-category.js
import { categorias } from '../game-category/game-category.js'; 

document.addEventListener('DOMContentLoaded', () => {

    const contenedor = document.getElementById("sidebar-container");
    const body = document.body;

    const menuButton = document.querySelector('.header-menu-btn');
    const sidebar = document.querySelector('.sidebar');

   
    if (!contenedor) return; 

    // 1. Carga del template.
    fetch("components/sidebar/sidebar-template.html")
        .then(res => {

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const template = doc.getElementById("sidebar-template");

            if (!template) {
                console.error("Error: 'sidebar-template' not found in the loaded HTML.");
                return; 
            }

            // Clona todo el sidebar.
            const clone = template.content.cloneNode(true);
            contenedor.appendChild(clone);

            
            // 2. Inyección del contenido de categorías.
            const categoriesList = contenedor.querySelector("#categories-sidebar");
            const categoryTemplate = contenedor.querySelector("#category-item"); 

            if (categoriesList && categoryTemplate) {
                
                categorias.forEach(cat => {
                    const cloneCat = categoryTemplate.content.cloneNode(true);
                    
                    const listItem = cloneCat.querySelector("li");
                    const iconElement = cloneCat.querySelector(".icon");
                    const nameElement = cloneCat.querySelector(".category-name");

                    // Data.
                    if (iconElement) iconElement.textContent = cat.icon || '❓';
                    if (nameElement) nameElement.textContent = cat.name;

                    // Asignación de atributos.
                    if (listItem) {
                        listItem.classList.add('sidebar-list-item');
                        listItem.dataset.category = cat.name;
                    }

                    categoriesList.appendChild(cloneCat);
                });
            } else {
                 console.warn("Warning: Could not find #categories-sidebar or #category-item template.");
            }


            // Funcionalidad del botón desplegable
            const menuButton = document.querySelector('.header-menu-btn');
            const sidebar = contenedor.querySelector('.sidebar');
            const body = document.body;

            if (menuButton && sidebar) {
                menuButton.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                    body.classList.toggle('menu-open');
                });
            }

        })
});