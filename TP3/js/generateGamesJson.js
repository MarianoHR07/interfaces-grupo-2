const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "../images/games");
const categories = fs.readdirSync(baseDir);
const result = {};

categories.forEach(cat => {
  const catPath = path.join(baseDir, cat);
  const files = fs.readdirSync(catPath).filter(f => {
    // solo imágenes comunes
    return /\.(png|jpg|jpeg|webp|gif)$/i.test(f);
  });
  result[cat] = files;
});

fs.writeFileSync("games.json", JSON.stringify(result, null, 2));
console.log("✅ Archivo games.json generado con éxito");

// instruccion para actualizar JSON en bash :: node generateGamesJson.js