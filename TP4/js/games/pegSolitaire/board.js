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
   

    // Carga los slots desde el JSON
    async loadSlots(jsonFilePath) {
        try {
            const response = await fetch(jsonFilePath);
            this.slots = await response.json();
            // console.log("JSON_SLOTS",this.slots);
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
                const piece = new Piece(slot.id, img, x, y);
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


    isValidMove(fromSlot, toSlot) {
        // ####################################################################
        // Aquí podriamos definir reglas personalizadas, p.ej.:
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
        return this.tryMove(fromSlot.id, toSlot.id);
    }


    hasAnyMoves() {
        for (const piece of this.pieces) {
            const moves = this.getValidMovesFrom(piece.id);
            if (moves.length > 0) return true;
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
        const fromSlot = this.getSlotById(fromSlotId);
        const toSlot = this.getSlotById(toSlotId);
        if (!fromSlot || !toSlot || !fromSlot.piece || toSlot.piece) return false;

        const dir = this.getDirection(fromSlot, toSlot);
        if (!dir) return false; // No es una dirección válida (salto recto)

        const midSlot = this.getSlotByOffset(fromSlot, dir, 1);
        if (!midSlot || !midSlot.piece) return false;

        // Movimiento válido: eliminar la del medio y mover la ficha
        const movingPiece = fromSlot.piece;
        const jumpedPiece = midSlot.piece;

        fromSlot.piece = null;
        midSlot.piece = null;
        toSlot.piece = movingPiece;

        movingPiece.id = toSlot.id;
        movingPiece.setPixelPos(toSlot.center.x, toSlot.center.y);

        this.pieces = this.pieces.filter(p => p !== jumpedPiece);

        return true;
    }


    getPieceAtSlot(slotId) {
        return this.pieces.find(p => p.id === slotId);
    }


    // Calcula la dirección (vertical u horizontal)
    getDirection(fromSlot, toSlot) {
        // { dr: 0, dc: 1 } = derecha
        // { dr: 0, dc: -1 } = izquierda
        // { dr: 1, dc: 0 } = abajo
        // { dr: -1, dc: 0 } = arriba
        const dx = toSlot.center.x - fromSlot.center.x;
        const dy = toSlot.center.y - fromSlot.center.y;

        // Alineación más fuerte define la dirección
        if (Math.abs(dx) > Math.abs(dy)) {
            return { dr: 0, dc: Math.sign(dx) };
        } else {
            return { dr: Math.sign(dy), dc: 0 };
        }
    }


    // Busca el slot vecino más cercano en la dirección dada, ya que los slots no están perfectamente alineados (tienen un espaciado irregular)
    getSlotByOffset(fromSlot, dir, steps = 1) {
        // Definimos cuánto margen de diferencia aceptamos para considerar que dos slots están en la misma fila o columna
        const tolerance = 15; 

        const candidates = this.slots
            .map(s => ({
                slot: s,
                dx: s.center.x - fromSlot.center.x, // cuánto se desplaza en el eje X respecto al slot origen
                dy: s.center.y - fromSlot.center.y  // cuánto se desplaza en el eje Y respecto al slot origen
            }))
            .filter(c => {  // Filtramos los slots que realmente están alineados y en la dirección correcta
                // Si nos movemos verticalmente (dr ≠ 0), los X deben ser casi iguales (|dx| < tolerance)
                if (dir.dr !== 0 && Math.abs(c.dx) > tolerance) return false;
                // Si nos movemos horizontalmente (dc ≠ 0), los Y deben ser casi iguales (|dy| < tolerance)
                if (dir.dc !== 0 && Math.abs(c.dy) > tolerance) return false;

                // verifico que el slot esté hacia adelante en la dirección elegida
                // descarta diagonales o slots que estén a los costados
                const dot = c.dx * dir.dc + c.dy * dir.dr;
                return dot > 0;
            })
            .map(c => ({
                ...c,
                dist: Math.hypot(c.dx, c.dy)  // Calcula la distancia euclidiana entre el slot actual y el origen
                                              // Sirve para saber cuál está “más cerca” en esa dirección
            }))
            .sort((a, b) => a.dist - b.dist);  // Ordena los candidatos por distancia desde el slot origen, asi l más cercano está primero (steps=1) y el siguiente después (steps=2),...

        return candidates[steps - 1]?.slot || null;  // Devuelve el slot correspondiente a la cantidad de pasos deseada
                                                        // steps=1 → el slot inmediatamente contiguo.
                                                        // steps=2 → el siguiente después de ese.
                                                        // Si no hay suficientes slots alineados, devuelve null.
    }



    // Obtener movimientos válidos que puede realizar el slot especificado
    getValidMovesFrom(slotId) {
        console.log("entre a get valid board", slotId);
        const fromSlot = this.getSlotById(slotId); // obtengo el slot con ID = slotId
        console.log("Fom slot:", fromSlot);
        if (!fromSlot || !fromSlot.piece) return [];

        const validTargets  = [];

        // Direcciones posibles: arriba, abajo, izquierda, derecha
        const directions = [
            // 0: no me muevo
            // 1: me muevo una posicion hacia abajo/derecha
            // -1: me muevo una posicion a arriba/izquierda
            { dr: -1, dc: 0 }, // arriba
            { dr: 1, dc: 0 },  // abajo
            { dr: 0, dc: -1 }, // izquierda
            { dr: 0, dc: 1 }   // derecha
        ];

        for (const dir of directions) {
            const midSlot = this.getSlotByOffset(fromSlot, dir, 1);   // Slot intermedio/salteado (1 paso)
            const targetSlot = this.getSlotByOffset(midSlot, dir, 1);  // Slot destino (2 pasos)
            console.log("mid slot----", midSlot);
            console.log("target slot+++++", targetSlot);
            
            // Si no existe pieza en el slot que quiero saltar o no existe pieza en el slot al que quiero saltar, saltá este ciclo y probá la siguiente dirección.
            if (!midSlot || !targetSlot) continue;

            if (midSlot.piece && !targetSlot.piece) {
                console.log("aquiii en for de tranqui");
                validTargets.push(targetSlot);
            }

        }

        return validTargets;
    }


}


