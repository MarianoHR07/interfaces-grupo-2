// ###############################################
//     clase de deteccion de interacciones del jugador
// ###############################################
import { Helpers } from "../utils/chelpers.js";

export class DragController {
    constructor(canvas, board, hintAnimator) {
        this.canvas = canvas;
        this.board = board;
        this.hint = hintAnimator;
    
        /** @type {Piece} */
        this.draggingPiece = null;
    
        this.mouse = { x: 0, y: 0 };
        this.onMoveCallbacks = [];
        this.moves = 0;

        this.attachEvents();
        Helpers.setCanvasRect(canvas.getBoundingClientRect());
    }


    attachEvents() {
        const c = this.canvas;
        // Eventos de mouse
        c.addEventListener('mousedown', e => this.onDown(e)); //se ejecuta cuando el usuario hace clic sobre el canvas.
        c.addEventListener('mousemove', e => this.onMove(e));  //se ejecuta cuando el mouse se mueve sobre el canvas arrastrando la ficha.
        window.addEventListener('mouseup', e => this.onUp(e));  //se ejecuta cuando el usuario suelta el botón del mouse.
    }


    // Cuando se hace clic sobre una pieza
    onDown(event) {
        const { offsetX, offsetY } = this.getMousePos(event); // obtengo el punto (x,y) donde tengo el mouse
        this.mouse = { x: offsetX, y: offsetY };

        // Busco si el mouse esta posicionado sobre una pieza y si el slot contiene esta pieza
        const piece = this.board.getPieceAtSlot(this.mouse.x, this.mouse.y)

        if (piece) {
            this.draggingPiece = piece; // le damos al controlador la pieza con la cual debera interactuar (redibujar)
            
            // Guardo la posición original de la pieza antes de arrastrarla.
            // Sirven para poder volver la ficha a su lugar original si el jugador suelta en una posición inválida
            piece.startX = piece.x;
            piece.startY = piece.y;

            if (this.hint) {
                this.hint.computeHintsForPiece(piece.id);
                this.hint.start();
            }

        }

        if (piece) {
            this.draggingPiece = piece;
            piece.isDragging = true;
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
        if (this.draggingPiece) {
            this.draggingPiece.isDragging = false; 
        }

        if (!this.draggingPiece) return;

        const { offsetX, offsetY } = this.getMousePos(event);
        this.mouse = { x: offsetX, y: offsetY };
        
         // a la pieza que estoy desplazando le agrego el arr de movimientos validos
        this.draggingPiece.validTargets = this.board.getValidMovesFrom(this.draggingPiece.id);
        const validTargets = this.draggingPiece.validTargets;
        
        let moved = false;
        if(validTargets){
            validTargets.forEach(slot => { 
                if (this.board.isValidArea(this.mouse.x, this.mouse.y, slot.id)){
                    moved = this.board.tryMove(this.draggingPiece.id,  this.mouse);
                }
            });
        } 
        
        // Si me intento mover a una posicion invalida, vuelvo la ficha a su posición original
        if (!moved) {
            this.draggingPiece.setPixelPos(this.draggingPiece.startX, this.draggingPiece.startY);
        }else {
            this.moves++;
            this.board.checkGameState(); // luego de haber movido la pieza chequea el estado del juego, delegando la lógica al board
            this.onMoveCallbacks.forEach(callback => callback(this.moves)); // notifica el cambio en moves a todos los que escuchan el evento "move made"
        }
        // Detengo los hints
        if (this.hint) this.hint.stop();

        this.draggingPiece = null;
    }

   
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect(); // dimensiones del canvas 
        return {
            // distancia del mouse a la ventana del navegador(pared izquierda) - distancia del canvas a la ventana del navegador 
            offsetX: event.clientX - rect.left, // offsetX = posicion del mouse en eje X en el canvas 
            offsetY: event.clientY - rect.top, // offsetY = posicion del mouse en eje Y en el canvas
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

    // almacena los callback que el controlador debera disparar cuando se efectue el movimiento de una pieza(evento onUp)
    onMoveMade(callback) {
        this.onMoveCallbacks.push(callback);
    }
}
