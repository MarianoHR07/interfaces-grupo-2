import { setFilter } from "../canvasFilters.js";

export function initBlocka(container){
    /** @type {HTMLCanvasElement} */
    const canvas = container.querySelector('#blockaCanvas');
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext('2d');


    // ================================================================================================
    //                                           Variables 
    // ================================================================================================
    let pieces = [];
    let img = new Image();
    let level = 1;
    let rows = 2, cols = 2; // dificultad por defecto
    const totalLevels = 3;
    let gameStarted = false; // no permitir girar antes de iniciar

    // calculo el tamaño cuadrado maximo que entra en el canvas
    let pieceSize = Math.min(canvas.width / cols, canvas.height / rows);

    // Mensajes de Victoria
    const messages = [
        "¡Excelente! 🔥",
        "¡Impresionante! 💪",
        "¡Nivel superado! 🧩",
        "¡Así se hace! 👏",
        "¡Buen trabajo! 🎯"
    ];
    
    const helpBtnBlocka = container.querySelector("#helpBtnBlocka");
    const gameOptionsMenuBlocka = container.querySelector("#gameOptionsMenuBlocka");
    const timerBlocka = container.querySelector("#timerBlocka");
    const timerContainer = container.querySelector(".timer-container-blocka");
    const buttonsBlocka = container.querySelector("#buttons-blocka");
    const victoryMessage = container.querySelector('#message');
    const messageCompletionTime = container.querySelector('#puzzle-completion-time');
    const messageContainer = container.querySelector("#message-container-blocka");
    const difficulty = container.querySelector("#difficultyLevelBlocka");
    const labelDifficultyLevel = container.querySelector(".labelDifficultyLevel");
    const startBtn = container.querySelector("#startBtnBlocka");
    const nextLevelBlocka = container.querySelector("#nextLevelBlocka");
    const levelsToSolve = container.querySelectorAll(".levelToSolve");
    const currentLevelPlaying = container.querySelector(".currentLevelPlaying");
    const retryLevelBlocka = container.querySelector("#retryLevelBlocka");
    const returnBeginningBlocka = container.querySelector("#returnBeginningBlocka");

    // Timer
    let startTime, timerInterval;
    let elapsedBeforePause = 0; // tiempo transcurrido antes de la pausa
    let penaltyForHelp = 0; // penalizacion pro pedir "Ayudita"
    let isPaused = false;

    // ===========================================================
    //            CONFIGURACIÓN DE DIFICULTAD Y FILTROS
    // ===========================================================

    const gameDifficulty = {
        1: {
            filters: ["none", "sepia", "blackAndWhite"],
            filterParams: {
                brightness: [0.2, 0.4, 0.6],
                opacity: [0.7, 0.8, 0.9]
            },
            // valores expresados en milisegundos
            timeLimit: {
                easy: 3000,
                normal: 9000,
                hard: 18000
            }
        },

        2: {
            filters: ["none", "sepia", "grey", "opacity", "blackAndWhite", "brightness"],
            filterParams: {
                brightness: [0.3, 0.5, 0.8],
                opacity: [0.4, 0.6, 0.8]
            },
            timeLimit: {
                easy: 3000,
                normal: 15000,
                hard: 26000
            }
        },

        3: {
            filters: ["sepia", "grey", "brightness", "negative"],
            filterParams: {
                brightness: [-0.5, -0.3, 0.3],
                opacity: [0.3, 0.5]
            },
            timeLimit: {
                easy: 3000,
                normal: 9000,
                hard: 18000
            }
        }
    };
    
    // ================================================================================================
    //                                         INICIALIZACIÓN DEL JUEGO
    // ================================================================================================

    function loadRandomImage() {
        return new Promise((resolve) => {
            const images = [
                'rompecabezas1.jpg', 'rompecabezas2.jpg',
                'rompecabezas3.jpg', 'rompecabezas4.jpg',
                'rompecabezas5.jpg', 'rompecabezas6.jpg',
                'rompecabezas7.jpg', 'rompecabezas8.jpg',
                'rompecabezas9.jpg', 'rompecabezas10.jpg',
                'rompecabezas11.jpg', 'rompecabezas12.jpg',
                'rompecabezas13.jpg', 'rompecabezas14.jpg',
                'rompecabezas15.jpg', 'rompecabezas16.jpg',
                'rompecabezas17.jpg', 'rompecabezas18.jpg'
            ];
            const random = images[Math.floor(Math.random() * images.length)];
            img.src = `images/blocka/${random}`;
            img.onload = () => resolve(); // solo cuando la imagen realmente se carga
        });
    }

    // elegir una nueva imagen, crear sus piezas y dibujarlas
    function initFirstImage() {
        loadRandomImage().then(() => {
            createPieces();
            drawPieces();
        });
    }

    initFirstImage();



    // ================================================================================================
    //                                       FUNCIONES PRINCIPALES
    // ================================================================================================
    // Divide la imagen en piezas iguales(cuadradas)
    function createPieces() {
        pieces = [];  
        let selectedfilter = null;

        const config = gameDifficulty[level];
        const filters = config.filters;
        
        if (difficulty.value == 'easy') {    // obtengo 1 filtro aleatorio != "none"
            const filtered = filters.filter(f => f !== "none");
            selectedfilter = filtered[Math.floor(Math.random() * filtered.length)];
        }
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
                let { filterType, k } = getRandomFilter(level);
                
                if (difficulty.value == 'easy') {// Para cada pieza, elegir entre "none" o el filtro previamente elegido
                    const applyFilter = Math.random() < 0.5 ? "none" : selectedfilter;
                    filterType = applyFilter;
                }
                pieces.push({
                    x,      // posicion horizontal en la cuadricula
                    y,      // posicion vertical en la cuadricula
                    rotation,
                    correctRotation: 0, 
                    initialRotation: rotation,
                    width: pieceSize,  // tamaño horizontal de la subimagen
                    height: pieceSize,  // tamaño vertical de la subimagen
                    filterType,
                    k,
                    fixed: false // por defecto, ninguna está fija
                });
            }
        }
    }


    // Dibuja las piezas en el canvas (centrandola horizontal y verticalmente)
    function drawPieces() {
        let { offsetX, offsetY} = imageFit();

        // Limpia completamente el canvas antes de redibujar todo
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        // Canvas temporal para procesar cada pieza
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = pieceSize;
        tempCanvas.height = pieceSize;

        // Cada pieza es ubicada donde corresponde y con su rotacion inicial asignada
        pieces.forEach(p => {
            // Defino la posición de origen dentro de la imagen original
            const sx = p.x * (img.width / cols);
            const sy = p.y * (img.height / rows);
                                // (sx, sy) = esquina superior izquierda del recorte que corresponde a esa 
                                // pieza dentro de la imagen completa.

            // Defino la posición donde se dibujará la pieza en el canvas (usando el centro del rectángulo)
            const dx = offsetX + p.x * p.width + p.width / 2;
            const dy = offsetY + p.y * p.height + p.height / 2;

            // Dibujo el fragmento original de la imagen en el canvasTemp
            tempCtx.clearRect(0, 0, pieceSize, pieceSize);
            tempCtx.drawImage(
                img,
                sx,sy,
                img.width / cols,
                img.height / rows,
                0,0, pieceSize, pieceSize
            );
            
            let imageData = tempCtx.getImageData(0, 0, pieceSize, pieceSize);
            imageData = setFilter(imageData, p.filterType, p.k);
            tempCtx.putImageData(imageData, 0, 0); // inserto el resultado nuevamente en el canvas temporal
            
            // Dibujo la pieza filtrada y rotada en el canvas principal
            ctx.save(); // Guarda el estado actual del contexto (posición, rotación, transformaciones, etc.)
            ctx.translate(dx, dy);  // Mueve el punto de origen (0,0) del canvas al centro de la pieza
            ctx.rotate(p.rotation * Math.PI / 180); // Roto la imagen
            
            // Dibujo la imagen
            ctx.drawImage(  
                tempCanvas,
                -p.width / 2, -p.height / 2,  // (-p.width/2 , -p.height/2): punto donde se coloca el dibujo en el canvas
                p.width, p.height     // tamaño final de la pieza dibujada    
            );

            ctx.restore();  // “limpia” la rotación y traslación aplicadas, así la siguiente pieza empieza con un lienzo limpio
        });
    }


    // Calcula los offsets
    function imageFit(){
        const totalWidth = pieceSize * cols;
        const totalHeight = pieceSize * rows;

        // Centrar el rompecabezas dentro del canvas
        const offsetX = (canvas.width - totalWidth) / 2;
        const offsetY = (canvas.height - totalHeight) / 2;

        return {offsetX, offsetY};
    }


    // ================================================================================================
    //                                      EVENTOS DE JUEGO
    // ================================================================================================
    
    // Comenzar Nivel
    startBtn.addEventListener("click", startGame);


    // Girar piezas
    canvas.addEventListener('mousedown', e => {
        if(!gameStarted) return;  // no permite girar si no comenzó

        const rect = canvas.getBoundingClientRect();   // devuelve el rectángulo que ocupa el canvas en la ventana
        
        // resto los bordes del canvas para obtener la posición dentro del canvas (en píxeles)
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const { offsetX, offsetY } = imageFit();

        // Verifico si el clic está dentro del área del rompecabezas
        if (clickX < offsetX ||
            clickY < offsetY ||
            clickX > offsetX + pieceSize * cols ||
            clickY > offsetY + pieceSize * rows) {
                return; // si hace clic fuera, no hago nada
        }

        // Busco dentro del arreglo de piezas cual es la que fue clickeada
        const piece = pieces.find(p => {
            const dx = offsetX + p.x * p.width + p.width / 2;
            const dy = offsetY + p.y * p.height + p.height / 2;

            // Calculo el rectángulo que ocupa realmente esa pieza en el canvas
            const left = dx - p.width / 2;
            const right = dx + p.width / 2;
            const top = dy - p.height / 2;
            const bottom = dy + p.height / 2;

            // Compruebo si el clic está dentro de esos límites
            return clickX >= left && clickX <= right && clickY >= top && clickY <= bottom;
        });

        if (!piece) return;
        if (piece.fixed) return;  // no permite girar piezas fijas

        // e.button: devuelve que botón del mouse se usó (0 = izquierdo, 2 = derecho).
        if (e.button === 0) piece.rotation -= 90;
        else if (e.button === 2) piece.rotation += 90;

        piece.rotation = (piece.rotation + 360) % 360;  // Normaliza, mantiene los ángulos dentro de 0–359°

        drawPieces();   // redibujo la pieza con su nueva inclinacion
        checkWin();  // verifico si gane
    });


    // Carga de dificultad
    difficulty.addEventListener('change', () => {
        if(difficulty.value == 'easy'){
            rows = 2, 
            cols = 2;
       }else{
            if(difficulty.value == "medium"){
                rows = 3, 
                cols = 3;
            }else{
                if(difficulty.value == "hard"){
                    rows = 4, 
                    cols = 4;
                }
            } 
        }

        // Recalculo el tamaño de la pieza
        pieceSize = Math.min(canvas.width / cols, canvas.height / rows);

        // Crear y dibujar las piezas según la nueva dificultad
        createPieces();
        drawPieces();
    });


    // Abrir panel de opciones al pausar el juego
    gameOptionsMenuBlocka.addEventListener("click", () => {
        // habilito el panel de pausa
        buttonsBlocka.style.display = "flex";
        startBtn.style.display = "block";
        retryLevelBlocka.style.display = "block";
        returnBeginningBlocka.style.display = "block";

        // deshabilito las opciones de jugar
        helpBtnBlocka.style.display = "none";
        difficulty.style.display = "none";
        labelDifficultyLevel.style.display = "none";
        nextLevelBlocka.style.display = "none";

        updateStartButtonText("Continuar Nivel");

        pauseTimer();
    });


    // Avanzar al siguiente nivel
    nextLevelBlocka.addEventListener("click", async () => {
        await nextLevel();
        startGame();
    });

    
    // Reintentar Nivel actual
    retryLevelBlocka.addEventListener("click", () => {
        // reinicio el timer
        resetTimer();

        // restauro las rotaciones iniciales de cada pieza
        pieces.forEach(p => { 
            p.rotation = p.initialRotation;
            p.fixed = false; // permito volver a girarla la pieza(en caso que se haya acomodado sola por pedir "Ayudita")
        });

        // redibujo las piezas como estaban al inicio del nivel
        drawPieces();

        // Oculto el menú
        victoryMessage.textContent = "";
        messageCompletionTime.textContent = "";
        buttonsBlocka.style.display = "none";

        // reinicio el juego
        startGame();
    });


    // Volver al inicio
    returnBeginningBlocka.addEventListener("click", async () => {
        // vuelvo a empezar desde el nivel 1
        level = 1;
        levelsToSolve.forEach((lvlElem) => {
            lvlElem.innerHTML = `${level}`;
        })

        // habilito el panel de pausa
        buttonsBlocka.style.display = "flex";
        startBtn.style.display = "block";
        labelDifficultyLevel.style.display = "block";
        difficulty.style.display = "block";

        // deshabilito las opciones del juego
        nextLevelBlocka.style.display = "none";
        retryLevelBlocka.style.display = "none";
        messageContainer.style.display = "none";
        gameOptionsMenuBlocka.style.display = "none";
        helpBtnBlocka.style.display = "none";
        timerContainer.style.display = "none";
        currentLevelPlaying.style.display = "none";
        returnBeginningBlocka.style.display = "none";

        // actualizo el mensaje de 
        updateStartButtonText("Comenzar Nivel");

        resetTimer();

        initFirstImage();

    });


    // AYUDITA
    helpBtnBlocka.addEventListener("click", () => {
        // agarro una pieza que no haya sido colocada correctamente
        const piece = pieces.find(p => p.rotation !== p.correctRotation && !p.fixed);
        if(!piece) return; // por si todas ya estan colocadas correctamente

        // coloco la pieza correctamente
        piece.rotation = piece.correctRotation;
        piece.rotation = (piece.rotation + 360) % 360;  // Normaliza, mantiene los ángulos dentro de 0–359°

        // dejo fija la pieza para que no pueda ser rotada
        piece.fixed = true;

        drawPieces();   // redibujo la pieza con su nueva inclinacion
        checkWin();  // verifico si gane

        // se le suman 5 segundos al timer por ayuda recibida
        penaltyForHelp += 5000;
    });





    // ================================================================================================
    //                                     TIMER Y CONTROL DE NIVELES
    // ================================================================================================
    // Comenzar nivel
    function startGame(){    
        gameStarted = true;

        // si habia un mensaje de una jugada anterior se limpia
        victoryMessage.textContent = "";  
        messageCompletionTime.textContent = "";

        // habilito las opciones al jugar
        helpBtnBlocka.style.display = "block";
        gameOptionsMenuBlocka.style.display = "block";
        timerContainer.style.display = "flex";
        currentLevelPlaying.style.display = "block";

        // deshabilito el menu de pausa/menu
        buttonsBlocka.style.display = "none";  

        if(isPaused){
            isPaused = false;
            startTimer();
        }else{
            elapsedBeforePause = 0;
            startTimer();
        }
    }


    // Avanzar de nivel
    async function nextLevel(){
        // reinicio el timer
        resetTimer();

        // incremento el nivel
        level++;
        levelsToSolve.forEach((lvlElem) => {
            lvlElem.innerHTML = `${level}`;
        })

        // Nueva imagen random para el siguiente nivel
        await loadRandomImage();

        // Para evitar que quede algun rastro visual del nivel anterior
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // dibuja la nueva imagen
        createPieces();
        drawPieces();        
    }


    // Arrancar el temporizador
    function startTimer() {
        // para evitar tener dos o más intervalos corriendo a la vez
        if (timerInterval) clearInterval(timerInterval);
        
        // Si ya había tiempo transcurrido (por una pausa previa) lo conservo
        startTime = Date.now() - elapsedBeforePause;
        
        // Temporizador que incrementa el timer cada 1 segundo
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime + penaltyForHelp) / 1000);  // calcula cuántos milisegundos pasaron desde que empezó el juego
                                                                // sumo la penalizacion por pedir ayuda
            const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");  // obtiene los minutos completos transcurridos
            const seconds = String(elapsed % 60).padStart(2, "0");  // elapsed % 60 obtiene los segundos que sobran después de dividir por 60
                                                                    // padStart(2, "0") asegura que siempre haya dos dígitos
            timerBlocka.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }


    // Pausar el temporizador
    function pauseTimer() {
        if (!timerInterval) return;

        clearInterval(timerInterval);
        timerInterval = null;

        // Guarda cuánto tiempo pasó hasta el momento de la pausa
        elapsedBeforePause = Date.now() - startTime;
        isPaused = true;
    }


    // Reseteo el timer
    function resetTimer(){
        clearInterval(timerInterval);
        elapsedBeforePause = 0;
        penaltyForHelp = 0;
        timerBlocka.textContent = "00:00";
        // startTime === null
    }


    // Verifico si gane un nivel o todos
    function checkWin() {
        // Recorro todas las piezas del arreglo pieces y devuelve true solo si todas cumplen la condición
        const allCorrect = pieces.every(p => p.rotation % 360 === p.correctRotation);
        
        // Si todas están bien orientadas:
        if (allCorrect) {
            clearInterval(timerInterval);  // Detiene el cronómetro
            gameStarted = false;  // Evita que el jugador siga girando piezas luego de ganar
            
            if(level < totalLevels){
                setTimeout(() => {
                    hideGameOptions();
                    nextLevelBlocka.style.display = "block";

                    const randomMessages = messages[Math.floor(Math.random() * messages.length)];
                    victoryMessage.innerHTML = `${randomMessages}`;

                    messageCompletionTime.innerHTML = "Lo lograste en: " + timerBlocka.innerHTML;
                    
                }, 1000);
            }else{
                hideGameOptions();
                nextLevelBlocka.style.display = "none";

                victoryMessage.innerHTML = "🎉 ¡GANASTE TODOS LOS NIVELES! 🎉";
                messageCompletionTime.innerHTML = "";
            }

        }
    }


    // Control de vista al finalizar el nivel
    function hideGameOptions(){
        // deshabilito las funciones del juego al ganar
        difficulty.style.display = "none"; 
        labelDifficultyLevel.style.display = "none"; 
        startBtn.style.display = "none";
        timerContainer.style.display = "none";
        helpBtnBlocka.style.display = "none"; 
        gameOptionsMenuBlocka.style.display = "none"; 
        nextLevelBlocka.style.display = "none";

        // habilito mensaje de celebracion
        buttonsBlocka.style.display = "flex"; 
        messageContainer.style.display = "flex";
        returnBeginningBlocka.style.display = "block";
    }

   
    // Actualizo texto de boton: comenzar nivel <--> continuar nivel
    function updateStartButtonText(text) {
        if(startBtn.firstChild.nodeType === Node.TEXT_NODE){
            startBtn.firstChild.textContent = `${text} `;
        }else{
            // Si por alguna razón no hay texto, lo creo antes del span
            startBtn.insertBefore(document.createTextNode(`${text}: `), level);
        }
    }











    // Evita el menú del clic derecho en la seccion del canvas 
    canvas.addEventListener('contextmenu', e => e.preventDefault());



    // ===========================================================
    //            FUNCIÓN AUXILIAR PARA FILTROS RANDOM
    // ===========================================================

    /**
     * Devuelve un filtro aleatorio y su valor k (si aplica)
     * @param {number} level - nivel actual del juego
     * @returns {{ filterType: string, k: number }}
     */
    function getRandomFilter(level) {
        const config = gameDifficulty[level];
        if (!config) return { filterType: "none", k: 1 };

        const filters = config.filters;
        const filterType = filters[Math.floor(Math.random() * filters.length)];
        let k = 1;

        // si el filtro requiere k, lo tomamos aleatoriamente
        if (filterType === "brightness") {
            const vals = config.filterParams.brightness;
            k = vals[Math.floor(Math.random() * vals.length)];
        } else if (filterType === "opacity") {
            const vals = config.filterParams.opacity;
            k = vals[Math.floor(Math.random() * vals.length)];
        }

        return { filterType, k };
    }


}


