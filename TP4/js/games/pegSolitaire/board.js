// #############################
//       clase tablero
// #############################
import { Helpers } from "./utils/chelpers.js";
import { Piece } from "./piece.js";


export class Board {
    constructor(canvas, rows = 7, cols = 7) {
        this.rows = rows; 
        this.cols = cols;
        this.grid = []; // -1 invalido, 0 vacio, 1 acierto/ficha
        this.pieces = []; // Instancias de piezas
        this.assets = null;

        this.canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas ? canvas.getContext("2d") : null;

        this.cellSize = Math.floor(Math.min(canvas.width, canvas.height) / this.rows);

        this.initGrid();
    }

    initGrid() {
        // Disposición clásica del solitario inglés: esquinas no válidas
        const I = -1, E = 0, P = 1;

        const layout = [
            [I,I,P,P,P,I,I],
            [I,I,P,P,P,I,I],
            [P,P,P,P,P,P,P],
            [P,P,P,E,P,P,P],
            [P,P,P,P,P,P,P],
            [I,I,P,P,P,I,I],
            [I,I,P,P,P,I,I],
        ];

        this.grid = layout.map(r => r.slice());
    }

    resetPieces(img) {
        this.pieces = [];
        for (let r = 0; r < this.rows; r++){
            for (let c = 0; c < this.cols; c++){
                if (this.grid[r][c] === 1) {
                    const center = Helpers.cellToCenter(r, c, this.cellSize);
                    const p = new Piece(r, c, img, center.x, center.y);
                    this.pieces.push(p);
                }
            }
        }
    }


    getPieceAt(row,col) {
        return this.pieces.find(p => p.row === row && p.col === col);
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        if (!Helpers.insideBoard(fromRow,fromCol) || !Helpers.insideBoard(toRow,toCol)) return false;
        if (this.grid[toRow][toCol] !== 0) return false;

        const dr = toRow - fromRow;
        const dc = toCol - fromCol;

        if (Math.abs(dr) === 2 && dc === 0) {
            const midr = fromRow + dr/2, midc = fromCol;
            return this.grid[midr][midc] === 1;
        }
        if (Math.abs(dc) === 2 && dr === 0) {
            const midr = fromRow, midc = fromCol + dc/2;
            return this.grid[midr][midc] === 1;
        }

        return false;
    }

    applyMove(fromRow,fromCol,toRow,toCol) {
        if (!this.isValidMove(fromRow,fromCol,toRow,toCol)) return false;

        const midr = (fromRow + toRow) / 2;
        const midc = (fromCol + toCol) / 2;

        // actualizar grid
        this.grid[fromRow][fromCol] = 0;
        this.grid[midr][midc] = 0;
        this.grid[toRow][toCol] = 1;

        // actualizar objeto "pieza"
        const moving = this.getPieceAt(fromRow,fromCol);
        const jumped = this.getPieceAt(midr,midc);

        // quitar pieza saltada
        if (jumped) {
            this.pieces = this.pieces.filter(p => p !== jumped);
        }

        if (moving) {
            moving.moveToCell(toRow, toCol, this.cellSize);
        }

        return true;
    }

    hasAnyMoves() { //compruebo si existe algún movimiento válido
        for (let r=0;r<7;r++){
            for (let c=0;c<7;c++){
                if (this.grid[r][c] === 1) {
                    const dirs = [[2,0],[-2,0],[0,2],[0,-2]];
                    for (const [dr,dc] of dirs) {
                        const nr = r+dr, nc = c+dc;
                        if (Helpers.insideBoard(nr,nc) && this.isValidMove(r,c,nr,nc)) return true;
                    }
                }
            }
        }
        return false;
    }

    draw(ctx) {
        for (const p of this.pieces) p.draw(ctx);
    }


    tryMove(fromRow, fromCol, toRow, toCol) {
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;

        const movingPiece = this.getPiece(fromRow, fromCol);
        const jumpedPiece = this.getPiece(midRow, midCol);
        const targetCellEmpty = !this.getPiece(toRow, toCol);

        // Validación básica
        if (!movingPiece || !jumpedPiece || !targetCellEmpty) return false;
        if (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 0 ||
            Math.abs(fromCol - toCol) === 2 && Math.abs(fromRow - toRow) === 0) {
            
            // Ejecutar el movimiento
            this.setPiece(toRow, toCol, movingPiece);
            this.removePiece(midRow, midCol);
            this.removePiece(fromRow, fromCol);
            movingPiece.moveTo(toRow, toCol);
            return true;
        }

        return false;
    }

}

// window.Board = Board;

