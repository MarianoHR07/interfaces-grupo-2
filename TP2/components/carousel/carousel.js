import { loadPage } from "../../js/index.js";

// precarga de templates
async function loadTemplates() {
  const [carouselHTML, imagesHTML] = await Promise.all([
    fetch("components/carousel/carousel.html").then((r) => r.text()),
    fetch("components/images/images.html").then((r) => r.text()),
  ])

  // insertamos los <template> invisibles en el body
  document.body.insertAdjacentHTML("beforeend", carouselHTML)
  document.body.insertAdjacentHTML("beforeend", imagesHTML)
}

window.new_Carousel = ({ games, category, quantity = 14, extraClasses = "" }) => {
  const templateCarousel = document.getElementById("carousel-template")
  if (!templateCarousel) {
    console.error("❌ Templates de carrusel no cargados aún.")
    return
  }

  const carouselClone = templateCarousel.content.cloneNode(true)
  const carouselContainer = carouselClone.querySelector(".carousel-container")
  const carousel = carouselClone.querySelector(".carousel")

  const itemTemplate = document.getElementById(`carousel-item-template`)
  if (!itemTemplate) {
    console.error("❌ Templates de item no cargados aún.")
    return
  }

  
  // const filtered = games.filter((g) => g.category.includes(category)).slice(0, quantity)
  const filtered = games;
 
  filtered.forEach((game) => {
    const itemClone = itemTemplate.content.cloneNode(true)
    const link = itemClone.querySelector("a")
    const img = itemClone.querySelector("img")
    const title = itemClone.querySelector("h3")
    link.href = game.link
    // link.addEventListener('click', (event) => {
    //   event.preventDefault();
    //   loadPage("gameplay.html");
    // })
    img.src = game.image
    img.alt = game.title
    title.textContent = game.title
    carousel.appendChild(itemClone)
  })

  const leftBtn = carouselClone.querySelector(".carousel-btn.left")
  const rightBtn = carouselClone.querySelector(".carousel-btn.right")

  function getVisibleItemsCount() {
    const containerWidth = carousel.offsetWidth
    const firstItem = carousel.querySelector(".game-card")

    if (!firstItem) return 1

    // Obtener el ancho del item incluyendo márgenes
    const itemStyle = window.getComputedStyle(firstItem)
    const itemWidth =
      firstItem.offsetWidth + Number.parseFloat(itemStyle.marginLeft) + Number.parseFloat(itemStyle.marginRight)

    // Calcular cuántos items caben completamente
    const visibleCount = Math.floor(containerWidth / itemWidth)
    return visibleCount > 0 ? visibleCount : 1
  }

  function getScrollAmount() {
    const firstItem = carousel.querySelector(".game-card")
    if (!firstItem) return 220 // fallback (retroceso)

    const itemStyle = window.getComputedStyle(firstItem)
    const itemWidth =
      firstItem.offsetWidth + Number.parseFloat(itemStyle.marginLeft) + Number.parseFloat(itemStyle.marginRight)

    const visibleCount = getVisibleItemsCount()
    return itemWidth * visibleCount
  }
  
// Función para mostrar/ocultar botones según scroll
  function updateButtons() {
    
    // scrollWidth: propiedad que devuelve el ancho completo del contenido del elemento, incluyendo el contenido que no es visible debido a un desbordamiento
    // offsetWidth: propiedad en JavaScript proporciona el ancho del diseño de un elemento HTML 
    const maxScroll = carousel.scrollWidth - carousel.offsetWidth 
    const currentScroll = carousel.scrollLeft

    if (currentScroll <= 0) {
      leftBtn.classList.add("hidden")
    } else {
      leftBtn.classList.remove("hidden")
    }

    if (currentScroll > 0 && currentScroll >= maxScroll) {
      rightBtn.classList.add("hidden")
    } else {
      rightBtn.classList.remove("hidden")
    }
  }

  rightBtn.addEventListener("click", () => {
    const scrollAmount = getScrollAmount()
    const maxScroll = carousel.scrollWidth - carousel.offsetWidth
    const newPosition = carousel.scrollLeft + scrollAmount

    // Si el nuevo desplazamiento excede el máximo, ir al final
    if (newPosition >= maxScroll) {
      carousel.scrollTo({ left: maxScroll, behavior: "smooth" })
    } else {
      carousel.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
    setTimeout(updateButtons, 300)
  })

  leftBtn.addEventListener("click", () => {
    const scrollAmount = getScrollAmount()
    const newPosition = carousel.scrollLeft - scrollAmount

    // Si el nuevo desplazamiento es menor que 0, ir al inicio
    if (newPosition <= 0) {
      carousel.scrollTo({ left: 0, behavior: "smooth" })
    } else {
      carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    }
    setTimeout(updateButtons, 300)
  })

  // Iniciar botones
  updateButtons()
  return carouselContainer
}


window.new_FeaturedCarousel = ({ games, category, quantity = 14 }) => {
  const templateCarousel = document.getElementById("carousel-template")
  if (!templateCarousel) {
    console.error("❌ Templates de carrusel no cargados aún.")
    return
  }

  const carouselClone = templateCarousel.content.cloneNode(true)
  const carouselContainer = carouselClone.querySelector(".carousel-container")
  const carousel = carouselClone.querySelector(".carousel")
  const track = carouselClone.querySelector(".carousel-track")

  const itemTemplate = document.getElementById("carousel-item-template")
  const gridTemplate = document.getElementById("carousel-grid-game-card-template")

  if (!itemTemplate || !gridTemplate) {
    console.error("❌ Templates de item o grid no cargados aún.")
    return
  }

  // const filtered = games.filter((g) => g.category.includes(category)).slice(0, quantity)
  const filtered = games;

  let i = 0
  while (i < filtered.length) {
    // 1️⃣ Crear grupo de 4 pequeñas
    const groupClone = gridTemplate.content.cloneNode(true)
    const gridContainer = groupClone.querySelector(".game-grid")

    for (let j = 0; j < 4 && i < filtered.length; j++, i++) {
      const game = filtered[i]

      const cardClone = itemTemplate.content.cloneNode(true)
      const card = cardClone.querySelector(".game-card")
      const img = card.querySelector("img")
      const title = card.querySelector("h3")

      card.classList.add("small")
      img.src = game.image
      img.alt = game.title
      title.textContent = game.title

      // card.addEventListener("click", (event) => {
      //   event.preventDefault()
      //   loadPage("gameplay.html");
      // })

      gridContainer.appendChild(card)
    }

    track.appendChild(groupClone)

    // 2️⃣ Crear 1 card grande
    if (i < filtered.length) {
      const game = filtered[i]
      const largeClone = itemTemplate.content.cloneNode(true)
      const card = largeClone.querySelector(".game-card")
      const img = card.querySelector("img")
      const title = card.querySelector("h3")

      card.classList.add("large")
      img.src = game.image
      img.alt = game.title
      title.textContent = game.title

      card.addEventListener("click", (event) => {
        event.preventDefault()
        loadPage("gameplay.html");
      })

      track.appendChild(largeClone)
      i++
    }
  }

  // 🔸 Variables para animación
  let currentIndex = 0
  let isAnimating = false

  function getVisibleItemsCount() {
    const containerWidth = carousel.offsetWidth
    const firstItem = track.querySelector(".game-card, .game-grid")
    if (!firstItem) return 1
    const itemStyle = window.getComputedStyle(firstItem)
    const itemWidth =
      firstItem.offsetWidth + Number.parseFloat(itemStyle.marginLeft) + Number.parseFloat(itemStyle.marginRight)
    return Math.floor(containerWidth / itemWidth)
  }

  function updateTrackPosition() {
    if (isAnimating) return

    const firstItem = track.querySelector(".game-card, .game-grid")

    if (!firstItem) return

    const itemStyle = window.getComputedStyle(firstItem)
    const itemWidth =
      firstItem.offsetWidth + Number.parseFloat(itemStyle.marginLeft) + Number.parseFloat(itemStyle.marginRight)

    const visibleCount = getVisibleItemsCount()
    const offset = -currentIndex * itemWidth * visibleCount

    // AGREGANDO CLASES ANIMACIONES
    isAnimating = true
    carousel.classList.add("sliding")
    track.classList.add("animating")
    const gameCards = track.querySelectorAll(".game-card");
    gameCards.forEach(card => {
      card.classList.add("skew");
    })
    const gameGridCards = track.querySelectorAll(".game-grid");
    gameGridCards.forEach(card => {
      card.classList.add("skew");
    })
    
    track.style.transform = `translateX(${offset}px)`
    // REMOVIENDO ANIMACIONES
    setTimeout(() => {
      carousel.classList.remove("sliding")
      track.classList.remove("animating");
      gameCards.forEach(card => {card.classList.remove("skew")})
      gameGridCards.forEach(card => {card.classList.remove("skew");})

      isAnimating = false
    }, 800) // Debe coincidir con la duración de la transición en CSS

  }

  // Botones
  const leftBtn = carouselClone.querySelector(".carousel-btn.left")
  const rightBtn = carouselClone.querySelector(".carousel-btn.right")

  function updateButtonVisibility() {
    const visibleCount = getVisibleItemsCount()
    const totalItems = track.children.length
    const maxIndex = Math.ceil(totalItems / visibleCount) - 1

    leftBtn.classList.toggle("hidden", currentIndex === 0)
    rightBtn.classList.toggle("hidden", currentIndex >= maxIndex)
  }

  rightBtn.addEventListener("click", () => {
    if (isAnimating) return

    const visibleCount = getVisibleItemsCount()
    const totalItems = track.children.length
    const maxIndex = Math.ceil(totalItems / visibleCount) - 1

    if (currentIndex < maxIndex) {
      currentIndex++
      updateTrackPosition()
      updateButtonVisibility()
    }
  })

  leftBtn.addEventListener("click", () => {
    if (isAnimating) return

    if (currentIndex > 0) {
      currentIndex--
      updateTrackPosition()
      updateButtonVisibility()
    }
  })

  updateButtonVisibility()

  return carouselContainer
}