// ########################################################
//      Manejo de los movimientos validos en el tablero
// ########################################################
import { Helpers } from "../utils/chelpers.js";


export class HintAnimator {
    constructor(board) {
        this.board = board;
        this.animTime = 0;
        this.active = false; // interaccion del usuario con una pieza del tablero (mouseDown)
        this.validTargets = []; // posiciones validas a las que se puede mover X ficha
    }


    computeHintsForPiece(slotId) {
        this.validTargets = this.board.getValidMovesFrom(slotId);
    }


    start() {
        if (this.validTargets.length > 0) {
            this.animTime = 0;
            this.active = true;
        }
    }


    stop() {
        this.active = false;
        this.validTargets = [];
    }


    draw(ctx) { // Si la pieza esta activa (mouseDown) anima los slots validos(movimientos disponibles)
        if (!this.active || this.validTargets.length === 0) return;

        this.animTime += 0.05;
        const pulse = 0.5 + 0.5 * Math.sin(this.animTime * 3); // efecto de "parpadeo"

        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.5 + pulse * 0.5})`; // verde animado
        ctx.shadowBlur = 10;
        ctx.shadowColor = "lime";

        for (const slot of this.validTargets) {
            const { center, size } = slot;

            // Calcular posición superior izquierda
            const x = center.x - size.width / 2;
            const y = center.y - size.height / 2;
            const w = size.width;
            const h = size.height;

            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.stroke();
        }

        ctx.restore();
    }





}
