import { loadPage } from "./index.js";


// Inicializador principal llamado desde index.js
export async function initLoading(container) {
    await loadLoaderParticles(container);
    initLoader(container);
}


// --------------------- Cargar de partículas dinámicamente  ---------------------
function loadLoaderParticles(container) {
    loadGamesData()
    .then(data => {
        // Combinar TODAS las categorías
        let allGames = [];

        for (const category in data) {
            const gamesFromCategory = buildGameList(
                category, 
                data[category], 
                data[category].length
            );
            allGames = allGames.concat(gamesFromCategory);
        }

        // Aleatorizo
        allGames.sort(() => Math.random() - 0.5);

        // Tomo la cantidad que quiero
        const selectedGames = allGames.slice(0, 10);

        renderLoaderParticles(container, selectedGames);
    })
    .catch(error => {
        console.error("Error al cargar los juegos del loader:", error);
    });
}

function renderLoaderParticles(container, games) {
    const particleElements = container.querySelectorAll(".particle img");

    games.forEach((game, i) => {
        if (particleElements[i]) {
        particleElements[i].src = game.image;
        particleElements[i].alt = game.title;
        }
    });
}


// ----------------------- Animaciones de carga ---------------------------
function initLoader(container) {

    // Elementos del DOM
    const logoContainer = container.querySelector("#logoContainer");
    const logoName = container.querySelector("#logo-name-loading");
    const loadingText = container.querySelector("#loadingText");
    const progressContainer = container.querySelector("#progressContainer");
    const progressBar = container.querySelector("#progressBar");

    const particles = Array.from(container.querySelectorAll(".particle"));

    // Variables de control
    let progress = 0;
    const totalDuration = 5000; // 5 segundos
    const updateInterval = 50;  // Actualizar cada 50ms
    const increment = (100 / totalDuration) * updateInterval;

    // Intervalo de progreso
    const progressInterval = setInterval(() => {
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);

            // Actualizar UI final
            loadingText.textContent = "100%";
            progressBar.style.width = "100%";

            // Secuencia de animación al completar
            setTimeout(() => {
                // Ocultar porcentaje y barra
                loadingText.classList.add("hidden");
                progressContainer.classList.add("hidden");
                
                // Mostrar nombre de la página
                logoName.classList.add("show");

                setTimeout(() => {
                    // Iniciar animación de desplazamiento del logo
                    logoContainer.classList.add("swiping");
                    
                    // Dividir partículas entre izquierda y derecha
                    particles.forEach((particle, index) => {
                        // Alternar cortina izquierda / derecha
                        if (index % 2 === 0) {
                            particle.classList.add("curtain-left");
                        } else {
                            particle.classList.add("curtain-right");
                        }
                    });

                    // Redirigir al home
                    setTimeout(() => {
                        loadPage("home.html");
                    }, 3000);

                }, 500);
            }, 300);
        } else {
            // Actualizar porcentaje y barra
            loadingText.textContent = Math.floor(progress) + "%";
            progressBar.style.width = progress + "%";
        }
    }, updateInterval);
}

