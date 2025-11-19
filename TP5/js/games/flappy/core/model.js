// Model → base abstracta (posiciones, activo)
// Ejemplos:
/**
    Controladores lógicos (GameController, LevelController)
    new SpawnPoint(300, 0) donde ese punto del mapa indica dónde aparece un enemigo. No se mueve, no colisiona, solo indica una posición en el mapa.
*/
/** Triggers sin tamaño definido
    Un trigger puede solo definir un punto donde ocurre un evento:
    "cuando el jugador llegue al x = 500 → empieza música"
    "cuando el scroll llega a un punto → sube la dificultad"
    Esos objetos tienen posición, pero NO son entidades físicas.
*/ 
export class Model {
    constructor(x = 0, y = 0) {

        /** if (new.target === Model): Evita que se instancie directamente la clase abstracta (Model)
            new Model();    ❌ Error: No se puede instanciar la clase abstracta Model directamente.
            new Entity();   ✅ 
            new Obstacle(); ✅ 
        */

        if (new.target === Model) {
            throw new Error("No se puede instanciar la clase abstracta Model directamente.");
        }

        this.x = x;
        this.y = y;
        this.active = true; // todas las entidades pueden estar activas o no
    }

    /**
   * Método abstracto.
   * Las subclases deben implementarlo.
   */
    update(deltaTime) {
        // lógica genérica de actualización
         throw new Error(`${this.constructor.name} debe implementar el método update(deltaTime).`);
    }

    deactivate() {
        this.active = false;
    }
}