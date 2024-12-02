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