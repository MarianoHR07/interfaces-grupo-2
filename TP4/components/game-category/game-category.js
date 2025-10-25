"use strict";
// Categorias:
export const categorias = [
    { icon: "🏈", name: "Deportes", game:[] },
    { icon: "⚔️", name: "Acción", game:[] },
    { icon: "🏁", name: "Aventura", game:[] },
    { icon: "🃏", name: "Cartas", game:[] },
    { icon: "🚗", name: "Autos", game:[] },
    { icon: "🎯", name: "Disparos", game:[] },
    { icon: "🏍️", name: "Motocicletas", game:[] },
    { icon: "🧩", name: "Puzzle", game:["PegSolitaire"] },
    { icon: "👗", name: "Moda", game:[] },
    { icon: "🍔", name: "Cocina", game:[] },
    { icon: "👻", name: "Terror", game:[] },
    { icon: "🚪", name: "Escape", game:[] },
    { icon: "💥", name: "Guerra", game:[] },
    { icon: "🔫", name: "Armas", game:[] },
    { icon: "🎨", name: "Dibujo", game:[] },
    { icon: "💡", name: "Estrategia", game:["PegSolitaire"] },
    { icon: "⚽", name: "Fútbol", game:[] }
];

function initCategoriesGameplay(container){
    // Referencias al DOM:
    const categoriesContainer = container.querySelector("#categories");
    
    // Traigo el template desde game-category.html:
    fetch("components/game-category/game-category.html")
        .then(res => res.text())
        .then(html => {
            container.querySelector("#categories").innerHTML = html;
    
            const template = container.querySelector("#game-category-template");
    
            categorias.forEach(cat => {
                if(cat.game.includes("PegSolitaire")){
                    let clone = template.content.cloneNode(true);
                    clone.querySelector(".icon").textContent = cat.icon;
                    clone.querySelector(".index-user").textContent = cat.name;
                    categoriesContainer.appendChild(clone);
                }
            });
        });
}

function initCategoriesSidebar(container) {
    const categoriesContainer = container.querySelector("#categories-sidebar");

    fetch("components/game-category/game-category.html")
        .then(res => res.text())
        .then(html => {
            container.querySelector("#categories-sidebar").innerHTML = html;
            const template = container.querySelector("#game-category-template");
            const categoriesList = contenedor.querySelector("#categories-sidebar");
            const categoryTemplate = contenedor.querySelector("#category-item");
    
            if (categoriesList && categoryTemplate) {
                categorias.forEach(cat => {
                    // const cloneCat = categoryTemplate.content.cloneNode(true);
                    let clone = template.content.cloneNode(true);
                    clone.querySelector(".icon").textContent = cat.icon;
                    clone.querySelector(".index-user").textContent = cat.name;

                    categoriesContainer.appendChild(clone);

                    // ----------------------

                    const cloneCat = categoryTemplate.content.cloneNode(true);
                    const iconElement = cloneCat.querySelector(".icon");
                    const nameElement = cloneCat.querySelector(".category-name");

                    if (iconElement) iconElement.textContent = cat.icon || '❓';
                    if (nameElement) nameElement.textContent = cat.name;

                    const listItem = cloneCat.querySelector("li");
                    if (listItem) {
                        listItem.classList.add('sidebar-list-item');
                        listItem.dataset.category = cat.name;
                    }

                    categoriesList.appendChild(cloneCat);
                });
            }
        });
}
    
export { initCategoriesGameplay, initCategoriesSidebar };




 
