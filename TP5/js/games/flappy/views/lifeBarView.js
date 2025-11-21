export class LifeBarView {
    constructor(ctx, lifeManager) {
        this.ctx = ctx;
        this.lifeManager = lifeManager;

        // Cargar sprites
        this.heartFull = new Image();
        this.heartFull.src = "js/games/flappy/assets/images/items/heart_full.png";

        this.heartEmpty = new Image();
        this.heartEmpty.src = "js/games/flappy/assets/images/items/heart_empty.png";

        // Tamaño 
        this.heartSize = 32;
        this.spacing = 10;
    }

    draw() { 
        let x = this.ctx.canvas.width - (this.lifeManager.maxLives * (this.heartSize + this.spacing)) - 10; // el -10 es para separarlo un poco del borde
        let y = 10;

        for (let i = 0; i < this.lifeManager.maxLives; i++) {
            const img = i < this.lifeManager.currentLives ? this.heartFull : this.heartEmpty;

            this.ctx.drawImage(
                img,
                x + i * (this.heartSize + this.spacing),
                y,
                this.heartSize,
                this.heartSize
            );
        }
    }

}
