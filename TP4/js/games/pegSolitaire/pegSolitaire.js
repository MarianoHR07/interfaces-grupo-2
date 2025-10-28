// ###############################################
//    Inicializa el juego y conecta con el DOM
// ###############################################
import { detectSlots } from "../../../generateSlotCoordinates.js";
import { Timer } from "./timer.js";
import { Board } from "./board.js";
import { DragController } from "./controllers/dragControllers.js";
import { AssetsManager } from "./controllers/assetsManager.js";
import { HintAnimator } from "./controllers/hintAnimator.js";
import { JSON_SLOTS,ASSETS } from "./utils/constants.js";


export async function initPegSolitaire(){
    
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('pegCanvas');
    
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext('2d');
    
    const assets = new AssetsManager();

    // Precargamos el tablero y las piezas (no hace falta cargar todas las piezas en runtime todavía)
    await assets.loadAll([
        ASSETS.board,
        ASSETS.boardSlots,
        ...ASSETS.pieces
    ]);

    // --- GENERA Y DESCARGA JSON de coordenadas: Solo se debe activar en caso de que quisieramos cargar un nuevo tablero  
    // detectSlots(canvas,assets.get('slotsToJson'),canvas.width, canvas.height);

    // --- CONFIGURAR EL MENÚ DE SELECCIÓN ---
    const menu = document.getElementById('menu-Peg-Solitaire');
    const buttons = menu.querySelectorAll('#peg-pieces-container button');
    const startBtn = menu.querySelector('#starBtnPeg'); 
    startBtn.disabled = true; // bloqueado hasta que se elija una pieza
    let selectedPiece = null;

    // Mostrar imágenes en los botones
    buttons.forEach((btn, i) => {
        const piece = ASSETS.pieces[i];
        const img = btn.querySelector('img');
        if(piece){
            img.id = piece.id;
            img.src = piece.src;
            img.alt = piece.name;
        }

        btn.addEventListener('click', () => {
            // Quitar selección previa
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            startBtn.disabled = false;
            selectedPiece = piece.id; // guardamos temporalmente el ID
        });
    });   
    
    // --- CUANDO SE PRESIONA “COMENZAR” ---
    startBtn.addEventListener('click', async () => {
        menu.style.display = 'none'; // ocultar menú
 
        const board = new Board(canvas, assets.get(ASSETS.board.name));
        // Cargamos el JSON con la informacion de los slots del tablero ::::
        await board.loadSlots(JSON_SLOTS);
        let assetPiece = ASSETS.pieces.find(p => p.id === selectedPiece) 
       
        board.resetPieces(assets.get(assetPiece.name));

        const hint = new HintAnimator(board);
        const drag = new DragController(canvas, board, hint);

        const timerDisplay = document.getElementById('timerDisplayPeg');
        const timer = new Timer(300, timerDisplay, () => {
             // alert('Se acabó el tiempo!');
            drag.canvas.style.pointerEvents = 'none';  // bloquear interacción
        });

        timer.start();

        const movesCountEl = document.getElementById('movesCountPeg');
        // Se sucribe al evento moves, para que cuando cambie
        // el atributo moves de dragControllers, actualice el contador del juego
        drag.onMoveMade(renderMovesQuantity => {
            movesCountEl.innerHTML = renderMovesQuantity;
        });

        // botones help/restart
        document.getElementById('btnRestartPeg').addEventListener('click', () => {
            board.resetPieces(assets.get(assetPiece.name));
            drag.moves = 0;
            movesCountEl.textContent = '0';
            timer.reset();
            timer.start();
            //drag.canvas.style.pointerEvents = 'auto';
        });

        // Se suscribe al evento de onGameEnd del board, cuando cambia win=true finaliza el juego
        board.onGameEnd = (win) => {
            timer.stop();
            showEndOverlay(win);
        };


        function showEndOverlay(win) {
            const overlay = document.getElementById("game-overlay");
            overlay.classList.add("visible");
            overlay.innerHTML = win
                ? "🎉 ¡Ganaste!"
                : "💀 Fin del juego. No quedan movimientos válidos";
        }

        // bucle de renderizado (metodo recursivo)
        function render() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            board.draw(ctx);
            hint.draw(ctx);
            requestAnimationFrame(render); /*  método de la DedicatedWorkerGlobalScope interfaz le dice al navegador que desea 
                                            *  realizar una solicitud de cuadro de animación y llamar a una función de devolución
                                            *  de llamada proporcionada por el usuario antes del próximo repintado.
                                            *  La frecuencia de actualización más común es de 60 Hz
                                            */
        }

        render(); // se invoca una unica vez y requestAnimationFrame(render); cumple el rol de un setTimeout pero a una tasa de refresco de las pantallas
    })
}
