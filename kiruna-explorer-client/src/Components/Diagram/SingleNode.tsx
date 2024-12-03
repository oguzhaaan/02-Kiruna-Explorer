import { NodeProps, Position } from '@xyflow/react';
import CustomHandle from "./CustomHandle";
import { getIcon } from "../Utilities/DocumentIcons.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useState } from "react";
import React from 'react';
import { Item } from './DiagramBoard.js';

interface SingleNodeProps extends NodeProps {
    data: {
        years: string[];
        distanceBetweenYears: number;
        clickedNode: string | null;
        group: Item[],
        zoom: number,
    };
}

function SingleNode({
    id,
    data
}: SingleNodeProps) {
    const { isDarkMode } = useTheme();
    const isClicked = data.clickedNode === id;
    const elem = data.group[0]
    let zoom = data.zoom <= 0.9 ? 0.9 : data.zoom >=2? 2: data.zoom
    return (
        <div className={`${isClicked ? "" : "opacity-35"}`} title={elem.title}
            style={{
                width: `${64 / zoom}px`,
                height: `${64 / zoom}px`,
                padding: `${1 / zoom}px`
            }}
            >
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
    );
}

export default SingleNode;