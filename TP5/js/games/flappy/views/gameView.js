// import { View } from "../core/view.js";

// export class GameView extends View {
//     draw(runner, obstacles) {
//         const ctx = this.ctx;
//         ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//         // Fondo
//         ctx.fillStyle = "#70c5ce";
//         ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//         // Runner
//         ctx.fillStyle = "yellow";
//         ctx.beginPath();
//         ctx.arc(runner.x, runner.y, 10, 0, Math.PI * 2);
//         ctx.fill();

//         // Obstacles   
//         ctx.fillStyle = "green";
//         obstacles.forEach(o => {
//             ctx.fillRect(o.x, 0, o.width, o.top);
//             ctx.fillRect(o.x, o.bottom, o.width, ctx.canvas.height - o.bottom);
//         });
//     }
// }