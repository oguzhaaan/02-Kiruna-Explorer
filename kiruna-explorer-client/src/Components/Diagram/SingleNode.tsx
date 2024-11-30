import {NodeProps, Position} from '@xyflow/react';
import CustomHandle from "./CustomHandle";
import {getIcon} from "../Utilities/DocumentIcons.jsx";
import {useTheme} from "../../contexts/ThemeContext.jsx";
import {useState} from "react";

interface SingleNodeProps extends NodeProps {
    data: {
        years: string[];
        distanceBetweenYears: number;
        clickedNode: string | null;
    };
}

function SingleNode({
                        id,
                        data
                    }: SingleNodeProps) {
    const {isDarkMode} = useTheme();
    const isClicked = data.clickedNode === id;

    return (
        <div className={`w-16 h-16 p-1 ${isClicked? "" : "opacity-35"}`} title="title of the document">
            <div
                className={`flex flex-row justify-content-center align-content-center w-full h-full text-black_text dark:text-white_text rounded-full bg-light_node dark:bg-dark_node`}>
                <img src={getIcon({type: ""}, {darkMode: isDarkMode})} alt="document icon" className="p-[0.75rem]"/>
                <CustomHandle type="target" position={Position.Right}></CustomHandle>
                <CustomHandle type="source" position={Position.Left}></CustomHandle>
            </div>
        </div>
    );
}

export default SingleNode;