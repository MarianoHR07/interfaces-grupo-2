export class RunnerView {
    constructor(runner, ctx) {
        this.runner = runner;
        this.ctx = ctx;

        // Sprite del runner
        this.sprite = new Image();
        this.sprite.src = "js/games/flappy/assets/images/runner/runner-spritesheet.png";

        // Sprite de explosión
        this.explosionSprite = new Image();
        this.explosionSprite.src = "js/games/flappy/assets/images/runner/explosion-spritesheet.png";

        this.debug = false;
    }

    draw() {
        const m = this.runner;

        // Si está explotando → dibujar explosión
        if (m.isExploding) {
            this.drawExplosion();
            return;
        }

        // Si NO está explotando → dibujar runner normal
        if (!this.sprite.complete) return; // esperar carga

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

    drawExplosion() {
        const m = this.runner;

        if (!this.explosionSprite.complete) return;

        // Posición centrada respecto al runner
        const drawX = m.x + m.width / 2 - m.explosionWidth / 2;
        const drawY = m.y + m.height / 2 - m.explosionHeight / 2;

        this.ctx.drawImage(
            this.explosionSprite,
            m.explosionCurrentFrame * m.explosionFrameWidth,
            0,
            m.explosionFrameWidth,
            m.explosionFrameHeight,
            drawX,
            drawY,
            m.explosionWidth,
            m.explosionHeight
        );
    }


    // Método para activar/desactivar debug
    toggleDebug() {
        this.debug = !this.debug;
    }

}
