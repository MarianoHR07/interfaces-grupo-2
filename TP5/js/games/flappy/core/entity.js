/**  Entity → no agrega movimiento; solo significa "entidad del juego"
 * Primera capa visible (toda entidad dibujable tiene tamaño).
 *
 * Agrupa cosas que son entidades del juego, pero no define comportamiento físico.
    
 * ej: Cosas que no deberían tener velocidad
      - Una plataforma estática 
      - Una moneda flotando fija como en Mario
      - Una trampa que solo rota, pero no se traslada, es una entidad pero no un objeto movible)
      - Decoraciones del escenario que no se mueven 
*/
import { Model } from "./model.js";

export class Entity extends Model {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y);
    this.width = width;
    this.height = height;
    
  }

  update(deltaTime) {
   // Entity por defecto no hace nada
  }
}
