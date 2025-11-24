// export class BonusView {
//     /**
//      * @param {CanvasRenderingContext2D} ctx  
//      */
//     constructor(ctx) {
//         this.ctx = ctx;
//     }

//     draw(bonus) {

//         if (!bonus.sprite.complete) return; // esperar carga
        
//         const b = bonus;
//         const sx = b.currentFrame * b.frameWidth; // sx hacer el recorte del frame actual (posición X del frame actual en el sprite sheet)
//         this.ctx.drawImage(
//             b.sprite,
//             sx, 0, b.frameWidth, b.frameHeight,
//             b.x, b.y, b.width, b.height
//         );
//     }
// }


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
