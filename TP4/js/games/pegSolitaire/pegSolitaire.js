// ###############################################
//    Inicializa el juego y conecta con el DOM
// ###############################################
import { Timer } from "./timer.js";
import { Board } from "./board.js";
import { DragController } from "./controllers/dragControllers.js";
import { AssetsManager } from "./controllers/assetsManager.js";
import { HintAnimator } from "./controllers/hintAnimator.js";
import { JSON_SLOTS } from "./utils/constants.js"


export async function initPegSolitaire(){
// document.addEventListener('DOMContentLoaded', async () => {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('pegCanvas');
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext('2d');
    
    const assets = new AssetsManager();
    await assets.loadAll([
        { name: 'peg', src: 'images/pegSolitaire/ficha-esmeralda.png' },
        { name: 'board', src: 'images/pegSolitaire/tablero0.png' },
        { name: 'slotsToJson', src: 'images/pegSolitaire/slots.png' }
    ]);


    // PARA CARGAR EL JSON::::
    // detectSlots(canvas,assets.get('slotsToJson'),canvas.width, canvas.height);

    const board = new Board(canvas);
    await board.loadSlots(JSON_SLOTS);
    board.resetPieces(assets.get('peg'));

    const hint = new HintAnimator(board);
    const drag = new DragController(canvas, board, hint, assets);

    const timerDisplay = document.getElementById('timerDisplayPeg');
    const timer = new Timer(300, timerDisplay, () => {
       // alert('Se acabó el tiempo!');
        drag.canvas.style.pointerEvents = 'none';  // bloquear interacción
    });

    timer.start();

    const movesCountEl = document.getElementById('movesCountPeg');
    drag.onMoveMade(m => {
        movesCountEl.textContent = m;
        // verificar fin de juego
        if (!board.hasAnyMoves()) {
            timer.stop();
            // setTimeout(()=> alert('Juego terminado — no hay más movimientos'), 80);
        }
    });

    // botones help/restart
    document.getElementById('btnRestartPeg').addEventListener('click', () => {
        board.initGrid();
        board.resetPieces(assets.get('peg'));
        drag.moves = 0;
        movesCountEl.textContent = '0';
        timer.reset();
        timer.start();
        drag.canvas.style.pointerEvents = 'auto';
    });

    // bucle de renderizado (metodo recursivo)
    function render() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(assets.get('board'), 0, 0, canvas.width, canvas.height);
        board.draw(ctx);
        hint.draw(ctx);
        requestAnimationFrame(render); /*  método de la DedicatedWorkerGlobalScope interfaz le dice al navegador que desea 
                                        *  realizar una solicitud de cuadro de animación y llamar a una función de devolución
                                        *  de llamada proporcionada por el usuario antes del próximo repintado.
                                        *  La frecuencia de actualización más común es de 60 Hz
                                        */
    }

    render(); // se invoca una unica vez y requestAnimationFrame(render); cumple el rol de un setTimeout pero a una tasa de refresco de las pantallas

}
