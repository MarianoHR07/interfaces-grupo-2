// ################################
//           clase ficha 
// ################################

export class Piece {
    constructor(row, col, img, type = 'default') {
        this.row = row;
        this.col = col;
        this.img = img;
        this.type = type;
        this.x = col * 80 + 40; // pixel center
        this.y = row * 80 + 40;
        this.radius = 30;
        this.isDragging = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        // draw image centered
        ctx.drawImage(this.img, -30, -30, 60, 60);
        ctx.restore();
    }

    containsPoint(px, py) {
        return Math.hypot(px - this.x, py - this.y) <= this.radius;
    }

    moveToCell(row, col) {
        this.row = row; 
        this.col = col;
        const c = Helpers.cellToCenter(row, col);
        this.x = c.x; this.y = c.y;
    }

    setPixelPos(x, y) { this.x = x; this.y = y; }

}

// window.Piece = Piece;
