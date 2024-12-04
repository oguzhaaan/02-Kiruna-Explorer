import agreementIcon from "../../assets/agreement.svg";
import conflictIcon from "../../assets/conflict.svg";
import consultationIcon from "../../assets/consultation.svg";
import designIcon from "../../assets/design.svg";
import materialEffectIcon from "../../assets/material_effect.svg";
import prescriptiveIcon from "../../assets/prescriptive.svg";
import technicalIcon from "../../assets/technical.svg";
import informativeIcon from "../../assets/informative.svg";
import agreementIconLight from "../../assets/agreement-black.svg";
import conflictIconLight from "../../assets/conflict-black.svg";
import consultationIconLight from "../../assets/consultation-black.svg";
import designIconLight from "../../assets/design-black.svg";
import materialEffectIconLight from "../../assets/material_effect-black.svg";
import prescriptiveIconLight from "../../assets/prescriptive-black.svg";
import technicalIconLight from "../../assets/technical-black.svg";
import informativeIconLight from "../../assets/informative-black.svg";
import pdfIcon from "../../assets/pdf-file.svg";
import genericIcon from "../../assets/generic-file.svg";
import jpegIcon from "../../assets/jpeg-file.svg";
import jpgIcon from "../../assets/jpg-file.svg";
import pngIcon from "../../assets/png-file.svg";
import svgIcon from "../../assets/svg-file.svg";
import txtIcon from "../../assets/txt-file.svg";
import genericIconLight from "../../assets/generic-file-light.svg"
import jpegIconLight from "../../assets/jpeg-file-light.svg";
import jpgIconLight from "../../assets/jpg-file-light.svg";
import pdfIconLight from "../../assets/pdf-file-light.svg";
import pngIconLight from "../../assets/png-file-light.svg";
import svgIconLight from "../../assets/svg-file-light.svg";
import txtIconLight from "../../assets/txt-file-light.svg";

function getIcon({ type }, { darkMode }) {
    //console.log("Type:" + type);
    const type_lower = type ? type.toLowerCase() : type;

    switch (type_lower) {
        case "agreement":
            return darkMode ? agreementIcon : agreementIconLight;
        case "conflict":
            return darkMode ? conflictIcon : conflictIconLight;
        case "consultation":
            return darkMode ? consultationIcon : consultationIconLight;
        case "design":
            return darkMode ? designIcon : designIconLight;
        case "material effects":
            return darkMode ? materialEffectIcon : materialEffectIconLight;
        case "prescriptive":
            return darkMode ? prescriptiveIcon : prescriptiveIconLight;
        case "technical":
            return darkMode ? technicalIcon : technicalIconLight;
        case "informative":
            return darkMode ? informativeIcon : informativeIconLight;
        default:
            return darkMode ? genericIconLight : genericIcon;
    }
}

function getIconByExtension({ fileName }, { darkMode }) {
    if (!fileName) return genericIcon;

    // Estrai l'estensione del file e converti in minuscolo
    let ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
        case "pdf":
            return darkMode ? pdfIconLight : pdfIcon;
        case "jpeg":
            return darkMode ? jpegIconLight : jpegIcon;
        case "jpg":
            return darkMode ? jpgIconLight : jpgIcon;
        case "png":
            return darkMode ? pngIconLight : pngIcon;
        case "svg":
            return darkMode ? svgIconLight : svgIcon;
        case "txt":
            return darkMode ? txtIconLight : txtIcon;
        default:
            return darkMode ? genericIconLight : genericIcon;
    }
}

export { getIcon, getIconByExtension };