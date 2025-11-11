// import { Runner } from "../models/runner.js";
// // import { Obstacle } from "../models/obstacle.js";
// import { GameView } from "../views/gameView.js";

// export class GameController {
//     constructor(ctx) {
//         this.ctx = ctx;
//         this.runner = new Runner();
//         this.obstacles = [new Obstacle(300)];
//         this.view = new GameView(ctx);
//     }

//     // actualiza el estado del juego y de cada uno de los objetos
//     update(deltaTime) {
//         this.runner.update(deltaTime);
//         this.obstacles.forEach(o => o.update(deltaTime));
//     }
//     // renderiza el estado actual del juego en la pantalla
//     draw() {
//         this.view.draw(this.runner, this.obstacles);
//     }
// }