// ###############################################
//     clase de deteccion de interacciones del jugador
// ###############################################
import { Helpers } from "../utils/chelpers.js";

export class DragController {
    constructor(canvas, board, hintAnimator, assets) {
        this.canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas.getContext("2d");
        this.board = board;
        this.hint = hintAnimator;
        this.assets = assets;
        this.draggingPiece = null;
        this.mouse = { x: 0, y: 0 };
        this.onMoveCallbacks = [];
        this.moves = 0;

        this.attachEvents();
        Helpers.setCanvasRect(canvas.getBoundingClientRect());
    }

    // #############################
    // EVENTOS PRINCIPALES
    // #############################
    attachEvents() {
        const c = this.canvas;
         // Eventos de mouse
        c.addEventListener('mousedown', e => this.onDown(e)); //se ejecuta cuando el usuario hace clic sobre el canvas.
        c.addEventListener('mousemove', e => this.onMove(e));  //se ejecuta cuando el mouse se mueve sobre el canvas arrastrando la ficha.
        window.addEventListener('mouseup', e => this.onUp(e));  //se ejecuta cuando el usuario suelta el botón del mouse.
    }

    // Cuando se hace clic sobre una pieza
    onDown(event) {
        const { offsetX, offsetY } = this.getMousePos(event);
        this.mouse = { x: offsetX, y: offsetY };

        // Busco la pieza más cercana al click
        const piece = this.board.pieces.find((p) =>
            p.containsPoint(offsetX, offsetY)
        );

        if (piece) {
            this.draggingPiece = piece;
            piece.startX = piece.x;
            piece.startY = piece.y;

            if (this.hint) {
                this.hint.computeHintsForPiece(piece.slotId);
                this.hint.start();
            }
        }
    }

    // Cuando se mueve el mouse con una pieza agarrada
    onMove(event) {
        if (!this.draggingPiece) return;

        const { offsetX, offsetY } = this.getMousePos(event);
        this.draggingPiece.x = offsetX;
        this.draggingPiece.y = offsetY;
    }

    // Cuando se suelta la pieza
    onUp(event) {
        if (!this.draggingPiece) return;

        const { offsetX, offsetY } = this.getMousePos(event);
        this.mouse = { x: offsetX, y: offsetY };

        // Busco el slot más cercano al punto donde soltó
        const nearestSlot = this.board.slots.reduce((closest, slot) => {
            const dist = Math.hypot(
                slot.center.x - offsetX,
                slot.center.y - offsetY
            );
            if (!closest || dist < closest.dist)
                return { slot, dist };
            return closest;
        }, null);

        let moved = false;
        if (nearestSlot && nearestSlot.dist < nearestSlot.slot.size * 0.6) {
            // Intento movimiento
            moved = this.board.tryMove(this.draggingPiece.slotId, nearestSlot.slot.id);
        }

        // Si no se pudo mover, vuelvo la ficha a su posición original
        if (!moved) {
            this.draggingPiece.setPixelPos(this.draggingPiece.startX, this.draggingPiece.startY);
        }

        // Detengo los hints
        if (this.hint) this.hint.stop();

        this.draggingPiece = null;
    }

    // #############################
    // UTILIDADES
    // #############################
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
        };
    }

    // Animación (opcional, por si querés suavizar el movimiento futuro)
    animatePieceToSlot(piece, targetSlot) {
        return new Promise((res) => {
            const start = { x: piece.x, y: piece.y };
            const end = targetSlot.center;
            const dur = 200;
            const startT = performance.now();

            const step = (t) => {
                const p = Math.min(1, (t - startT) / dur);
                const ease = (1 - Math.cos(Math.PI * p)) / 2;
                piece.setPixelPos(
                    start.x + (end.x - start.x) * ease,
                    start.y + (end.y - start.y) * ease
                );
                if (p < 1) requestAnimationFrame(step);
                else res();
            };

            requestAnimationFrame(step);
        });
    }

    onMoveMade(cb) {
        this.onMoveCallbacks.push(cb);
    }
}
