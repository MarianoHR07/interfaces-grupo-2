export class CoinView {
    constructor(ctx, x=10, y=10, initialCount = 0) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        // Sprite de la moneda
        this.coinImg = new Image();
        this.coinImg.src = "js/games/flappy/assets/images/items/coin.png";

        // Tamaño de la moneda  
        this.coinSize = 42;
        this.spacing = 8;
        this.count = initialCount;
    }

    // Llamá a esto cuando el jugador agarre una moneda
    setCount(newValue) {
        this.count = newValue;
    }
    draw(score) {
        this.count = score;

        this.ctx.drawImage(
            this.coinImg,
            this.x,
            this.y,
            this.coinSize,
            this.coinSize
        );
        // Texto del contador
        this.ctx.font = "24px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black"; 
        this.ctx.lineWidth = 4;

        const text = "x " + this.count;

        const textX = this.x + this.coinSize + this.spacing; 
        const textY = this.y + this.coinSize * 0.7;          

        this.ctx.strokeText(text, textX, textY);
        this.ctx.fillText(text, textX, textY);
    
    }
}