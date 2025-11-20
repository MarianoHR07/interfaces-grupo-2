export class ColliderSystem {

    /**
     * Comprueba si un entity colisiona con alguno de una lista de entidades.
     * @param {object} entity entidad a comprobar
     * @param {object[]} list lista de entidades contra las que comprobar
     * @returns {object|null} la entidad con la que colisiona, o null si no hay colisión
     */
    static checkAgainstList(entity, list) { // "Dice con cuál de las entidades de list se está chocando entity."
        const A = entity.colliderBounds();
        if (!A.active) return null;

        for (const other of list) {
            if (other === entity) continue;

            const B = other.colliderBounds();
            if (!B.active) continue;

            if (ColliderSystem.collides(A, B)) {
                return other; // devolvemos el que chocó
            }
        }
        return null;
    }

    /**
     * Determina si dos colliders colisionan, según su tipo.
     * @param {object} A primer collider
     * @param {object} B segundo collider
     * @returns {boolean} true si colisionan, false en caso contrario
     */
    static collides(A, B) {
        if (A.type === "rect" && B.type === "rect")
            return ColliderSystem.rectVsRect(A, B);

        if (A.type === "circle" && B.type === "circle")
            return ColliderSystem.circleVsCircle(A, B);

        if (A.type === "ellipse" && B.type === "rect")
            return ColliderSystem.ellipseVsRect(A, B);

        if (A.type === "rect" && B.type === "ellipse")
            return ColliderSystem.ellipseVsRect(B, A);

        if (A.type === "circle" && B.type === "rect")
            return ColliderSystem.circleVsRect(A, B);

        if (A.type === "rect" && B.type === "circle")
            return ColliderSystem.circleVsRect(B, A);

        if (A.type === "circle" && B.type === "ellipse")
            return ColliderSystem.circleVsEllipse(A, B);

        if (A.type === "ellipse" && B.type === "circle")
            return ColliderSystem.circleVsEllipse(B, A);

        return false;
    }
        // ====== COLISIONES ======= //
    
    /**
     * Detección de colisiones entre dos rectángulos alineados a los ejes.
     * @param {object} A objeto con las propiedades x, y, width, height del rectángulo A
     * @param {object} B objeto con las propiedades x, y, width, height del rectángulo B
     * @returns {boolean} true si colisionan, false en caso contrario
    */
    static rectVsRect(A, B) {
        return (
            A.x < B.x + B.width && // A no está a la derecha de B
            A.x + A.width > B.x && // A no está a la izquierda de B
            A.y < B.y + B.height && // A no está debajo de B
            A.y + A.height > B.y // A no está encima de B
        );
    }

    /**
     * Detección de colisiones entre dos círculos.
     * @param {object} A objeto con las propiedades x, y, width, height del círculo A
     * @param {object} B objeto con las propiedades x, y, width, height del círculo B
     * @returns {boolean} true si colisionan, false en caso contrario
    */
    static circleVsCircle(A, B) {
        
        // calcular distancia al cuadrado entre los centros de los círculos
        const rA = A.width / 2; // radio de A
        const rB = B.width / 2; // radio de B

        const ax = A.x + rA; // centro X de A
        const ay = A.y + rA; // centro Y de A

        const bx = B.x + rB; // centro X de B
        const by = B.y + rB; // centro Y de B

        const dx = ax - bx; // distancia en X entre centros
        const dy = ay - by;  // distancia en Y entre centros

        const dist = dx * dx + dy * dy; // distancia al cuadrado entre centros

        return dist <= (rA + rB) * (rA + rB);
    }

    /**
     * Detección de colisiones entre un círculo y un rectángulo alineado a los ejes.
     * @param {object} circle objeto con las propiedades x, y, width, height del círculo
     * @param {object} rect objeto con las propiedades x, y, width, height del rectángulo
     * @returns {boolean} true si colisionan, false en caso contrario
    */
    static circleVsRect(circle, rect) {
        // encontrar el punto más cercano del rectángulo al centro del círculo
        const cx = circle.x + circle.width / 2; // centro X del círculo
        const cy = circle.y + circle.height / 2; // centro Y del círculo
        const r = circle.width / 2; // radio del círculo

        // punto más cercano en el rectángulo
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

        // distancia entre el centro del círculo y el punto más cercano
        const dx = cx - closestX;
        const dy = cy - closestY;

        return (dx * dx + dy * dy) <= r * r;
    }

    /**
     * Detección de colisiones entre una elipse y un rectángulo alineado a los ejes.
     * @param {object} ellipse objeto con las propiedades x, y, width, height de la elipse
     * @param {object} rect objeto con las propiedades x, y, width, height del rectángulo
     * @returns {boolean} true si colisionan, false en caso contrario
    */
    static ellipseVsRect(ellipse, rect) { //se asume que la elipse está alineada a los ejes
        // radios de la elipse
        const rx = ellipse.width / 2;
        const ry = ellipse.height / 2;

        // encontrar el punto más cercano del rectángulo al centro de la elipse
        const cx = ellipse.x + rx;
        const cy = ellipse.y + ry;
        
        // punto más cercano en el rectángulo
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
        
        // normalizamos la distancia al sistema de coordenadas de la elipse
        const dx = (closestX - cx) / rx;
        const dy = (closestY - cy) / ry;

        // comprobamos si el punto está dentro de la elipse, usando la ecuación de la elipse (normalizada)
        return (dx * dx + dy * dy) <= 1;
    }   
}