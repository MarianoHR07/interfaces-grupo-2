// #############################
//       clase tablero
// #############################
import { Helpers } from "./utils/chelpers.js";
import { Piece } from "./piece.js";


export class Board {
    constructor(canvas) {
        this.slots = [] ;
        this.pieces = []; // Instancias de piezas

        this.canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas ? canvas.getContext("2d") : null;
    }
   

    // Carga el JSON (ajustá la ruta según tu estructura real)
    async loadSlots(jsonFilePath) {
        try {
            const response = await fetch(jsonFilePath);
            this.slots = await response.json();
            console.log("Slots cargados:", this.slots);
        } catch (err) {
            console.error("❌ Error cargando slots:", err);
        }
    }


    // carga inicial del tablero / reiniciar juego
    resetPieces(img) {
        this.pieces = [];
        const emptySlotId = "slot_17";

        for (const slot of this.slots) {
            if (slot.id !== emptySlotId) {
                const { x, y } = slot.center;
                const piece = new Piece(slot.id, img, x, y, slot.size);
                this.pieces.push(piece);
                slot.piece = piece; // asociar pieza al slot
            }else {
                slot.piece = null;
            }
        }
    }


    getSlotById(id) {
        return this.slots.find(s => s.id === id);
    }


    // Devuelve el slot más cercano al punto (x, y)
    getSlotAt(x, y) { // x e y son las coordenadas donde posiciono el mouse
        return this.slots.find(slot => {
            const dx = x - slot.center.x;
            const dy = y - slot.center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < slot.size.width / 2;
        });
    }


    // getPieceAt(row,col) {
    //     return this.pieces.find(p => p.row === row && p.col === col);
    // }

    isValidMove(fromSlot, toSlot) {
        // ####################################################################
        // Aquí podrías definir reglas personalizadas, p.ej.:
        // - Debe haber una pieza en fromSlot
        // - toSlot debe estar vacío
        // - La distancia entre ambos debe ser aprox. el doble de un “salto”
        // ##################################################################

        // Si se clickea un slot y no tiene una pieza, o el slot que le sigue
        // a la pieza que desea saltar, esta ocupado, el mov es invalido
        if (!fromSlot.piece || toSlot.piece) return false;

        const dx = toSlot.center.x - fromSlot.center.x;
        const dy = toSlot.center.y - fromSlot.center.y;
        const dist = Math.sqrt(dx * dx + dy * dy); //distancia que me desplazo de un slot a otro

        // Ejemplo de regla simple (dependerá del espaciado real):
        
        // ********************************************
        return dist > 70 && dist < 140;// REEMPLAZAR CALCULOS DE DISTANCIA ENTRE DOS PIEZAS, POR DETERMINAR EL HERMANO DIRECTO DE LA QUE QUIERO SALTAR (SALTO LINEAL)
        // ********************************************
    }



    applyMove(fromSlot, toSlot) {
        if (!this.isValidMove(fromSlot, toSlot)) return false;

        // Encontrar el slot intermedio (a mitad de camino)
        const midX = (fromSlot.center.x + toSlot.center.x) / 2;
        const midY = (fromSlot.center.y + toSlot.center.y) / 2;
        const jumpedSlot = this.getSlotAt(midX, midY);

        if (!jumpedSlot || !jumpedSlot.piece) return false;

        // Actualizar estados
        toSlot.piece = fromSlot.piece;
        fromSlot.piece = null;
        jumpedSlot.piece = null;

        // Actualizar posición visual
        toSlot.piece.setPixelPos(toSlot.center.x, toSlot.center.y);

        // Eliminar pieza saltada del array de piezas
        this.pieces = this.pieces.filter(p => p !== jumpedSlot.piece);

        return true;
    }

    hasAnyMoves() {
        // Para cada pieza, comprobamos si puede saltar en alguna dirección
        for (const piece of this.pieces) {
            const fromSlot = this.slots.find(s => s.id === piece.slotId);
            if (!fromSlot) continue;

            // Cada dirección posible: arriba, abajo, izquierda, derecha
            const directions = [
                { dr: -1, dc: 0 }, // arriba
                { dr: 1, dc: 0 },  // abajo
                { dr: 0, dc: -1 }, // izquierda
                { dr: 0, dc: 1 }   // derecha
            ];

            for (const dir of directions) {
                const mid = this.getSlotByOffset(fromSlot, dir, 1);
                const target = this.getSlotByOffset(fromSlot, dir, 2);

                if (!mid || !target) continue;

                const hasMidPiece = this.getPieceAtSlot(mid.id);
                const targetOccupied = this.getPieceAtSlot(target.id);

                // Movimiento válido = hay ficha intermedia y destino vacío
                if (hasMidPiece && !targetOccupied) {
                    return true;
                }
            }
        }
        return false;
    }

    draw(ctx = this.ctx) {
        for (const piece of this.pieces) {
            piece.draw(ctx);
        }
    }

    // ejecuta el salto real: mueve la ficha y elimina la intermedia.
    tryMove(fromSlotId, toSlotId) {
        const fromPiece = this.getPieceAtSlot(fromSlotId);
        if (!fromPiece) return false;

        const fromSlot = this.slots.find(s => s.id === fromSlotId);
        const toSlot = this.slots.find(s => s.id === toSlotId);
        if (!fromSlot || !toSlot) return false;

        const dir = this.getDirection(fromSlot, toSlot);
        if (!dir) return false; // No es una dirección válida (salto recto)

        const midSlot = this.getSlotByOffset(fromSlot, dir, 1);
        if (!midSlot) return false;

        const jumpedPiece = this.getPieceAtSlot(midSlot.id);
        const targetOccupied = this.getPieceAtSlot(toSlot.id);

        if (!jumpedPiece || targetOccupied) return false;

        // Movimiento válido: eliminamos la del medio y movemos la ficha
        this.pieces = this.pieces.filter(p => p !== jumpedPiece);
        fromPiece.slotId = toSlot.id;
        fromPiece.setPixelPos(toSlot.center.x, toSlot.center.y);

        return true;
    }

    getPieceAtSlot(slotId) {
        return this.pieces.find(p => p.slotId === slotId);
    }

    // Calcula la dirección (vertical u horizontal)
    getDirection(fromSlot, toSlot) {
        const dx = toSlot.center.x - fromSlot.center.x;
        const dy = toSlot.center.y - fromSlot.center.y;
        const dist = Math.hypot(dx, dy);

        // Si no están alineados horizontal o verticalmente, no es válido
        if (Math.abs(dx) > 1 && Math.abs(dy) > 1) return null;

        const step = fromSlot.size * 1.05; // separación entre centros
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? { dr: 0, dc: 1 } : { dr: 0, dc: -1 };
        } else if (Math.abs(dy) > 0) {
            return dy > 0 ? { dr: 1, dc: 0 } : { dr: -1, dc: 0 };
        }
        return null;
    }

    // Encuentra slot desplazado desde otro
    getSlotByOffset(fromSlot, dir, steps = 1) {
        const dx = dir.dc * fromSlot.size * 1.05 * steps;
        const dy = dir.dr * fromSlot.size * 1.05 * steps;
        const targetX = fromSlot.center.x + dx;
        const targetY = fromSlot.center.y + dy;
        return this.slots.find(s => Math.hypot(s.center.x - targetX, s.center.y - targetY) < 5);
    }

}

// window.Board = Board;

