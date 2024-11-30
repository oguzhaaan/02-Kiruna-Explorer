import {NodeProps, Position} from '@xyflow/react';
import CustomHandle from "./CustomHandle";
import {getIcon} from "../Utilities/DocumentIcons.jsx";
import {useTheme} from "../../contexts/ThemeContext.jsx";
// @ts-ignore
import switchIcon from "../../assets/switch.svg";
import {useState} from "react";

interface GroupNodeProps extends NodeProps {
    data: {
        years: string[];
        distanceBetweenYears: number;
        clickedNode: string | null;
    };
}

function GroupNode({
                       id,
                       data
                   }: GroupNodeProps) {
    const {isDarkMode} = useTheme();

    const mockData = [{id: 1, text: "ciao1", icon: "conflict"}, {id: 2, text: "ciao2", icon: "design"}, {
        id: 3,
        text: "ciao3",
        icon: "technical"
    }]
    const [selectedDocument, setSelectedDocument] = useState(2);

    const isClicked = data.clickedNode === id;

    const [isDropDownOpen, setIsDropDownOpen] = useState(false);

    return (
        <>
            <div className={`w-16 h-16 p-1 ${isClicked ? "" : "opacity-35"}`}
                 title={mockData[selectedDocument - 1].text}>
                <div
                    className={`flex flex-row justify-content-center align-content-center w-100 h-100 text-black_text dark:text-white_text rounded-full bg-light_node dark:bg-dark_node`}>
                    <img src={getIcon({type: mockData[selectedDocument - 1].icon}, {darkMode: isDarkMode})}
                         alt="document icon" className="p-[0.75rem]"/>
                </div>

                <div
                    className={`absolute w-14 h-14 text-black_text dark:text-white_text rounded-full z-[-1] top-0.5 left-1.5 bg-[#999999] dark:bg-[#797979]`}>
                </div>

                <div
                    className={`absolute w-14 h-14 text-black_text dark:text-white_text rounded-full z-[-2] top-0 left-2 bg-[#555555] dark:bg-[#C8C8C8]`}>
                </div>

                <CustomHandle type="target" position={Position.Right}></CustomHandle>
                <CustomHandle type="source" position={Position.Left}></CustomHandle>
            </div>
            {
                !isDropDownOpen ?
                    <div
                        className={`fixed w-5 h-5 text-black_text dark:text-white_text rounded-full z-[1] bottom-0 right-0 bg-primary_color_light dark:bg-primary_color_dark hover:shadow-lg hover:shadow-primary_color_light/70 dark:hover:shadow-primary_color_dark/70 transition`}
                        onClick={() => {
                            setIsDropDownOpen(!isDropDownOpen);
                        }}>
                        <img src={switchIcon} alt="switch icon" className="p-1"/>
                    </div>
                    :
                    <div
                        className="z-[5] absolute top-11 left-11 animate-fade animate-once animate-duration-500 text-black_text dark:text-white_text bg-primary_color_light dark:bg-primary_color_dark rounded-md w-[20rem] max-h-60 min-h-0 p-2 text-md flex flex-col"
                        onClick={() => {
                            setIsDropDownOpen(!isDropDownOpen);
                        }}>
                        <div className="flex flex-row gap-1 align-items-center w-full px-1">
                            <img src={switchIcon} alt="switch icon" className=""/>
                            <p className="m-0 p-0">Switch the document to visualize</p>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 overflow-y-auto p-1">
                            {mockData.map((data, index) => (
                                <div key={index}
                                     className={`flex flex-row gap-2 align-items-center w-full ${data.id == selectedDocument ? "bg-[#CBDCEF] dark:bg-[#11253D] outline outline-1 outline-[#44444499] dark:outline-[#cccccc]" : "bg-[#00000050] hover:bg-[#00000099]"} rounded-sm p-2 transition`}
                                     onClick={() => {
                                         setSelectedDocument(data.id);
                                         setIsDropDownOpen(!isDropDownOpen);
                                     }}>
                                    <img src={getIcon({type: data.icon}, {darkMode: isDarkMode})} alt="document icon"
                                         className="w-6"/>
                                    <div className="font-normal text-truncate line-clamp-1"
                                         title={data.text}>{data.text}</div>
                                </div>))
                            }
                        </div>
                    </div>
            }
        </>
    );
}

export default GroupNode;