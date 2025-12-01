// TP5\js\games\flappy\flappy.js
import { Game } from './core/game.js'; 

export function initFlappy(container) {
    
    /** @type {HTMLCanvasElement} */
    const canvas = container.querySelector('#flappyCanvas');

    // MENU DE INICIO
    const startMenu = container.querySelector("#startMenuFlappy");
    const startBtn = container.querySelector("#startBtnFlappy");

    // GAME OVER
    let overlay = container.querySelector("#gameOverOverlayFlappy");
    const retryBtn = container.querySelector("#retryBtnFlappy");
    const backToMenuBtn = container.querySelector("#backToMenuBtnFlappy");

    // Crear el juego
    const game = new Game(canvas, overlay);;
    game.loadAudio();

    // Comenzar juego
    startBtn.addEventListener("click", () => {
        startMenu.style.display = "none"; // ocultar menú
        game.playBGM(); // reproducir musica del juego
        game.start();                     // iniciar juego
    });

    // Reintentar juego
    retryBtn.addEventListener("click", () => {
        overlay.style.display = "none"; // ocultar overlay
        game.lastTime = 0;
        game.controller.gameOver = false;
        game.playBGM(); // reproducir musica del juego
        game.start();  // volver a iniciar el loop
    });

    // Volver al menu de inicio
    backToMenuBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        startMenu.style.display = "flex";

        // parar el juego
        game.pause();   
        
        // limpiar canvas
        game.clearCanvas();

        // Reiniciar el juego para que arranque desde cero cuando se toque "Comenzar"
        game.stopAllBGM();
        game.playBGM_Menu();

        game.lastTime = 0;
        game.controller.gameOver = false;
    });

    // Pausar musica
    const muteBtn = container.querySelector("#muteMusicBtn");
    game.controller.audio.muted = false; // flag del estado de la música

    muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        
        const audio = game.controller.audio;

        audio.muted = !audio.muted;

        if (audio.muted) {
            game.stopAllBGM();
            muteBtn.textContent = "🔇";
        } else {
            // Si estamos en menu → reproducir menu BGM
            if (startMenu.style.display !== "none") {
                game.playBGM_Menu();
            } 
            // Si estamos dentro del juego → reproducir gameplay BGM
            else {
                game.playBGM();
            }

            muteBtn.textContent = "🔊";
        }
    });


   
}
