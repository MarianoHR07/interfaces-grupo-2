// TP5\js\games\flappy\flappy.js
import { Game } from './core/game.js'; 

export function initFlappy(container) {
    
    /** @type {HTMLCanvasElement} */
    const canvas = container.querySelector('#flappyCanvas');

    // obtenemos el overlay de game over
    let overlay = container.querySelector("#gameOverOverlay");
    const retryBtn = container.querySelector("#retryBtn");

    // crear e iniciar el juego
    const game = new Game(canvas, overlay);;
    game.start();

    // manejar el evento click del botón reintentar
    retryBtn.addEventListener("click", () => {
        // ocultar overlay
        overlay.style.display = "none";

        // reiniciar el juego al estado inicial
        game.controller.reset();
        game.lastTime = 0;
        game.controller.gameOver = false;

        // volver a iniciar el loop
        game.start();
    });

    
   
}
