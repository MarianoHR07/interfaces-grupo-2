export class BonusView {
    constructor(ctx) {
        this.ctx = ctx;

        // Destello al colisionar
        this.flashSprite = new Image();
        this.flashSprite.src = "js/games/flappy/assets/images/runner/flash-spritesheet.png";
    }

    draw(bonus) {
        // Si está en destello → dibujar el sprite de flash
        if (bonus.isFlashing && !bonus.flashFinished) {

            const sx = bonus.flashCurrentFrame * bonus.flashFrameWidth;

            this.ctx.drawImage(
                this.flashSprite,
                sx, 0,
                bonus.flashFrameWidth, bonus.flashFrameHeight,
                bonus.x - (bonus.flashWidth - bonus.width) / 2,   // centrar el flash
                bonus.y - (bonus.flashHeight - bonus.height) / 2,
                bonus.flashWidth,
                bonus.flashHeight
            );

            return;
        }
 
        // Si NO está flasheando → dibujar bonus normal
        const sx = bonus.currentFrame * bonus.frameWidth;
        this.ctx.drawImage(
            bonus.sprite,
            sx, 0,
            bonus.frameWidth, bonus.frameHeight,
            bonus.x, bonus.y,
            bonus.width, bonus.height
        );
        
    }
}
