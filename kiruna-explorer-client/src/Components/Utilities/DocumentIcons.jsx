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

function getIcon({type}, {darkMode}) {
    
        switch (type) {
            case "agreement":
                return darkMode ? agreementIcon : agreementIconLight;
            case "conflict":
                return darkMode ? conflictIcon : conflictIconLight;
            case "consultation":
                return darkMode ? consultationIcon : consultationIconLight;
            case "design":
                return darkMode ? designIcon : designIconLight;
            case "material effect":
                return darkMode ? materialEffectIcon : materialEffectIconLight;
            case "prescriptive":
                return darkMode ? prescriptiveIcon : prescriptiveIconLight;
            case "technical":
                return darkMode ? technicalIcon : technicalIconLight;
            case "informative":
                return darkMode ? informativeIcon : informativeIconLight;
            default:
                return darkMode ? informativeIcon : informativeIconLight;
        }
}

export {getIcon};