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
    const continueBtn = container.querySelector("#continueBtnBlocka");
    const nextLevelBlocka = container.querySelector("#nextLevelBlocka");
    const levelsToSolve = container.querySelectorAll(".levelToSolve");
    const currentLevelPlaying = container.querySelector(".currentLevelPlaying");
    const retryLevelBlocka = container.querySelector("#retryLevelBlocka");
    const returnBeginningBlocka = container.querySelector("#returnBeginningBlocka");

    // Timer
    let timerInterval = 0;
    let startTime = 0;
    let elapsedBeforePause = 0; // tiempo transcurrido antes de la pausa
    let penaltyForHelp = 0; // penalizacion pro pedir "Ayudita"
    let isPaused = false;
    let isGameOver = false;
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
                easy: 10000,
                medium: 15000,
                hard: 35000
            },
            records: {
                easy: 10000,
                medium: 15000,
                hard: 35000
            },
        },

        2: {
            filters: ["none", "sepia", "grey", "opacity", "blackAndWhite", "brightness"],
            filterParams: {
                brightness: [0.3, 0.5, 0.8],
                opacity: [0.4, 0.6, 0.8]
            },
            timeLimit: {
                easy: 10000,
                medium: 15000,
                hard: 35000
            },
            records: {
                easy: 10000,
                medium: 15000,
                hard: 35000
            },
        },

        3: {
            filters: ["sepia", "grey", "brightness", "negative"],
            filterParams: {
                brightness: [-0.5, -0.3, 0.3],
                opacity: [0.3, 0.5]
            },
            timeLimit: {
                easy: 10000,
                medium: 15000,
                hard: 35000
            },
            records: {
                easy: 10000,
                medium: 15000,
                hard: 35000
            },
        }
    };
    
    // ================================================================================================
    //                                         INICIALIZACIÓN DEL JUEGO
    // ================================================================================================
    function loadImage(src) {
        return new Promise((resolve) => {
            // const random = src;
            img.src = src;
            img.onload = () => resolve(); // solo cuando la imagen realmente se carga
        });
    }
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

    function generatePreviewGrid() {
        const previewContainer = container.querySelector('#previewGrid');
        previewContainer.innerHTML = ''; // limpio por si ya existía algo

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

        // mezclo y tomo 9
        const random9 = images.sort(() => 0.5 - Math.random()).slice(0, 9);

        random9.forEach(src => {
            const imgElem = new Image();
            // const imgElem = document.createElement('img');
            imgElem.src = `images/blocka/${src}`;
            previewContainer.appendChild(imgElem);
        });

        return random9; // las devuelvo para usar luego
    }

    let previewImages = [];
    

    function initFirstImage() {
        // genero las 9 imágenes random y guardo la lista
        previewImages = generatePreviewGrid();
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
        const tempCtx = tempCanvas.getContext("2d",{willReadFrequently:true});
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

    function drawSolvedPieces() {

        let { offsetX, offsetY} = imageFit();

        
        // Limpia completamente el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        let scaledWidth = pieceSize * cols;
        let scaledHeight = pieceSize * rows;
        // Dibuja la imagen original completa en el canvas
        ctx.drawImage(
            img,
            0, 0, img.width, img.height, // origen completo de la imagen
            offsetX, offsetY,            // posición donde comienza el dibujo
            scaledWidth, scaledHeight    // tamaño final que ocupa (igual al puzzle)
        );
 
         
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

    // Continuar Nivel
    continueBtn.addEventListener("click",e=>{
        e.preventDefault;
        // Oculto el menú
        victoryMessage.textContent = "";
        messageCompletionTime.textContent = "";
        buttonsBlocka.style.display = "none";

        // Habilito el boton de ayuda 
        helpBtnBlocka.style.display = "block";


        if(isPaused){ // al presionar continuar nivel vuelve a correr el reloj
            isPaused = false;
            startCountdown();
            // console.log("se despauso")
        }
        else{
            elapsedBeforePause = 0;
            console.log("pausado")
            startCountdown(false); 
        }

    })


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

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resetTimer();
    });


    // Abrir panel de opciones al pausar el juego
    gameOptionsMenuBlocka.addEventListener("click", () => {
        // habilito el panel de pausa
        buttonsBlocka.style.display = "flex";
        continueBtn.style.display = "block";
        retryLevelBlocka.style.display = "block";
        returnBeginningBlocka.style.display = "block";

        // deshabilito las opciones de jugar
        startBtn.style.display = "none";
        helpBtnBlocka.style.display = "none";
        difficulty.style.display = "none";
        labelDifficultyLevel.style.display = "none";
        nextLevelBlocka.style.display = "none";

        pauseTimer();
    });


    // Avanzar al siguiente nivel
    nextLevelBlocka.addEventListener("click", async () => {
        await nextLevel();
        startGame();
    });

    
    // Reintentar Nivel actual
    retryLevelBlocka.addEventListener("click", () => {
        resetTimer();

        pieces.forEach(p => { 
            p.rotation = p.initialRotation;
            p.fixed = false;
        });

        victoryMessage.textContent = "";
        messageCompletionTime.textContent = "";
        buttonsBlocka.style.display = "none";
        helpBtnBlocka.style.display = "block";

        drawPieces();

        if (isPaused) {
            isPaused = false;
            startCountdown();
        } else {
            elapsedBeforePause = 0;
            startCountdown();
        }
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
        continueBtn.style.display = "none";
        nextLevelBlocka.style.display = "none";
        retryLevelBlocka.style.display = "none";
        messageContainer.style.display = "none";
        gameOptionsMenuBlocka.style.display = "none";
        helpBtnBlocka.style.display = "none";
        timerContainer.style.display = "none";
        currentLevelPlaying.style.display = "none";
        returnBeginningBlocka.style.display = "none";

        resetTimer();
        
        // initFirstImage();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        previewContainer.style.display = "grid";

        // Se reinicia el estilo de las imagenes que se seleccionan para los efectos de resuelto y seleccionado
        images.forEach(img => {
                img.classList.remove('hovered', 'solved');
                });

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
     
    const previewContainer = container.querySelector('#previewGrid');
    async function startGame(){    
        
        previewContainer.style.display = "grid";
        gameStarted = true;
        // deshabilito el menu de pausa/menu
        await delay(100);
        buttonsBlocka.style.display = "none"; 

        // ejecutarlo al entrar al nivel:
        // Animación de selección
        const chosenImage = await randomHoverEffect(1500); // 4 segundos de animación
    
        // Transición visual desde la miniatura hasta el canvas
     
        await delay(800);
        await animateImageToCanvas(chosenImage, canvas);

      
        
        //  Cuenta regresiva
        await countdownBeforeStart(3);
        const overlay = document.getElementById("transition-overlay");
        const overlayImg = document.getElementById("transition-image");
        overlay.style.display = "none";

        // // ocultar la grilla al empezar el juego
        previewContainer.style.display = 'none';

        // Iniciar el juegocargar esa imagen para el rompecabezas
        await loadImage(chosenImage.src);
        createPieces();
        drawPieces();

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
            startCountdown();
        }else{
            elapsedBeforePause = 0;
            startCountdown();
        }
    }

    const images = document.querySelectorAll(".preview-grid img");
    let selectedImg;

    function randomHoverEffect(duration = 3000) {
       
        return new Promise((resolve)=> {
            let interval = 300; // tiempo inicial entre cambios (ms)
            let elapsed = 0;
            let activeIndex = -1;
            const timer = setInterval(() => {
                // quitar hover anterior
                if (activeIndex >= 0) {
                    images[activeIndex].classList.remove("hovered");
                }
    
                // elegir imagen aleatoria
                activeIndex = Math.floor(Math.random() * images.length);
                images[activeIndex].classList.add("hovered");
    
                // aumentar velocidad gradualmente
                elapsed += interval;
                interval = Math.max(50, interval * 0.9); // acelera (reduce el delay)
    
                // cuando se supera la duración total, detenemos
                if (elapsed > duration) {
                   
                    clearInterval(timer);
                    images[activeIndex].classList.add("hovered"); // quito el ultimo hover
                    
                    selectedImg = images[activeIndex];
                   
                    resolve(selectedImg); // resuelve la promesa con la imagen (la devuelve)
                }
            }, interval);
        });
    }

    // Avanzar de nivel
    async function nextLevel(){
        // incremento el nivel
        level++;
        // reinicio el timer
        resetTimer();
        levelsToSolve.forEach((lvlElem) => {
            lvlElem.innerHTML = `${level}`;
        })

        // Para evitar que quede algun rastro visual del nivel anterior
        ctx.clearRect(0, 0, canvas.width, canvas.height);  
    }


    // Arrancar el temporizador(cuenta regresiva)
    function startCountdown(restartLevel=false) {
        if (timerInterval) clearInterval(timerInterval);
        isGameOver = false;

        const difficulty = document.getElementById("difficultyLevelBlocka");
        const timeLimitMs = gameDifficulty[level]?.timeLimit?.[difficulty.value];

        if (!timeLimitMs) {
            console.error(`No se encontró timeLimit para nivel ${level} y dificultad "${difficulty.value}"`);
            return;
        }

        startTime = Date.now() - elapsedBeforePause;
        let endTime = startTime + timeLimitMs + 1000; // le sumo 1 seg ya que pierde uno al iniciar el timerInterval

    
        if(restartLevel){
            console.log("Se reinicio el nivel en : startCoundown()")
            updateTimerDisplay(timeLimitMs / 1000);     // muestra el valor inicial
        }

        timerInterval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now - penaltyForHelp);
             
            // Convierto a segundos
            const totalSeconds = Math.floor((remaining) / 1000);
            updateTimerDisplay(totalSeconds);

            // Si se acaba el tiempo
            if (remaining <= 0) {
                clearInterval(timerInterval);
                handleTimeOut();
            }
        }, 1000);
    }

 
    //   ACTUALIZAR TIMER DEL JUEGO (VISIBLE)  
    function updateTimerDisplay(totalSeconds) {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        timerBlocka.textContent = `${minutes}:${seconds}`;
    }

   
    // HANDLER PARA CUANDO SE COMPLETA UN NIVEL     
    
    let completionTime;

    function handlePuzzleSolved() {
        if (isGameOver) return; // evita doble ejecución
        isGameOver = true;
        clearInterval(timerInterval);

        const elapsedMs = Date.now() - startTime + penaltyForHelp - 1000;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        // Mostrar mensaje de victoria
        const randomMessages = messages[Math.floor(Math.random() * messages.length)];
              victoryMessage.innerHTML = `${randomMessages}`;

        buttonsBlocka.style.display = "flex";
        retryLevelBlocka.style.display = "none";
        messageContainer.style.display = "flex";
        messageCompletionTime.style.display = "block";
        completionTime = `Tiempo empleado: ${minutes}:${seconds}`
        messageCompletionTime.textContent = completionTime;

      
    }

 
    //   AL AGOTAR TIEMPO LIMITE
    function handleTimeOut() {
        if (isGameOver) return;
        isGameOver = true;
        
        document.getElementById("message").textContent = "⏰ ¡Tiempo agotado!";
        document.getElementById("puzzle-completion-time").textContent = "";

        // habilito el panel de pausa
        buttonsBlocka.style.display = "flex";
        messageContainer.style.display = "flex";
        messageCompletionTime.style.display = "block";
        retryLevelBlocka.style.display = "block";
        returnBeginningBlocka.style.display = "block";

        // deshabilito las opciones de jugar
        startBtn.style.display = "none";
        difficulty.style.display = "none";
        labelDifficultyLevel.style.display = "none";
        nextLevelBlocka.style.display = "none";

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

    function resetTimer() {
        clearInterval(timerInterval);
        elapsedBeforePause = 0;
        penaltyForHelp = 0;

        const difficulty = document.getElementById("difficultyLevelBlocka");
        const timeLimitMs = gameDifficulty[level]?.timeLimit?.[difficulty.value];

        if (!timeLimitMs) {
            console.error(`No se encontró timeLimit para nivel ${level} y dificultad "${difficulty.value}"`);
            timerBlocka.textContent = "00:00";
            return;
        }

        // Calcular minutos y segundos iniciales según el límite
        const totalSeconds = Math.floor(timeLimitMs / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        // Mostrar tiempo inicial
        timerBlocka.textContent = `${minutes}:${seconds}`;
    }


    // Verifico si gane un nivel o todos
    async function checkWin() {
        // Recorro todas las piezas del arreglo pieces y devuelve true solo si todas cumplen la condición
        const allCorrect = pieces.every(p => p.rotation % 360 === p.correctRotation);

        // Si todas están bien orientadas:
        if (allCorrect) {
            clearInterval(timerInterval);  // Detiene el cronómetro
            // Dibujo la imagen completa sin filtros
            drawSolvedPieces();
            delay(1000);
            gameStarted = false;  // Evita que el jugador siga girando piezas luego de ganar
            
            selectedImg.classList.add("solved"); // marca la imagen como resuelta
            selectedImg.classList.remove("hovered");
            
            // quitar filtros 

            if(level < totalLevels){
                setTimeout(() => {
                    hideGameOptions();
                    nextLevelBlocka.style.display = "block";
                    handlePuzzleSolved();
                }, 1000);
            }else{
                hideGameOptions();
                nextLevelBlocka.style.display = "none";
                victoryMessage.innerHTML = "🎉 ¡GANASTE TODOS LOS NIVELES! 🎉";
                messageCompletionTime.innerHTML = completionTime;     
                initFirstImage();
            }

        }
    }


    // Control de vista al finalizar el nivel
    function hideGameOptions(){
        // deshabilito las funciones del juego al ganar
        difficulty.style.display = "none"; 
        labelDifficultyLevel.style.display = "none"; 
        startBtn.style.display = "none";
        continueBtn.style.display = "none";
        timerContainer.style.display = "none";
        helpBtnBlocka.style.display = "none"; 
        gameOptionsMenuBlocka.style.display = "none"; 
        nextLevelBlocka.style.display = "none";
        retryLevelBlocka.style.display = "none";

        // habilito mensaje de celebracion
        buttonsBlocka.style.display = "flex"; 
        messageContainer.style.display = "flex";
        returnBeginningBlocka.style.display = "block";
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

    function animateImageToCanvas(selectedImg, canvas) {
        return new Promise((resolve) => {
            const overlay = document.getElementById("transition-overlay");
            const overlayImg = document.getElementById("transition-image");
            const containerRect = canvas.closest(".blocka-container").getBoundingClientRect();
            const thumbRect = selectedImg.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();

            const totalWidth = pieceSize * cols;
            const totalHeight = pieceSize * rows;
            const offsetX = (canvas.width - totalWidth) / 2;
            const offsetY = (canvas.height - totalHeight) / 2;

            const startLeft = thumbRect.left - containerRect.left;
            const startTop = thumbRect.top - containerRect.top;
            const finalLeft = canvasRect.left - containerRect.left + offsetX;
            const finalTop = canvasRect.top - containerRect.top + offsetY;

            overlay.style.display = "block";
            overlayImg.src = selectedImg.src;
            overlayImg.style.left = `${startLeft}px`;
            overlayImg.style.top = `${startTop}px`;
            overlayImg.style.width = `${thumbRect.width}px`;
            overlayImg.style.height = `${thumbRect.height}px`;
            overlayImg.style.opacity = "0";
            overlayImg.style.filter = "blur(80px)";
            overlayImg.getBoundingClientRect();

            // Escucha el fin de la transición 
            let settled = false;
            
            function finish() {
            if (settled) return;
            settled = true;
            overlayImg.removeEventListener("transitionend", finish);
            resolve();
            }

            overlayImg.addEventListener("transitionend", finish); 

            requestAnimationFrame(() => {
            overlayImg.style.left = `${finalLeft}px`;
            overlayImg.style.top = `${finalTop}px`;
            overlayImg.style.width = `${totalWidth}px`;
            overlayImg.style.height = `${totalHeight}px`;
            overlayImg.style.opacity = "1";
            overlayImg.style.filter = "blur(0px)";
            });

            
            setTimeout(finish, 1200);
        });
    }


    // 🕒 Cuenta regresiva antes de iniciar el juego
    function countdownBeforeStart(seconds = 3) {
    return new Promise((resolve) => {
        const msg = document.getElementById("countdown-message");
        msg.style.display = "block";
        msg.style.opacity = 0;

        // Fade-in
        setTimeout(() => (msg.style.opacity = 1), 100);

        let timeLeft = seconds;
        msg.textContent = `El juego comienza en: ${timeLeft}...`;

        const interval = setInterval(() => {
            timeLeft--;
            msg.textContent = `El juego comienza en: ${timeLeft}...`;
            if (timeLeft <= 0) {
                clearInterval(interval);
                msg.textContent = "¡A jugar!";
                setTimeout(() => {
                    msg.style.opacity = 0;
                    setTimeout(() => {
                        msg.style.display = "none";
                        resolve();
                    }, 500);
                }, 1000);
            }
        }, 1000);
    });
}

    function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }
    
}


