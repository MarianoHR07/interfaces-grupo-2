// ################################
//           clase ficha 
// ################################

export class Piece {
    constructor(id, img, x, y) {
        this.id = id;     // id dinamico, esta asociado al id del slot en el que esta posicionado actualmente
        this.img = img;
        this.x = x;       // coordenada X del centro del slot
        this.y = y;       // coordenada Y del centro del slot
        this.width = 40;
        this.height = 46;
        this.isDragging = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Si la pieza está siendo arrastrada, aplico el efecto
        if (this.isDragging) {
            ctx.shadowColor = "rgba(0, 255, 0, 1)"; 
            ctx.shadowBlur = 22; 
            ctx.scale(1.15, 1.15); 
        } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
        }

        ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }

    // corrobora si el punto se encuentra dentro de los limites de la ficha
    containsPoint(px, py) {
        return (
            (px >= this.x - this.width / 2 && px <= this.x + this.width / 2 ) &&
            (py >= this.y - this.height / 2 && py <= this.y + this.height / 2)
        );
    }

    // Posicion de la pieza en el canvas
    setPixelPos(x, y) {
        this.x = x;
        this.y = y;
    }

}

