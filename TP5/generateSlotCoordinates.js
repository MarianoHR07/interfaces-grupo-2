
export function detectSlots(canvas,image, w, h) {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = data.data;
    const width = canvas.width, height = canvas.height;
    const visited = new Array(width * height).fill(false);
    const regions = [];

    function getBrightness(r,g,b){ return 0.299*r + 0.587*g + 0.114*b; }
    function isPotentialSlot(r,g,b){ return getBrightness(r,g,b) < 5; }

    function floodFill(x, y) {
        const stack = [[x, y]];
        const region = [];
        while (stack.length) {
            const [cx, cy] = stack.pop();
            const idx = cy * width + cx;
            if (visited[idx]) continue;
            visited[idx] = true;
            const i = idx * 4;
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            if (isPotentialSlot(r, g, b)) {
                region.push({x: cx, y: cy});
                if (cx > 0) stack.push([cx - 1, cy]);
                if (cx < width - 1) stack.push([cx + 1, cy]);
                if (cy > 0) stack.push([cx, cy - 1]);
                if (cy < height - 1) stack.push([cx, cy + 1]);
            }
        }
        return region;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const i = idx * 4;
            const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
            if (!visited[idx] && isPotentialSlot(r, g, b)) {
                const region = floodFill(x, y);
                if (region.length > 200) regions.push(region); // mayor umbral para cuadrados
            }
        }
    }

    const slots = regions.map((region, index) => {
        const xs = region.map(p => p.x);
        const ys = region.map(p => p.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);

        const widthBox = maxX - minX;
        const heightBox = maxY - minY;
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        return {
            id: `slot_${index + 1}`,
            center: { x: Math.round(cx), y: Math.round(cy) },
            size: { width: widthBox, height: heightBox }
        };
    });

    console.log(slots);

    // Dibujar los rectángulos
    ctx.strokeStyle = "red";
    ctx.font = "12px Arial";
    ctx.fillStyle = "yellow";
    slots.forEach(s => {
        ctx.strokeRect(
            s.center.x - s.size.width / 2,
            s.center.y - s.size.height / 2,
            s.size.width,
            s.size.height
        );
        ctx.fillText(s.id, s.center.x - 10, s.center.y);
    });

    // Descargar JSON
    const json = JSON.stringify(slots, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slots_data.json";
    a.click();
    URL.revokeObjectURL(url);
}