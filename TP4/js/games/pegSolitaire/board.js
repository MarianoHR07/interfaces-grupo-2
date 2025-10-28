// #############################
//       clase tablero
// #############################
import { Helpers } from "./utils/chelpers.js";
import { Piece } from "./piece.js";


export class Board {
    constructor(canvas,boardImg) {
        this.slots = [] ;
        this.pieces = []; // Instancias de piezas
        this.boardImg = boardImg
        this.canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas ? canvas.getContext("2d") : null;
    }
   

    // Carga los slots desde el JSON
    async loadSlots(jsonFilePath) {
        try {
            const response = await fetch(jsonFilePath);
            this.slots = await response.json();
        } catch (err) {
            console.error("❌ Error cargando slots:", err);
        }
    }


    // carga inicial del tablero / reiniciar juego
    resetPieces(img) {
        this.pieces = [];
        const emptySlotId = "slot_17"; // A FUTURO DEBERIAMOS CALCULAR EL CENTRAL EN BASE AL # DE SLOT EN TODAS LAS DIRECCIONES. Si (⬆,⬇,➡,⬅)=(3,3,3,3) 3 slot en cada direccion => slot central "getSlotByOffset(fromSlot, dir, steps = 3)"
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
    // Determina si el mouse se encuentra posicionado en el area que contiene el slot
    isValidArea(mouseX, mouseY, slotId) {
        const slot = this.getSlotById(slotId);
        return (
            (mouseX >= slot.center.x - slot.size.width / 2 && mouseX <= slot.center.x + slot.size.width / 2 ) &&
            (mouseY >= slot.center.y - slot.size.height / 2 && mouseY <= slot.center.y + slot.size.height / 2)
        );
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
        ctx.drawImage(this.boardImg, 0, 0, this.canvas.width, this.canvas.height); // dibuja el tablero 
        // dibuja cada una de las piezas sobre el tablero
        for (const piece of this.pieces) {
            piece.draw(ctx);
        }
    }


    // ejecuta el salto real: mueve la ficha y elimina la intermedia.
    tryMove(fromSlotId, mousePos) {
        const validTargets = this.getValidMovesFrom(fromSlotId);
        //const validTargets = this.draggingPiece.validTargets;
        const fromSlot = this.getSlotById(fromSlotId);
        let toSlot = null;
        let moved = false;
        if(validTargets){
            validTargets.forEach(slot => { 
                // si donde se solto la pieza es una posicion valida
                if (this.isValidArea(mousePos.x, mousePos.y, slot.id)){
                    moved = true
                    toSlot = this.getSlotById(slot.id);
                }
            });
        } 
        

        // Si el slot donde el usuario solto la pieza era invalido 
        if (!fromSlot || !toSlot || !fromSlot.piece || toSlot.piece) return moved;

        this.#movePiece(fromSlot,toSlot)
                            // chequear si hay que dibujar, antes de ejecutar this.board.checkGameState(); y podria finalizar el juego,
                            //  antes de que el usuario perciba el ultimo movimiento
                            //  this.draw(this.ctx);
        // this.board.checkGameState(); // corrobora el estado del juego [si gano,perdio o hay movimientos posibles]
        return moved;
    }

    #removePice(jumpedPiece){
        this.pieces = this.pieces.filter(p => p !== jumpedPiece);
    }
    
    // maneja el estado logico de las piezas de cada slot (origen y destino)
    #movePiece(fromSlot,toSlot){ 
        // Movimiento válido: eliminar la del medio y mover la ficha
        const movingPiece = fromSlot.piece;
        const dir = this.getDirection(fromSlot, toSlot);
        const midSlot = this.getSlotByOffset(fromSlot, dir, 1);
        const jumpedPiece = midSlot.piece;

        // quito del los slots del tablero la pieza que salto y la del origen de partida
        fromSlot.piece = null;
        
        midSlot.piece = null;

        // le asigno la pieza origen al slot destino que me quiero mover
        toSlot.piece = movingPiece;

        // asigno el nuevo id de la pieza que movi para que se corresponda con el id del slot al que salto
        movingPiece.id = toSlot.id;
        movingPiece.setPixelPos(toSlot.center.x, toSlot.center.y);

        this.#removePice(jumpedPiece)
    }

    getPieceAtSlot(slotId) {
        const piece = this.pieces.find(p => p.id === slotId);
        const idx = this.board.pieces.indexOf(piece);
            if (idx !== -1) {
                this.board.pieces.splice(idx, 1);
                this.board.pieces.push(piece);
            }
        return piece
    }
    getPieceAtSlot(mouseX, mouseY) {
        const piece = this.pieces.find((p) =>
            p.containsPoint(mouseX, mouseY)// && this.board.getPieceAtSlot(p.id)
        );
        const idx = this.pieces.indexOf(piece);
            if (idx !== -1) {
                this.pieces.splice(idx, 1);
                this.pieces.push(piece);
            }
       
        return piece
    }

    #selectPieceToDraw(piece){}
    
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
        const fromSlot = this.getSlotById(slotId); // obtengo el slot con ID = slotId
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

            let targetSlot = null;
            if (midSlot) {  targetSlot = this.getSlotByOffset(midSlot, dir, 1);} // Slot destino (2 pasos)
            
            // Si no existe pieza en el slot que quiero saltar o no existe pieza en el slot al que quiero saltar, saltá este ciclo y probá la siguiente dirección.
            if (!midSlot || !targetSlot) continue;

            if (midSlot.piece && !targetSlot.piece) {
                validTargets.push(targetSlot);
            }

        }

        return validTargets;
    }

    checkGameState() {
        // Contar cuántas piezas quedan
        const pieces = this.slots.filter(s => s.piece !== null);

        // Si solo queda una, el jugador ganó
        if (pieces.length === 1) {
            console.log("🎉 ¡Ganaste! Solo queda una ficha.");
            this.emitGameEnd(true);
            return;
        }

        // Si no quedan movimientos válidos, el juego terminó
        const anyValidMoves = pieces.some(slot => {
            const moves = this.getValidMovesFrom(slot.id);
            return moves.length > 0;
        });

        if (!anyValidMoves) {
            console.log("💀 No quedan movimientos válidos. Fin del juego.");
            this.emitGameEnd(false);
            return;
        }
    }

    emitGameEnd(win) {
        if (typeof this.onGameEnd === "function") {
            this.onGameEnd(win);
        }
    }

}


