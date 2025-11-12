// import { Runner } from "../models/runner.js";
// // import { Obstacle } from "../models/obstacle.js";
// import { GameView } from "../views/gameView.js";

// export class GameController {
//     constructor(ctx) {
//         this.ctx = ctx;
//         this.runner = new Runner();
//         this.obstacles = [new Obstacle(300)];
//         this.view = new GameView(ctx);
//     }

//     // actualiza el estado del juego y de cada uno de los objetos
//     update(deltaTime) {
//         this.runner.update(deltaTime);
//         this.obstacles.forEach(o => o.update(deltaTime));
//     }
//     // renderiza el estado actual del juego en la pantalla
//     draw() {
//         this.view.draw(this.runner, this.obstacles);
//     }
// }

import { Obstacle } from '../models/obstacle.js';
import { ObstacleView } from '../views/obstacleView.js';

export class GameController {
    constructor(ctx) {
        this.ctx = ctx;
        this.obstacleView = new ObstacleView(ctx);
        this.obstacles = [];

        this.spawnInterval = 2000; // cada 2 segundos
        this.lastSpawn = 0;

        this.gap = 150; // distancia entre top y bottom
        this.minHeight = 80;
        this.maxHeight = 300;

        // cargar imágenes
        this.imgTop = new Image();
        this.imgTop.src = 'js/games/flappy/assets/images/obstacle/obstaculo_superior.png';

        this.imgBottom = new Image();
        this.imgBottom.src = 'js/games/flappy/assets/images/obstacle/obstaculo_inferior.png';
    }

    // actualiza el estado del juego y de cada uno de los objetos
    update(deltaTime, timestamp) {
        // generar obstáculos nuevos
        if (timestamp - this.lastSpawn > this.spawnInterval) {
            this.spawnPair();
            this.lastSpawn = timestamp;
        }

        // actualizar obstáculos
        this.obstacles.forEach(o => o.update(deltaTime));

        // eliminar los que ya salieron de pantalla
        this.obstacles = this.obstacles.filter(o => o.active);
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacles.forEach(o => this.obstacleView.draw(o));
    }

    spawnPair() {
        const canvasHeight = this.ctx.canvas.height;

        // altura aleatoria para el top
        // topHeight ∈ [minHeight, maxHeight]
        const topHeight = Math.floor(
            Math.random() * (this.maxHeight - this.minHeight) + this.minHeight
        );
        // Ejemplo: 
        // Sean: minHeight=50, maxHeight=300
        //       topHeight ∈ [50, 300]
        // (maxHeight - minHeight) = 250 nos da el rango de variación
        // Math.random() * (maxHeight - minHeight) ∈ [0, 250]
        // + minHeight desplaza el rango a [50, 300]

        const bottomY = topHeight + this.gap;

        // crear obstáculos
        const top = new Obstacle(
            this.ctx.canvas.width,
            topHeight - this.imgTop.height,
            'top',
            this.imgTop
        );

        const bottom = new Obstacle(
            this.ctx.canvas.width,
            bottomY,
            'bottom',
            this.imgBottom
        );

        this.obstacles.push(top, bottom);
    }
}
