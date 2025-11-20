export class RunnerView {
    constructor(runner, ctx) {
        this.runner = runner;
        this.ctx = ctx;

        this.sprite = new Image();
        this.sprite.src = "js/games/flappy/assets/images/runner/runner-spritesheet.png";
    }

    draw() {
        const m = this.runner;

        if (!this.sprite.complete) return; // esperar carga

        // Dibujar sprite 
        this.ctx.drawImage(
            this.sprite,
            m.currentFrame * m.frameWidth, // frame X en el sprite
            0,
            m.frameWidth,
            m.frameHeight,
            m.x,
            m.y,
            m.width,
            m.height
        );
    }
}
