// --- Funciones auxiliares para acceder a los píxeles ---

function getRed(imageData, x, y){
  const ind = (x + y * imageData.width) * 4;
  return imageData.data[ind + 0];
}

function getGreen(imageData, x, y){
  const ind = (x + y * imageData.width) * 4;
  return imageData.data[ind + 1];
}

function getBlue(imageData, x, y){
  const ind = (x + y * imageData.width) * 4;
  return imageData.data[ind + 2];
}

// --- Función para modificar un píxel ---
function setPixel(imageData, x, y, r, g, b, a) {
  const ind = (x + y * imageData.width) * 4;
  imageData.data[ind + 0] = r;
  imageData.data[ind + 1] = g;
  imageData.data[ind + 2] = b;
  imageData.data[ind + 3] = a;
}

// --- Aplicar un filtro a todos los pixeles de una imagen ---
// IMPORTANTE: iterar sobre imageData.width/height (no sobre canvas global)
function applyFilter(imageData, filter) {
  const w = imageData.width;
  const h = imageData.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (x + y * w) * 4;

      const r = getRed(imageData, x, y);
      const g = getGreen(imageData, x, y);
      const b = getBlue(imageData, x, y);
      const a = imageData.data[i + 3];

      const [nr, ng, nb, na] = filter(r, g, b, a);

      // normalizar valores por si el filtro devuelve floats / fuera de rango
      const rn = Math.round(Math.min(255, Math.max(0, nr)));
      const gn = Math.round(Math.min(255, Math.max(0, ng)));
      const bn = Math.round(Math.min(255, Math.max(0, nb)));
      const an = Math.round(Math.min(255, Math.max(0, na)));

      setPixel(imageData, x, y, rn, gn, bn, an);
    }
  }
  return imageData;
}

// --- Filtros ---
function averageGrayFilter(r, g, b, a){
  const grey = Math.round((r + g + b) / 3);
  return [grey, grey, grey, a];
}

function blackAndWhiteFilter(r, g, b, a) { // GREY-BT.601
  const grey = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
  return [grey, grey, grey, a];
}

function sepiaFilter(r, g, b, a) {
  const nr = 0.393 * r + 0.769 * g + 0.189 * b;
  const ng = 0.349 * r + 0.686 * g + 0.168 * b;
  const nb = 0.272 * r + 0.534 * g + 0.131 * b;
  return [nr, ng, nb, a];
}

function negativeFilter(r, g, b, a) {
  return [255 - r, 255 - g, 255 - b, a];
}

function opacityFilter(r, g, b, a, k) {
  return [r, g, b, Math.round(a * k)];
}

function brightnessFilter(r, g, b, a, k) {
  const factor = 1 + k;
  return [
    r * factor,
    g * factor,
    b * factor,
    a
  ];
}

// --- Filter selector ---
function setFilter(imageData, filterType, k = 1) {
  switch (filterType) {
    case "none":
      return imageData;

    case "grey":
      return applyFilter(imageData, averageGrayFilter);

    case "blackAndWhite":
      return applyFilter(imageData, blackAndWhiteFilter);

    case "sepia":
      return applyFilter(imageData, sepiaFilter);

    case "negative":
      return applyFilter(imageData, negativeFilter);

    case "opacity":
      return applyFilter(imageData, (r, g, b, a) => opacityFilter(r, g, b, a, k));

    case "brightness":
      return applyFilter(imageData, (r, g, b, a) => brightnessFilter(r, g, b, a, k));

    default:
      return imageData;
  }
}

