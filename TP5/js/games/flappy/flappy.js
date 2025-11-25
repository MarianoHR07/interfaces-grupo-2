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
        game.controller.reset();  // reiniciar el juego al estado inicial
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
        game.stopBGM()
        game.controller.reset();
        game.lastTime = 0;
        game.controller.gameOver = false;
    });
   
}
