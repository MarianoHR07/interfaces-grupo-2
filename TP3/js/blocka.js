function initBlocka(container){
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
    const gameConfigurationBlocka = container.querySelector("#gameConfigurationBlocka");
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

    // Timer
    let startTime, timerInterval;
    let elapsedBeforePause = 0; // tiempo transcurrido antes de la pausa
    let isPaused = false;

    
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

    (async function initFirstImage() {
        await loadRandomImage();
        createPieces();
        drawPieces();
    })();



    // ================================================================================================
    //                                       FUNCIONES PRINCIPALES
    // ================================================================================================
    // Divide la imagen en piezas iguales(cuadradas)
    function createPieces() {
        pieces = [];  

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
                
                pieces.push({
                    x,      // posicion horizontal en la cuadricula
                    y,      // posicion vertical en la cuadricula
                    rotation,
                    correctRotation: 0, 
                    width: pieceSize,  // tamaño horizontal de la subimagen
                    height: pieceSize  // tamaño vertical de la subimagen
                });
            }
        }
    }


    // Dibuja las piezas en el canvas (centrandola horizontal y verticalmente)
    function drawPieces() {
        let { offsetX, offsetY} = imageFit();

        // Limpia completamente el canvas antes de redibujar todo
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

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

            ctx.save(); // Guarda el estado actual del contexto (posición, rotación, transformaciones, etc.)
            ctx.translate(dx, dy);  // Mueve el punto de origen (0,0) del canvas al centro de la pieza
            ctx.rotate(p.rotation * Math.PI / 180); // Roto la imagen
            
            // Dibujo la imagen
            ctx.drawImage(  
                img,
                sx, 
                sy, 
                img.width / cols, 
                img.height / rows,
                -p.width / 2, // (-p.width/2 , -p.height/2): punto donde se coloca el dibujo en el canvas
                -p.height / 2, 
                p.width,     // tamaño final de la pieza dibujada
                p.height
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
    // Girar piezas
    canvas.addEventListener('mousedown', e => {
        if(!gameStarted) return;  // no permite girar si no comenzó

        const rect = canvas.getBoundingClientRect();  // devuelve el rectángulo que ocupa el canvas en la ventana
        // resto los bordes del canvas para obtener la posición dentro del canvas (en píxeles)
        const x = e.clientX - rect.left;  // posición del clic en la pantalla
        const y = e.clientY - rect.top;

        // determino que pieza fue clickeada
        const pieceWidth = canvas.width / cols; // cuanto ocupa la pieza en horizontal
        const pieceHeight = canvas.height / rows;  // cuanto ocupa la pieza en vertical

        // convierto el clic (x, y) en coordenadas de fila y columna
        const col = Math.floor(x / pieceWidth);
        const row = Math.floor(y / pieceHeight);

        // Busco dentro del arreglo de piezas cual es la que fue clickeada
        const piece = pieces.find(p => p.x === col && p.y === row);
        if (!piece) return;

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


    // Abrir panel de opciones
    gameConfigurationBlocka.addEventListener("click", () => {
        // habilito el panel de pausa
        buttonsBlocka.style.display = "flex";
        startBtn.style.display = "block";

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

    
    // Comenzar Nivel
    startBtn.addEventListener("click", startGame);



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
        gameConfigurationBlocka.style.display = "block";
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
        clearInterval(timerInterval);
        elapsedBeforePause = 0;
        timerBlocka.textContent = "00:00";

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
            const elapsed = Math.floor((Date.now() - startTime) / 1000);  // calcula cuántos milisegundos pasaron desde que empezó el juego
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


    // Control de vista
    function hideGameOptions(){
        // deshabilito las funciones del juego al ganar
        difficulty.style.display = "none"; 
        labelDifficultyLevel.style.display = "none"; 
        startBtn.style.display = "none";
        timerContainer.style.display = "none";
        helpBtnBlocka.style.display = "none"; 
        gameConfigurationBlocka.style.display = "none"; 

        // habilito mensaje de celebracion
        buttonsBlocka.style.display = "flex"; 
        messageContainer.style.display = "flex";
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
}