function getStakeholderColor({stakeholder}) {
    switch (stakeholder) {
        case "municipality":
            return "bg-[#8F3C3C]";
        case "citizens":
            return "bg-[#417C95]";
        case "lkab":
            return "bg-[#8C3C8F]";
        case "regional authority":
            return "bg-[#8F803C]";
        case "architecture firms":
            return "bg-[#598F3C]";
        case "others":
            return "bg-[#3C8F4D]";
        default:
            return "bg-sky-700";
    }
}

export {getStakeholderColor};