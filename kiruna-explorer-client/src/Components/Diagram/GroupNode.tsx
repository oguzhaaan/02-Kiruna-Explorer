import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import CustomHandle from "./CustomHandle";
import { getIcon } from "../Utilities/DocumentIcons.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
// @ts-ignore

import GenericDocumentIcon from "../../assets/generic-document.svg"
import switchIcon from "../../assets/switch.svg"

import { useEffect, useState } from "react";
import React from 'react';
import { Item } from './DiagramBoard.js';

interface GroupNodeProps extends NodeProps {
    data: {
        years: string[];
        distanceBetweenYears: number;
        clickedNode: string | null;
        group: Item[],
        pos:{x:number,y:number},
        zoom: number;
        setNodeSelected: (id: number) => void
        showSingleDocument: (id:string) => void
        showDiagramDoc:number | null;
        currentFilteredDoc: number
    };
}

function GroupNode({
    id,
    data
}: GroupNodeProps) {
    const { isDarkMode } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(data.group[data.group.findIndex((e) => `${e.docid}` === id)]);

    const isClicked = data.clickedNode === id || id === `${data.showDiagramDoc}`;

    const [isDropDownOpen, setIsDropDownOpen] = useState(false);

    let zoom = data.zoom <= 0.9 ? 0.9 : data.zoom >= 2 ? 2 : data.zoom
    zoom = isClicked || isHovered? zoom /1.2 : zoom

    const {setCenter} = useReactFlow()

    if (id === data.showDiagramDoc?.toString() || id===`${data.currentFilteredDoc}`){
        setCenter(data.pos.x,data.pos.y, {zoom:1.2, duration:1000})
    }

    return (
        <>
            <div className={` ${isClicked ? "" : "opacity-35"}`}
                style={{
                    width: `${64 / zoom}px`,
                    height: `${64 / zoom}px`,
                    padding: `${1 / zoom}px`,
                    transition: "all 0.4s"
                }}
                title={`Title: ${selectedDocument.title} \nType: ${selectedDocument.type}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={()=>{
                    setCenter(data.pos.x,data.pos.y, {zoom:1.2, duration:1000})
                }}
                >
                <div
                    className={`flex flex-row w-100 h-100 justify-content-center align-content-center text-black_text dark:text-white_text rounded-full bg-light_node dark:bg-dark_node`}
                >
                    <img src={getIcon({ type: selectedDocument.type.toLowerCase() }, { darkMode: isDarkMode })}
                        alt="document icon" style={{
                            padding: `${0.75 / zoom}em`
                        }} />
                </div>

                <div
                    className={`absolute text-black_text dark:text-white_text rounded-full z-[-1] bg-[#999999] dark:bg-[#797979]`}
                    style={{
                        width: `${64 / zoom}px`,
                        height: `${64 / zoom}px`,
                        bottom: `${2 * 1.5 * zoom}px`,
                        left: `${4 * 1.5 * zoom}px`,
                    }}>
                </div>

                <div
                    className={`absolute text-black_text dark:text-white_text rounded-full z-[-2] bg-[#555555] dark:bg-[#C8C8C8]`}
                    style={{
                        width: `${64 / zoom}px`,
                        height: `${64 / zoom}px`,
                        bottom: `${4 * 1.5 * zoom}px`,
                        right: `${1 * 1.5 * zoom}px`,
                    }}
                >
                </div>

                <CustomHandle type="target" position={Position.Right}></CustomHandle>
                <CustomHandle type="source" position={Position.Left}></CustomHandle>
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
                    data.showSingleDocument(`${selectedDocument.docid}`)
                }}
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        data.showSingleDocument(`${selectedDocument.docid}`)  
                    }
                }}>
                <img src={GenericDocumentIcon} alt="switch icon" className="p-1" />
            </div>
            {
                !isDropDownOpen ?
                    <div
                        className={`fixed text-black_text dark:text-white_text rounded-full z-[1] bg-primary_color_light dark:bg-primary_color_dark hover:shadow-lg hover:shadow-primary_color_light/70 dark:hover:shadow-primary_color_dark/70 transition`}
                        style={{
                            width: `${20 / zoom}px`,
                            height: `${20 / zoom}px`,
                            bottom: 0,
                            right: 0
                        }}
                        onClick={() => {
                            setIsDropDownOpen(!isDropDownOpen);
                        }}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                setIsDropDownOpen(!isDropDownOpen);
                            }
                        }}>
                        <img src={switchIcon} alt="switch icon" className="p-1" />
                    </div>
                    :
                    <div
                        className="z-[5] absolute top-11 left-11 animate-fade animate-once animate-duration-500 text-black_text dark:text-white_text bg-primary_color_light dark:bg-primary_color_dark rounded-md w-[20rem] max-h-60 min-h-0 p-2 text-md flex flex-col"
                        onClick={() => {
                            setIsDropDownOpen(!isDropDownOpen);
                        }}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                setIsDropDownOpen(!isDropDownOpen);
                            }
                        }}
                    >
                        <div className="flex flex-row gap-1 align-items-center w-full px-1">
                            <img src={switchIcon} alt="switch icon" className="" />
                            <p className="m-0 p-0">Switch the document to visualize</p>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 overflow-y-auto p-1">
                            {data.group.map((d, index) => (
                                <div key={index}
                                    className={`flex flex-row gap-2 align-items-center w-full ${d == selectedDocument ? "bg-[#CBDCEF] dark:bg-[#11253D] outline outline-1 outline-[#44444499] dark:outline-[#cccccc]" : "bg-[#00000050] hover:bg-[#00000099]"} rounded-sm p-2 transition`}
                                    onClick={() => {
                                        setSelectedDocument(d);
                                        setIsDropDownOpen(!isDropDownOpen);
                                        data.setNodeSelected(d.docid);
                                    }}
                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter') {
                                            setSelectedDocument(d);
                                            setIsDropDownOpen(!isDropDownOpen);
                                            data.setNodeSelected(d.docid);
                                        }
                                    }}
                                >
                                    <img src={getIcon({ type: d.type.toLowerCase() }, { darkMode: isDarkMode })} alt="document icon"
                                        className="w-6" />
                                    <div className="font-normal text-truncate line-clamp-1"
                                        title={d.title}>{d.title}</div>
                                </div>))
                            }
                        </div>
                    </div>
            }
        </>
    );
}

export default GroupNode;