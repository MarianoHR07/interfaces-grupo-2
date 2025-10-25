// ########################################################
//      Manejo de los movimientos validos en el tablero
// ########################################################
import { Helpers } from "../utils/chelpers.js";


export class HintAnimator {
    constructor(board) {
        this.board = board;
        this.hints = []; // {fromRow, fromCol, toRow, toCol}
        this.animTime = 0;
        this.active = false;
    }

    computeHintsForPiece(row, col) {
        this.hints = [];
        if (!Helpers.insideBoard(row, col)) return;
        const dirs = [[-2,0],[2,0],[0,-2],[0,2]]; // arriba, abajo, izq, der

        for (const [dr, dc] of dirs) {
            const toRow = row + dr;
            const toCol = col + dc;
            if (this.board.isValidMove(row, col, toRow, toCol)) {
                this.hints.push({fromRow: row, fromCol: col, toRow, toCol});
            }
        }
    }

    start() {
        if (this.hints.length > 0) {
            this.animTime = 0;
            this.active = true;
        }
    }

    stop() {
        this.active = false;
        this.hints = [];
    }

    draw(ctx) {
        if (!this.active) return;
        this.animTime += 0.05;
        const alpha = 0.5 + 0.5 * Math.sin(this.animTime * 3);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";

        for (const h of this.hints) {
            const from = Helpers.cellToCenter(h.fromRow, h.fromCol, this.board.cellSize);
            const to = Helpers.cellToCenter(h.toRow, h.toCol, this.board.cellSize);

            // Línea base
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            // Flecha orientada
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const arrowLen = 15;
            ctx.beginPath();
            ctx.moveTo(to.x, to.y);
            ctx.lineTo(
                to.x - arrowLen * Math.cos(angle - Math.PI / 6),
                to.y - arrowLen * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                to.x - arrowLen * Math.cos(angle + Math.PI / 6),
                to.y - arrowLen * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = "lime";
            ctx.fill();
        }

        ctx.restore();
    }
}
