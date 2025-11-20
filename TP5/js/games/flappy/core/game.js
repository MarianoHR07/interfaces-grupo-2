// TP5\js\games\flappy\core\game.js
import { GameController } from '../controllers/gameController.js';

export class Game {
    constructor(canvas , overlay) {
         /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas.getContext('2d');
        this.controller = new GameController(this.ctx);
        this.lastTime = 0; // guarda el timestamp del frame anterior.
        this.loopId = null;
        this.overlay = overlay;
    }

    start() {

        this.loopId = requestAnimationFrame(this.loop.bind(this));
    }

    pause() {
        cancelAnimationFrame(this.loopId);
        this.loopId = null;
    }

    loop(timestamp) { 
        /**
         * timestamp: Tiempo total (ms) desde que se inició la página. lo da el navegador en cada frame (en milisegundos).
         * lastTime: guarda el timestamp del frame anterior.
         * deltaTime es el tiempo transcurrido entre el frame anterior y el actual, medido en milisegundos.
         *    Si el juego corre a 60 FPS, deltaTime ≈ 16.6 ms.
        */
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.controller.draw();                             // dibuja el estado actual del juego
        
        this.controller.update(deltaTime, timestamp);       // actualiza los estados del juego

        if(this.controller.gameOver){                       // si el juego terminó
            this.pause();
            this.showGameOverOverlay();
            return null;
        }
        
        this.loopId = requestAnimationFrame(this.loop.bind(this));  
    }

    showGameOverOverlay() {
        this.overlay.style.display = "flex";
    }
}