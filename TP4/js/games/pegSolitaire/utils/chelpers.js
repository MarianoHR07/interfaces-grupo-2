// Funciones utilitarias que simplifican los cálculos comunes relacionados con el canvas
    // convertir coordenadas del mouse a celdas del tablero,
    // obtener el centro de una celda,
    // verificar si una posición está dentro del tablero,
    // calcular distancias, etc.

// Objetivo: brinda herramientas reutilizables para que otras clases no repitan código.



export const Helpers = {
    // Convierte coordenadas del mouse (x,y) a una celda (row,col)
    canvasToCell(x, y) {
        const rect = this.canvasRect; // guardado al inicio
        const cx = x - rect.left;     // posición relativa dentro del canvas
        const cy = y - rect.top;
        const col = Math.floor(cx / 80); // 80 = tamaño de celda
        const row = Math.floor(cy / 80);
        return { row, col };
    },

    // Convierte una celda (fila, columna) al centro en píxeles
    cellToCenter(row, col, cellSize) {
        return { 
            x: col * cellSize + cellSize / 2,
            y: row * cellSize + cellSize / 2
        };
    },

    // Verifica si la posición está dentro de los límites 7x7
    insideBoard(row, col) {
        return row >= 0 && row < 7 && col >= 0 && col < 7;
    },

    // Guarda las dimensiones reales del canvas (para clics precisos)
    setCanvasRect(rect) {
        this.canvasRect = rect;
    },

    // Calcula distancia entre dos puntos (útil para detección de clic)
    distance(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
};

// Para hacerlo accesible globalmente
// window.Helpers = Helpers;




// --------------¿Dónde y cuándo se usa? ----------------

// * En DragController.js:
    // Para saber sobre qué celda hizo clic el usuario (Helpers.canvasToCell()).
    // Para posicionar una ficha en el centro de su celda (Helpers.cellToCenter()).

// * En Board.js:
    // Para validar si un destino está dentro del tablero (Helpers.insideBoard()).

// * En Hint.js:
    // Para obtener las coordenadas exactas donde dibujar los hints.

// * En pegSolitaire.js:
    // Se llama una vez Helpers.setCanvasRect(canvas.getBoundingClientRect()) al inicio para registrar la posición del canvas en pantalla.