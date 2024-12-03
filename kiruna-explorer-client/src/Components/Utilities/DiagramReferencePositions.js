export const YScalePosition =  {
    text: 165,
    concept: 515,
    plan100000: 805,
    plan10000: 980,
    plan5000: 1280,
    plan1000: 1455,
    blueprints: 1870
}

export function getXDatePosition(firstyear, year, month){
    const offset = 0
    const yearindex = parseInt(year)-parseInt(firstyear)

    return parseInt(offset+ (yearindex*400) + ((400/13) * parseInt(month)))
}
  
export function getEquidistantPoints(x, y, r, N) {
    const points = [];
  
    for (let i = 0; i < N; i++) {
      const angle = (2 * Math.PI * i) / N; // Angolo in radianti
      const px = x + r * Math.cos(angle); // Calcolo della coordinata x
      const py = y + r * Math.sin(angle); // Calcolo della coordinata y
  
      points.push({ x: px, y: py });
    }
  
    return points;
  }