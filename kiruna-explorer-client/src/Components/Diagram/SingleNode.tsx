import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import CustomHandle from "./CustomHandle";
import { getIcon } from "../Utilities/DocumentIcons.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useState } from "react";
import React from 'react';
import { Item } from './DiagramBoard.js';
import GenericDocumentIcon from "../../assets/generic-document.svg";

interface SingleNodeProps extends NodeProps {
    data: {
        years: string[];
        distanceBetweenYears: number;
        clickedNode: string | null;
        group: Item[],
        pos:{x:number,y:number},
        zoom: number,
        showSingleDocument: (id:string) => void,
        showDiagramDoc:number | null,
        currentFilteredDoc: number
    };
}

function SingleNode({
    id,
    data
}: SingleNodeProps) {
    const { isDarkMode } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const isClicked = data.clickedNode === id;
    const elem = data.group[0]
    let zoom = data.zoom <= 0.9 ? 0.9 : data.zoom >= 2 ? 2 : data.zoom
    zoom = isClicked || isHovered? zoom /1.2 : zoom

    const {setCenter} = useReactFlow()

    if (id === data.showDiagramDoc?.toString() || id===`${data.currentFilteredDoc}`){
        setCenter(data.pos.x,data.pos.y, {zoom:1.2, duration:1000})
    }
    
    return (
        <>
        <div className={`${isClicked ? "" : "opacity-35"}`} title={`Title: ${elem.title} \nType: ${elem.type}`}
            style={{
                width: `${64 / zoom}px`,
                height: `${64 / zoom}px`,
                padding: `${1 / zoom}px`,
                transition: "all 0.4s"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}

            onClick={()=>{
                    setCenter(data.pos.x,data.pos.y, {zoom:1.2, duration:1000})
                }}>
            <div
                className={`flex flex-row justify-content-center align-content-center w-100 h-100 text-black_text dark:text-white_text rounded-full bg-light_node dark:bg-dark_node`}>
                <img src={getIcon({ type: elem.type.toLowerCase() }, { darkMode: isDarkMode })} alt="document icon"
                    style={{
                        padding: `${0.75 / zoom}em`
                    }} />
                <CustomHandle type="target" position={Position.Right}></CustomHandle>
                <CustomHandle type="source" position={Position.Left}></CustomHandle>
            </div>
        </div>
        {/* Open Document */}
        <div
                className={`fixed text-black_text dark:text-white_text rounded-full z-[1] bg-primary_color_light dark:bg-primary_color_dark hover:shadow-lg hover:shadow-primary_color_light/70 dark:hover:shadow-primary_color_dark/70 transition`}
                style={{
                    width: `${20 / zoom}px`,
                    height: `${20 / zoom}px`,
                    top: 0,
                    right: 0
                }}
                onClick={() => {
                    data.showSingleDocument(id)
                }}
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                    data.showSingleDocument(id)
                        
                    }
                }}>
                <img src={GenericDocumentIcon} alt="switch icon" className="p-1" />
            </div>
        </>
    );
}

export default SingleNode;