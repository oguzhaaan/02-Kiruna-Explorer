import {useEffect, useState} from "react";

function Alert(props) {
    const color = props.type === "error" ? "text-my_red" : props.type === "warning" ? "text-my_orange" : props.type === "success" ? "text-my_green" : "text-white";
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (props.message !== "") {
            setIsVisible(true);
            setTimeout(() => {
                setIsVisible(false);
                props.clearMessage();
            }, 3000);
        }
    }, [props.message]);

    return (
            <div
                className={`fixed z-[35000] top-0 left-0 overflow-hidden ${isVisible? "h-14" : "h-0" } w-full flex items-center justify-center bg- backdrop-blur-2xl bg-box_color rounded-b-xl transition-all`}>
                <div className={`p-3 flex flex-col gap-4 ${color} text-xl`}>
                    <div className="flex flex-col gap-2 overflow-hidden">
                        {
                            props.message
                        }
                    </div>
                </div>
            </div>
    )
}

export default Alert;