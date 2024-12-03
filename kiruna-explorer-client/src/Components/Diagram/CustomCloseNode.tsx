import { NodeProps, Position } from '@xyflow/react';
import CustomHandle from "./CustomHandle";
import { getIcon } from "../Utilities/DocumentIcons.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useState } from "react";
import React from 'react';
import { Item } from './DiagramBoard.js';

interface CustomCloseNodeProps extends NodeProps {
    data: {
        zoom:number
    };
}

function CloseNode({
    id,
    data
}: CustomCloseNodeProps) {
    const { isDarkMode } = useTheme();
    
    let zoom = data.zoom <= 0.9 ? 0.9 : data.zoom >=2? 2: data.zoom
    return (
        <div title="close"
            style={{
                width: `${34 / zoom}px`,
                height: `${34 / zoom}px`,
                padding: `${1 / zoom}px`
            }}
            >
            <div
                className={`flex flex-row justify-content-center align-content-center w-100 h-100 text-black_text dark:text-white_text rounded-full bg-light_node dark:bg-dark_node`}>
                <i className="bi bi-x"></i>
            </div>
        </div>
    );
}

export default CloseNode;