// models/star.js
import { BonusTypes } from "../core/bonusTypes.js";
import { Bonus } from "./bonus.js";

export class Star extends Bonus {
    static defaultWidth = 893 / 12 * 0.8;  // frameWidth * scale
    static defaultHeight = 69 * 0.8;        // frameHeight * scale
    static defaultColliderType = "circle";

    constructor(x, y, sprite) {
        super(x, y, "circle");

        this.sprite = sprite;

        this.frameCount = 12;
        this.frameWidth = 893 / 12;
        this.frameHeight = 69;
        this.scale = 0.8;

        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

    }

    getEffectData() {
        return {
            type: BonusTypes.STAR,
            duration: 5000
        };
    }

    /**
     * Método estático para crear un objeto con los atributos necesarios para un bonus "Star".
     * Este método hereda de la clase base `Bonus` y devuelve un objeto con los atributos necesarios
     * para un bonus de tipo "Star", con su tamaño y tipo de colisionador específicos.
     * 
     * @returns {Object} Objeto con los siguientes atributos:
     *   - `width`: El ancho del bonus "Star", calculado a partir de la escala y el tamaño de los fotogramas.
     *   - `height`: La altura del bonus "Star", también calculada a partir de la escala y el tamaño de los fotogramas.
     *   - `colliderType`: Tipo de colisionador para el bonus, en este caso siempre es "circle".
     */
    static createBonusData() {
    return super.createBonusData(Star.defaultWidth, Star.defaultHeight, Star.defaultColliderType);;
    }
}