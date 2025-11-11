// async function loadGamesData() {
//     const data = await fetch("../../games.json").then(r => r.json());
//     return data;
// }

// function buildGameList(category, files) {
//     return files.map(filename => ({
//         title: filename.substring(0, filename.lastIndexOf(".")) || filename,
//         image: `../../images/games/${category}/${filename}` // ruta según tu estructura
//     }));
// }

// function createGameCards(allGames) {
//     const container = document.getElementById("gameGridContainer");
//     if (!container) return;

//     container.innerHTML = '';

//     allGames.forEach(game => {
//         const cardDiv = document.createElement("div");
//         cardDiv.classList.add("game-card-bg");

//         const img = document.createElement("img");
//         img.src = game.image;
//         img.alt = game.title;

//         const title = document.createElement("p");
//         title.textContent = game.title;

//         cardDiv.appendChild(img);
//         container.appendChild(cardDiv);
//     });
// }

// // Cargar datos y generar cards
// loadGamesData().then(gamesData => {
//     const allGames = [];
//     for (const [category, files] of Object.entries(gamesData)) {
//         allGames.push(...buildGameList(category, files));
//     }
//     createGameCards(allGames);
// });