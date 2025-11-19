export class BonusView {
    constructor(ctx) {
        this.ctx = ctx;
    }

    draw(bonus) {
        if (!bonus.sprite.complete) return; // esperar carga
        const frameX = bonus.currentFrame * bonus.frameWidth;
        
        this.ctx.drawImage(
            bonus.sprite,
            frameX,
            0,
            bonus.frameWidth,
            bonus.frameHeight,
            bonus.x,
            bonus.y,
            bonus.frameWidth * bonus.scale,
            bonus.frameHeight * bonus.scale
        );

        // this.ctx.drawImage(
        //     bonus.sprite,
        //     bonus.currentFrame * bonus.frameWidth, // recorte X
        //     0,                                     // recorte Y
        //     bonus.frameWidth,
        //     bonus.frameHeight,

        //     bonus.x,
        //     bonus.y,
        //     bonus.frameWidth,
        //     bonus.frameHeight
        // );
    }
}
