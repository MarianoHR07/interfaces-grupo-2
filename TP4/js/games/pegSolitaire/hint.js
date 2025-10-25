// ############################################
//   clase animacion o sugerencias visuales
// ############################################

export class Hint {
    constructor(board) {
        this.board = board;
        this.hints = []; // {fila, columna, alfa, escala}
        this.running = false;
        this.t = 0;
    }

    computeHintsForPiece(row,col) {
        this.hints = [];
        // const dirs = [[2,0],[-2,0],[0,2],[0,-2]];
        const dirs = [
            { dr: -2, dc: 0, angle: -Math.PI / 2 }, // arriba
            { dr: 2, dc: 0, angle: Math.PI / 2 },   // abajo
            { dr: 0, dc: -2, angle: Math.PI },      // izquierda
            { dr: 0, dc: 2, angle: 0 }              // derecha
        ];

        for (const [dr,dc, angle] of dirs) {
            const tr = row + dr;
            const tc = col + dc;
            if (Helpers.insideBoard(tr, tc) && this.board.isValidMove(row, col, tr, tc)) {
                this.hints.push({
                    row:tr,
                    col:tc,
                    alpha:0.3,
                    scale:1,
                    angle // orientación guardada
                });
            }
        }
    }

    start() { 
        this.running = true; 
        this.t = 0; 
        this.loop(); 
    }

    stop() { 
        this.running = false; 
    }

    loop() {
        if (!this.running) return;
        this.t += 0.03;
        // animar pulsaciones
        for (const h of this.hints) {
            h.alpha = 0.3 + 0.4 * Math.abs(Math.sin(this.t * 3));
            h.scale = 1 + 0.08 * Math.abs(Math.sin(this.t*3));
        }
        requestAnimationFrame(()=>this.loop());
    }


    draw(ctx) {
        for (const h of this.hints) {
            const center = Helpers.cellToCenter(h.row, h.col);
            ctx.save();
            ctx.globalAlpha = h.alpha;
            ctx.translate(center.x, center.y);
            ctx.rotate(h.angle); // ahora gira la flecha según su dirección
            ctx.scale(h.scale, h.scale);

            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2;

            // triángulo de flecha
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(12, 6);
            ctx.lineTo(-12, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
}

// window.HintAnimator = HintAnimator;


