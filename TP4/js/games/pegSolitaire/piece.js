// ################################
//           clase ficha 
// ################################

export class Piece {
    // constructor(id, row, col, img, type = 'default') {
    //     this.id = id;
    //     this.row = row;
    //     this.col = col;
    //     this.img = img;
    //     this.type = type;
    //     this.x = col * 80 + 40; // pixel center
    //     this.y = row * 80 + 40;
    //     this.radius = 30;
    //     this.isDragging = false;
    // }


    constructor(id, img, x, y, size) {
        this.id = id;
        this.img = img;
        this.x = x;       // coordenada X del centro del slot
        this.y = y;       // coordenada Y del centro del slot
        this.width = size.width;
        this.height = size.height;
        this.isDragging = false;
    }

    draw(ctx) {
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
        ctx.restore();
    }

    containsPoint(px, py) {
        return (
            px >= this.x - this.width / 2 &&
            px <= this.x + this.width / 2 &&
            py >= this.y - this.height / 2 &&
            py <= this.y + this.height / 2
        );
    }


    setPixelPos(x, y) {
        this.x = x;
        this.y = y;
    }

}

// window.Piece = Piece;
