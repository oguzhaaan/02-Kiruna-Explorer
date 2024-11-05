import agreementIcon from "../../assets/agreement.svg";
import conflictIcon from "../../assets/conflict.svg";
import consultationIcon from "../../assets/consultation.svg";
import designIcon from "../../assets/design.svg";
import materialEffectIcon from "../../assets/material_effect.svg";
import prescriptiveIcon from "../../assets/prescriptive.svg";
import technicalIcon from "../../assets/technical.svg";
import informativeIcon from "../../assets/informative.svg";

function getIcon({type}) {
    
        switch (type) {
            case "agreement":
                return agreementIcon;
            case "conflict":
                return conflictIcon;
            case "consultation":
                return consultationIcon;
            case "design":
                return designIcon;
            case "material effect":
                return materialEffectIcon;
            case "prescriptive":
                return prescriptiveIcon;
            case "technical":
                return technicalIcon;
            case "informative":
                return informativeIcon;
            default:
                return informativeIcon;
        }
}

export {getIcon};