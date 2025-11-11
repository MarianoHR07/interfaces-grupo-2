// import { GameController } from "../controllers/gameController.js";

// export class Game {
//     constructor(canvas) {
//         this.canvas = canvas;
//          /** @type {CanvasRenderingContext2D} */
//         this.ctx = canvas.getContext('2d');
//         this.lastTime = 0;

//         this.controller = new GameController(this.ctx);
//     }

//     start() {
//         requestAnimationFrame(this.loop.bind(this));
//     }

//     loop(timestamp) {
//         const deltaTime = timestamp - this.lastTime;
//         this.lastTime = timestamp;

//         this.controller.update(deltaTime);
//         this.controller.draw();

//         requestAnimationFrame(this.loop.bind(this));
//     }
// }