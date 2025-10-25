// ###############################################
//     clase de deteccion de interacciones del jugador
// ###############################################
import { Helpers } from "../utils/chelpers.js";

export class DragController {
    constructor(canvas, board, hintAnimator, assets) {
        this.canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas.getContext('2d');
        this.board = board;
        this.hint = hintAnimator;
        this.assets = assets;
        this.selected = null;
        this.mouse = {x:0, y:0};
        this.moves = 0;
        this.onMoveCallbacks = [];
        this.draggingPiece = null;
        this.attachEvents();
        Helpers.setCanvasRect(canvas.getBoundingClientRect());
    }

    attachEvents(){
        const c = this.canvas;
        // Eventos de mouse
        c.addEventListener('mousedown', e => this.onDown(e)); //se ejecuta cuando el usuario hace clic sobre el canvas.
        c.addEventListener('mousemove', e => this.onMove(e));  //se ejecuta cuando el mouse se mueve sobre el canvas arrastrando la ficha.
        window.addEventListener('mouseup', e => this.onUp(e));  //se ejecuta cuando el usuario suelta el botón del mouse.
    }

    onDown(event) {
        const { offsetX, offsetY } = this.getMousePos(event);
        const row = Math.floor(offsetY / this.board.cellSize);
        const col = Math.floor(offsetX / this.board.cellSize);
        const piece = this.board.getPiece(row, col);
        if (piece && piece.isPlayable) {
            this.draggingPiece = piece;
            piece.startX = piece.x;
            piece.startY = piece.y;
        }
        if (this.hint) {
            this.hint.computeHintsForPiece(row, col);
            this.hint.start();
        }
        // if (this.hint) this.hint.stop();
    }

     onMove(event) {
        if (!this.draggingPiece) return;
        const { offsetX, offsetY } = this.getMousePos(event);
        this.draggingPiece.x = offsetX;
        this.draggingPiece.y = offsetY;
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
        };
    }

    onUp(event) {
        if (!this.draggingPiece) return;

        const { offsetX, offsetY } = this.getMousePos(event);

        // Calculo la fila y columna más cercana
        const row = Math.round(offsetY / this.board.cellSize);
        const col = Math.round(offsetX / this.board.cellSize);

        // Permito un margen para soltar (30% del tamaño de la celda)
        const tolerance = this.board.cellSize * 0.3;
        const centerX = col * this.board.cellSize + this.board.cellSize / 2;
        const centerY = row * this.board.cellSize + this.board.cellSize / 2;
        const dx = offsetX - centerX;
        const dy = offsetY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let moved = false;

        // Si soltó dentro del área de tolerancia, intento el movimiento
        if (distance < tolerance) {
            moved = this.board.tryMove(this.draggingPiece.row, this.draggingPiece.col, row, col);
        }

        // Si no fue válido, vuelvo la ficha a su posición original
        if (!moved) {
            this.draggingPiece.resetPosition();
        }

        // Detengo el hint al soltar
        if (this.hint) this.hint.stop();

        this.draggingPiece = null;
    }


    animatePieceToCell(piece, row, col) {
        return new Promise(res => {
            const target = Helpers.cellToCenter(row, col);
            const start = {x: piece.x, y: piece.y};
            const dur = 220;
            const startT = performance.now();
            const step = (t) => {
                const p = Math.min(1, (t - startT) / dur);
                const ease = (1 - Math.cos(Math.PI * p)) / 2;
                piece.setPixelPos(
                    start.x + (target.x - start.x) * ease,
                    start.y + (target.y - start.y) * ease
                );
                if (p < 1) requestAnimationFrame(step);
                else res();
            };
            requestAnimationFrame(step);
        });
    }

    onMoveMade(cb){ this.onMoveCallbacks.push(cb); }
}

// window.DragController = DragController;
