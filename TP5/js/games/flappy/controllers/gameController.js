import { ObstacleController } from './obstacleController.js';

export class GameController {
    /**
     * @param {CanvasRenderingContext2D} ctx  
     */
    constructor(ctx) {
        this.ctx = ctx;

        /** @type {ObstacleController} controlador de obstáculos */
        this.obstacleController = new ObstacleController(ctx);
    }

    // actualiza el estado del juego y de cada uno de los objetos
    update(deltaTime, timestamp) {
        this.obstacleController.update(deltaTime, timestamp);
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacleController.draw();
    }
}
