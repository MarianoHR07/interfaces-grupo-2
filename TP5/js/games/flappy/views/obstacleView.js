// TP5\js\games\flappy\views\obstacleView.js
import { View } from '../core/view.js';

export class ObstacleView extends View {
    /**
     * @param {CanvasRenderingContext2D} ctx  
     */
    constructor(ctx) {
        super(ctx);
    }
    draw(obstacle) {
        const ctx = this.ctx;
        const img = obstacle.image;

        if (!img.complete) return; // esperar carga

        ctx.drawImage(
            img,
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );
    }
}
