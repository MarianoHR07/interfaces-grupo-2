async function loadTemplates() {
    const [carouselHTML] = await Promise.all([
      fetch("components/carousel/carousel.html").then(r => r.text()),
      
    ]);
    document.body.insertAdjacentHTML("beforeend", carouselHTML);
    
}

// Cargar listado de juegos desde games.json
async function loadGamesData() {
  const data = await fetch("games.json").then(r => r.json());
  return data;
}
  
  
// Transforma archivos en objetos {title,image,link}
function buildGameList(category, files, quantity) {
  if (!Array.isArray(files)) {
    console.warn(`⚠️ No se encontraron archivos para la categoría "${category}"`);
    return [];
  }

  return files.slice(0, quantity).map(filename => {
    const title = filename.substring(0, filename.lastIndexOf(".")) || filename;
    
    const tags = ["nuevo", "popular", ""];
    const randomTag = tags[Math.floor(Math.random() * tags.length)];

    return {
      title,
      image: `images/games/${category}/${filename}`,
      link: '#',
      category: [category],
      tag: randomTag
    };
  });
}


function initHome(container){

  // Flujo principal de Home.html
  Promise.all([loadTemplates(), loadGamesData()])
    .then(([_, gamesData]) => {
      let allGames = [];
      for (const category in gamesData) {
        const gamesFromCategory = buildGameList(category, gamesData[category], gamesData[category].length);
        allGames = allGames.concat(gamesFromCategory);
      }

      allGames.sort(() => Math.random() - 0.5);
      const selectedGames = allGames.slice(0, 14);
      ////////////////////////////////////////////////////////////////////////
      // 🎯 featured
      const featuredGame = {
        title: "Peg Solitaire",
        image: `images/Peg-Solitaire-tematica-minecraft.png`, 
        link: "#",
        category: ""
      };
      selectedGames.splice(4, 0, featuredGame);
      
      
      const featuredCarousel = new_FeaturedCarousel({
        games: selectedGames,
        category: "",
        type: "featured",
        quantity: 14,
        tag: ""
      });
      container.querySelector("#carouseles-container-1").prepend(featuredCarousel);
      ////////////////////////////////////////////////////////////////////////
      // 🎯 populares
      allGames.sort(() => Math.random() - 0.5);
      const selectedGamesPopular = allGames.slice(0, 15);

      const popularesCarousel = new_Carousel({
        games: selectedGamesPopular,
        category: "",
        type: "",
        quantity: 15,
        tag: "popular"
      });

      popularesCarousel.querySelectorAll(".tag-card-popular").forEach(card => {
        card.classList.add("active");
      });

      container.querySelector("#popular-carousele").appendChild(popularesCarousel);
      ////////////////////////////////////////////////////////////////////////
      // 🎯 nuevos
      allGames.sort(() => Math.random() - 0.5);
      const selectedGamesNew = allGames.slice(0, 15);

      const newCarousel = new_Carousel({
        games: selectedGamesNew,
        category: "",
        type: "",
        quantity: 15,
        tag: "nuevo"
      });

      newCarousel.querySelectorAll(".tag-card-new").forEach(card => {
        card.classList.add("active");
      });

      container.querySelector("#new-carousele").appendChild(newCarousel);
      ////////////////////////////////////////////////////////////////////////
      // 🎯 Aventuras
      const adventureGames = buildGameList("adventure", gamesData["adventure"], 32);
      const adventureCarousel = new_Carousel({
        games: adventureGames,
        category: "adventure",
        quantity: 32
      });
      container.querySelector("#adventure-carousele").appendChild(adventureCarousel);
      ////////////////////////////////////////////////////////////////////////
      // 🎯 Accion
      const actionGames = buildGameList("action", gamesData["action"], 32);
      const actionCarousel = new_Carousel({
        games: actionGames,
        category: "action",
        quantity: 32
      });
      container.querySelector("#action-carousele").appendChild(actionCarousel);

      ////////////////////////////////////////////////////////////////////////
      // 🎯 Autos

      const carsGames = buildGameList("cars", gamesData["cars"], 32);
      const carsCarousel = new_Carousel({
        games: carsGames,
        category: "cars",
        type: "",
        quantity: 32,
        tag: ""
      });
       
      container.querySelector("#cars-carousel").appendChild(carsCarousel);
      ////////////////////////////////////////////////////////////////////////
      // 🎯 strategy
      const strategyGames = buildGameList("strategy", gamesData["strategy"], 32);
      const strategyCarousel = new_Carousel({
        games: strategyGames,
        category: "strategy",
        type: "",
        quantity: 32,
        tag: "nuevo"
      });

      container.querySelector("#strategy-carousel").appendChild(strategyCarousel);
      ////////////////////////////////////////////////////////////////////////
      // 🎯 Moda
      const fashionGames = buildGameList("fashion", gamesData["fashion"], 32);
      const fashionCarousel = new_Carousel({
        games: fashionGames,
        category: "fashion",
        type: "",
        quantity: 30,
        tag: "nuevo"
      });

      container.querySelector("#fashion-carousel").appendChild(fashionCarousel);




      // ------------- Imagenes de "Lo mas preferido por la comunidad" ------------------
      let allGamesComunity = [];
      for (const category in gamesData) {
        const gamesFromCategory = buildGameList(category, gamesData[category], gamesData[category].length);
        allGamesComunity = allGamesComunity.concat(gamesFromCategory);
      }

      allGamesComunity.sort(() => Math.random() - 0.5);
      const selectedGamesComunity = allGamesComunity.slice(0, 7);

      renderMostLiked(container, selectedGamesComunity);


      // Inserta las imágenes en el contenedor
      function renderMostLiked(container, games) {
        const grid = container.querySelector(".img-recommended-community");
        if (!grid) return;
        
        grid.innerHTML = "";
        
        games.forEach(game => {
          const img = document.createElement("img");
          img.src = game.image;
          img.alt = game.title;
          grid.appendChild(img);
        });
      }
    });

}

