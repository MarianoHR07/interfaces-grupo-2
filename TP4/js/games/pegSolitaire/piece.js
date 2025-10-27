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
        ctx.font = "12px Arial";
        ctx.fillStyle = "yellow";
        ctx.save();
        // Dibuja la imagen centrada en (x, y)
        ctx.translate(this.x, this.y);
        ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.fillText(this.id, -this.width / 2, -this.height / 2);
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

