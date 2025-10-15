import { initCategoriesGameplay } from "../components/game-category/game-category.js";
import { loadPage } from "./index.js";

export function initGameplay(container) {
    //--------------------------------- Interacciones relacionadas al juego ------------------------------ 
    
    // Like or Dislike
    const likeBtn = container.querySelector(".likeBtn");
    const dislikeBtn = container.querySelector("#dislikeBtn");
    
    likeBtn.addEventListener("click", () => {
            likeBtn.classList.toggle("active");     //le doy la clase active al boton
            if (dislikeBtn.classList.contains("active")) {
                dislikeBtn.classList.remove("active"); // desactiva dislike 
            }
        });
    
    dislikeBtn.addEventListener("click", () => {
            dislikeBtn.classList.toggle("active");   //le doy la clase active al boton
            if (likeBtn.classList.contains("active")) {
                likeBtn.classList.remove("active");    // desactiva like 
            }
        });
    
        
    // Favoritos
    const favBtn = container.querySelector("#favBtn");
    
    favBtn.addEventListener("click", () => {
            favBtn.classList.toggle("active");
        });
    
    
    // Controles
    const controlsBtn = container.querySelector("#controlsBtn");
    const controlsSection = container.querySelector(".controls");
    
    controlsBtn.addEventListener("click", () => {
      controlsSection.scrollIntoView({ behavior: "smooth" });
    });
    
    
    // Compartir
    const shareBtn = container.querySelector("#shareBtn");
    
    shareBtn.addEventListener("click", async () => {
            if (navigator.share) {
                try {
                await navigator.share({
                    title: "Mira este contenido",
                    url: window.location.href
                });
                } catch (err) {
                console.error("Error al compartir:", err);
                }
            } else {
                alert("La función de compartir no está disponible en este navegador.");
            }
        });
    
    
    // Pantalla Completa
    // const fullscreenBtn = container.querySelector("#fullscreenBtn");
    // const gameSection = container.querySelector(".game-running");
    
    // fullscreenBtn.addEventListener("click", () => {
    //     if (!container.fullscreenElement) {
    //         gameSection.requestFullscreen();
    //     } else {
    //         container.exitFullscreen();
    //     }
    // });

    // const returnHome = container.querySelector(".retun-home-gameplay");
    // returnHome.addEventListener("click", () => {
    //     loadPage("home.html");
    // });


    // -------------------------Recommended Games---------------------------
    function loadStrategyGames() {
        loadGamesData()
        .then(data => {
            const strategyGames = buildGameList("strategy", data["strategy"], 28);
            renderStrategyGames(strategyGames);
        })
        .catch(error => {
            console.error("Error al cargar los juegos:", error);
        });
    }

    function renderStrategyGames(games) {
        const containerRecommended = container.querySelector(".images-recommended-games-container");
        containerRecommended.innerHTML = "";

        games.forEach(game => {
            const img = document.createElement("img");
            img.src = game.image;
            img.alt = game.title;
            containerRecommended.appendChild(img);
        });
    }
    
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {loadStrategyGames(); });
    }else {
        loadStrategyGames();
    }

    initBlocka(container);
    initCategoriesGameplay(container);
    initComments(container);
    initTweets(container);
}





