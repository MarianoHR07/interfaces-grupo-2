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
        
        const minHeight = 80;
        ctx.strokeStyle='red';
        ctx.beginPath();
        ctx.moveTo(0, minHeight);
        ctx.lineTo(this.ctx.canvas.width, minHeight)
        ctx.stroke()
        ctx.closePath()

        ctx.strokeStyle='green';
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height-minHeight);
        ctx.lineTo(this.ctx.canvas.width, ctx.canvas.height-minHeight)
        ctx.stroke()
        ctx.closePath()

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
