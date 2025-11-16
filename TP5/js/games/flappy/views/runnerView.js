export class RunnerView {
    constructor(runner, ctx) {
        this.runner = runner;
        this.ctx = ctx;

        this.sprite = new Image();
        this.sprite.src = "js/games/flappy/assets/images/runner/runner-spritesheet.png";
    }

    draw() {
        const m = this.runner;

        this.ctx.drawImage(
            this.sprite,
            m.currentFrame * m.frameWidth, // frame X en el sprite
            0,
            m.frameWidth,
            m.frameHeight,
            m.x,
            m.y,
            m.frameWidth * m.scale,
            m.frameHeight * m.scale
        );
    }
}
