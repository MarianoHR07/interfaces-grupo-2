// ###############################################
//    Inicializa el juego y conecta con el DOM
// ###############################################
import { Timer } from "./timer.js";
import { Board } from "./board.js";
import { DragController } from "./controllers/dragControllers.js";
import { AssetsManager } from "./controllers/assetsManager.js";
import { HintAnimator } from "./controllers/hintAnimator.js";
import { JSON_SLOTS, ASSETS, DEFAULT_TIME_LIMIT } from "./utils/constants.js";


export async function initPegSolitaire(){
    
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('pegCanvas');
    
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext('2d');
    
    const assets = new AssetsManager();

    // Precargamos el tablero y las piezas (no hace falta cargar todas las piezas en runtime todavía)
    await assets.loadAll([
        ASSETS.menuBackground,
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

    // --- Botones de control del juego ---
    const controlsPegSolitaire = document.querySelector('.controlsPegSolitaire');
    controlsPegSolitaire.style.display = 'none';

    const btnRestart = document.getElementById('btnRestartPeg');
    const btnMenu = document.getElementById('btnMenuPeg');

    const btnRetryPeg = document.getElementById('btnRetryPeg');

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

    drawMenuBackground(ctx, assets);
    
    // --- CUANDO SE PRESIONA “COMENZAR” ---
    startBtn.addEventListener('click', () => {
        menu.style.display = 'none';
        startGame(selectedPiece);
        controlsPegSolitaire.style.display = 'flex';
    });

// =====================================================
//              FUNCIÓN PRINCIPAL DEL JUEGO
// ===================================================== 
async function startGame(selectedPieceId) {

        let animationId = null; // se utiliza para detener el render loop cuando se pausa o vuelve al menú.
 
        const board = new Board(canvas, assets.get(ASSETS.board.name));

        // Cargamos el JSON con la informacion de los slots del tablero ::::
        await board.loadSlots(JSON_SLOTS);
        // Buscamos la pieza que selecciono el usuario
        let assetPiece = ASSETS.pieces.find(p => p.id === selectedPieceId) 
       
        board.resetPieces(assets.get(assetPiece.name));

        const hint = new HintAnimator(board);

        const drag = new DragController(canvas, board, hint);
        enableCanvas();// habilita la interaccion con el canvas

        // --- Timer y contador ---
        const timerDisplay = document.getElementById('timerDisplayPeg');
        const timer = new Timer(DEFAULT_TIME_LIMIT, timerDisplay, () => {      
            drag.canvas.style.pointerEvents = 'none';  // bloquear interacción
            showEndOverlay("time");
        });
        timer.start();

        const movesCountEl = document.getElementById('movesCountPeg');
        // Se sucribe al evento moves, para que cuando cambie
        // el atributo moves de dragControllers, actualice el contador del juego
        drag.onMoveMade(renderMovesQuantity => {
            movesCountEl.innerHTML = renderMovesQuantity;
        });

        
        // --- Evento resetaer ---
        btnRestart.addEventListener('click', () => {
            board.resetPieces(assets.get(assetPiece.name));
            drag.moves = 0;
            movesCountEl.textContent = '0';
            timer.reset();
            timer.start();
        });

        // --- Evento volver al menu ---
        btnMenu.addEventListener('click', () => {
            // Detener el juego y volver al menú
            timer.stop();
            cancelAnimationFrame(animationId);
            disableCanvas();  // Al menu principal deshabilita el canvas al volver 
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawMenuBackground(ctx, assets);
            menu.style.display = 'flex';
            controlsPegSolitaire.style.display = 'none';
        });

        btnRetryPeg.addEventListener('click', () => {
            const messageContainerPeg = document.getElementById('messageContainerPeg');
            messageContainerPeg.classList.remove("visible");

            // Reiniciamos estado de juego
            board.resetPieces(assets.get(assetPiece.name)); // vuelve las fichas a la posición inicial
            drag.moves = 0;
            movesCountEl.textContent = '0';

            // Reiniciamos el timer
            timer.reset();
            timer.start();

            // Volvemos a habilitar interacción con el tablero
            drag.canvas.style.pointerEvents = 'auto';
        })

        // --- Evento de fin del juego ---
        // Se suscribe al evento de onGameEnd del board, cuando cambia win=true finaliza el juego
        board.onGameEnd = (win) => {
            timer.stop();
            showEndOverlay(win);
        };

        function showEndOverlay(result) {
            const messageContainerPeg = document.getElementById('messageContainerPeg');
            messageContainerPeg.classList.add("visible");
            
            const overlay = document.getElementById("game-overlay");

            if (result === "time") {
                overlay.innerHTML = "⏳ ¡Se acabó el tiempo!";
            } else if (result === true) {
                overlay.innerHTML = "🎉 ¡Ganaste!";
            } else {
                overlay.innerHTML = "💀 Fin del juego. No quedan movimientos válidos";
            }
        }

        // bucle de renderizado (metodo recursivo)
        function render() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            board.draw(ctx);
            hint.draw(ctx);
            // Si hay una pieza en movimiento, se dibuja encima de todo
            if (drag.draggingPiece) {
                drag.draggingPiece.draw(ctx);
            }
            animationId = requestAnimationFrame(render); /*  método de la DedicatedWorkerGlobalScope interfaz le dice al navegador que desea 
                                            *  realizar una solicitud de cuadro de animación y llamar a una función de devolución
                                            *  de llamada proporcionada por el usuario antes del próximo repintado.
                                            *  La frecuencia de actualización más común es de 60 Hz
                                            */
        }

        render(); // se invoca una unica vez y requestAnimationFrame(render); cumple el rol de un setTimeout pero a una tasa de refresco de las pantallas

        function enableCanvas() {
            canvas.style.pointerEvents = 'auto';
        }

        function disableCanvas() {
            canvas.style.pointerEvents = 'none';  
        }
    }

    // =====================================================
    //              FONDO DEL MENÚ PRINCIPAL
    // =====================================================
    function drawMenuBackground(ctx, assets) {
        const bg = assets.get('menuBackground');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bg) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    }

}
