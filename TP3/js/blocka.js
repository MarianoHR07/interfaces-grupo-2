
function initBlocka(container){
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('blockaCanvas');
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext('2d');


    // ===============================
    //            Variables 
    // ===============================
    let pieces = [];
    let rows = 2, cols = 2; // nivel básico
    let img = new Image();
    let level = 1;
    const totalLevels = 6;
    let startTime, timerInterval;
    let gameStarted = false; // Para no permitir girar antes de iniciar

    // calculo el tamaño cuadrado maximo que entra en el canvas
    const pieceSize = Math.min(canvas.width / cols, canvas.height / rows);

    const messages = [
        "¡Excelente! 🔥",
        "¡Impresionante! 💪",
        "¡Nivel superado! 🧩",
        "¡Así se hace! 👏",
        "¡Buen trabajo! 🎯"
    ];


    // ======================================
    //       INICIALIZACIÓN DEL JUEGO
    // ======================================
    function loadRandomImage() {
        const images = ['rompecabezas1.jpg', 'rompecabezas2.jpg', 'rompecabezas3.jpg', 'rompecabezas4.jpg', 'rompecabezas5.jpg', 'rompecabezas6.jpg', 'rompecabezas7.jpg'];
        const random = images[Math.floor(Math.random() * images.length)];
        img.src = `images/blocka/${random}`;
    }

    loadRandomImage();

    img.onload = () => {
        createPieces();
        drawPieces();
    };


    // =================================
    //      FUNCIONES PRINCIPALES
    // =================================
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


    // Dibuja las piezas en el canvas
    function drawPieces() {
        let { offsetX, offsetY} = imageFit();

        // Limpia completamente el canvas antes de redibujar todo
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

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


    // =============================
    //      EVENTOS DE JUEGO
    // =============================
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

        drawPieces();
        checkWin();  // verifico si gane
    });


    // ====================================
    //      TIMER Y CONTROL DE NIVELES
    // ====================================
    const startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", startGame);
    

    function startGame(){
        if (gameStarted) return; // Evita reiniciar si ya empezó
        
        document.getElementById('message').textContent = "";  // si habia un mensaje de una jugada anterior se limpia
        gameStarted = true;

        startTimer();
    }


    function startTimer() {
        startTime = Date.now();
        
        // Creo un temporizador que ejecuta el bloque de código cada 1 segundo
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);  // calcula cuántos milisegundos pasaron desde que empezó el juego
            const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");  // obtiene los minutos completos transcurridos
            const seconds = String(elapsed % 60).padStart(2, "0");  // elapsed % 60 obtiene los segundos que sobran después de dividir por 60
                                                                    // padStart(2, "0") asegura que siempre haya dos dígitos
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }


    function checkWin() {
        // Recorro todas las piezas del arreglo pieces y devuelve true solo si todas cumplen la condición
        const allCorrect = pieces.every(p => p.rotation % 360 === p.correctRotation);
        // Si todas están bien orientadas:
        if (allCorrect) {
            clearInterval(timerInterval);  // Detiene el cronómetro
            gameStarted = false;  // Evita que el jugador siga girando piezas luego de ganar
            
            if(level < totalLevels){
                ctx.filter = 'blur(80px)'; 
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const messageBlocka = document.getElementById('message');
                messageBlocka.style.display = "block";
                
                const randomMessages = messages[Math.floor(Math.random() * messages.length)];
                messageBlocka.innerHTML = `${randomMessages}`;
            }else{
                showFinalWin();
            }

        }
    }


    function showFinalWin() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillText("🎉 ¡GANASTE TODOS LOS NIVELES! 🎉", canvas.width / 2, canvas.height / 2);
        document.getElementById('message').textContent = "";
    }











    // Evita el menú del clic derecho en la seccion del canvas 
    canvas.addEventListener('contextmenu', e => e.preventDefault());
}