function getStakeholderColor({stakeholder}) {
    switch (stakeholder) {
        case "Municipality":
            return "bg-[#8F3C3C]";
        case "Citizens":
            return "bg-[#417C95]";
        case "LKAB":
            return "bg-[#8C3C8F]";
        case "Regional authority":
            return "bg-[#8F803C]";
        case "Architecture firms":
            return "bg-[#598F3C]";
        case "Others":
            return "bg-[#3C8F4D]";
        default:
            return "bg-white";
    }
}

export {getStakeholderColor};