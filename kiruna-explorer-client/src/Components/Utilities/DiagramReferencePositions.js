export const YScalePosition =  {
    text: 165,
    concept: 515,
    plan100000: 805,
    plan10000: 980,
    plan5000: 1280,
    plan1000: 1455,
    planmin: 700,
    planmax: 1600,
    blueprints: 1870
}

export function getXDatePosition(firstyear, year, month){
    const offset = 0
    const yearindex = parseInt(year)-parseInt(firstyear)

    const xoffset = month? month - 1 : 0
    return parseInt(offset+ (yearindex*400) + ((400/12) * parseInt(xoffset)))
}

export function getYPlanScale(planNumber){
  if( planNumber < YScalePosition["plan1000"]){
      return YScalePosition["planmin"] + ((YScalePosition["plan1000"] - YScalePosition["planmin"]) / 1000) *planNumber
  }
  else if( planNumber < YScalePosition["plan5000"]){
    return YScalePosition["plan1000"] + ((YScalePosition["plan5000"] - YScalePosition["plan1000"]) / 4000) *(planNumber-1000)
  }
  else if( planNumber < YScalePosition["plan10000"]){
    return YScalePosition["plan5000"] + ((YScalePosition["plan10000"] - YScalePosition["plan5000"]) / 5000) *(planNumber-5000)
  }
  else if( planNumber < YScalePosition["plan100000"]){
    return YScalePosition["plan10000"] + ((YScalePosition["plan100000"] - YScalePosition["plan10000"]) / 90000) *(planNumber-10000)
  }
  else {
    return YScalePosition["plan100000"] + ((YScalePosition["planmax"] - YScalePosition["plan100000"]) / 100000) *(planNumber-100000)
  }
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