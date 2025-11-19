import { Obstacle } from '../models/obstacle.js';
import { ObstacleView } from '../views/obstacleView.js';

export class ObstacleController {
    /**
     * @param {CanvasRenderingContext2D} ctx  
     */
    constructor(ctx) {

        this.ctx = ctx;

        /** @type {Obstacle[]} lista de obstáculos */
        this.obstacles = [];  
        
        /** @type {ObstacleView} vista de los obstáculos */
        this.obstacleView = new ObstacleView(ctx);

        this.spawnInterval = 2250; // cada 2 segundos
        this.lastSpawn = 0;

        this.gap = 225; // distancia entre top y bottom
        this.minHeight = 100;
        this.maxHeight = 300;

        // cargar imágenes
        this.imgTop = new Image();
        this.imgTop.src = 'js/games/flappy/assets/images/obstacle/obstaculo_superior.png';

        this.imgBottom = new Image();
        this.imgBottom.src = 'js/games/flappy/assets/images/obstacle/obstaculo_inferior.png';
    }

    addObstaclePair() {
        const { topObstacle: topObstacle, bottomObstacle: bottomObstacle , topHeight: topHeight, bottomY: bottomY} = this.#spawnPair();
        this.obstacles.push(topObstacle, bottomObstacle);
        return { topHeight: topHeight, bottomY: bottomY};
    }

    update(deltaTime, timestamp) {
        let topHeight = null;
        let bottomY = null;
        // generar obstáculos nuevos
        if (timestamp - this.lastSpawn > this.spawnInterval) {
            const pair = this.addObstaclePair();
            topHeight = pair.topHeight;
            bottomY = pair.bottomY;
            this.lastSpawn = timestamp;
        }

        // actualizar obstáculos
        this.obstacles.forEach(o => o.update(deltaTime));

        // eliminar los que ya salieron de pantalla
        this.obstacles = this.obstacles.filter(o => o.active);
        return { topHeight: topHeight, bottomY: bottomY};
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacles.forEach(o => this.obstacleView.draw(o));
    }

    #spawnPair() {
        const canvasHeight = this.ctx.canvas.height;

        // altura aleatoria para el top
        // topHeight ∈ [minHeight, maxHeight]
        let topHeight = Math.floor(
            Math.random() * (this.maxHeight - this.minHeight) + this.minHeight
        );
        // Ejemplo: 
        // Sean: minHeight=50, maxHeight=300
        //       topHeight ∈ [50, 300]
        // (maxHeight - minHeight) = 250 nos da el rango de variación
        // Math.random() * (maxHeight - minHeight) ∈ [0, 250]
        // + minHeight desplaza el rango a [50, 300]


        // límite superior para que también quede espacio para el gap y minHeight inferior
        const maxAllowedTop = canvasHeight - this.gap - this.minHeight;
        if (topHeight > maxAllowedTop) {
            topHeight = maxAllowedTop;
        }


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
 
        return { topObstacle: top, bottomObstacle: bottom, topHeight, bottomY };
    }
}