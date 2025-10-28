// ########################################
//    Definicion de variables globales
// ########################################

export const BOARD_SIZE = 7;
export const CELL_COUNT = BOARD_SIZE;
export const CELL_PIXEL = 80; // canvas 560x560 => 7 * 80
export const INVALID = -1;
export const EMPTY = 0;
export const PEG = 1;

// tiempo limite por defecto
export const DEFAULT_TIME_LIMIT = 5 * 60; // 5 minutes

export const JSON_SLOTS = "slots.json";

export const ASSETS = {
        menuBackground :{ name: 'menuBackground', src: 'images/background-login.png' }, ///ELIMINAR ESTE
        // menuBackground :{ name: 'menuBackground', src: 'images/pegSolitaire/fondo-menu-peg-solitaire.png' },
        board :{ name: 'board', src: 'images/pegSolitaire/tablero0.png' },
        // { name: 'board-2', src: 'images/pegSolitaire/tablero2.png' },
        pieces: [
            {id:"piece-1", name: 'p-esmeralda', src: 'images/pegSolitaire/pieces/ficha-esmeralda.png' },
            {id:"piece-2", name: 'p-cesped', src: 'images/pegSolitaire/pieces/ficha-cesped.png' },
            {id:"piece-3", name: 'p-diamante', src: 'images/pegSolitaire/pieces/ficha-diamante.png' },
            {id:"piece-4", name: 'p-perla-del-ender', src: 'images/pegSolitaire/pieces/ficha-perla-del-ender.png' }
        ],
        boardSlots:{ 
            name: 'slotsToJson',
            src: 'images/pegSolitaire/slots.png' 
        }
    }