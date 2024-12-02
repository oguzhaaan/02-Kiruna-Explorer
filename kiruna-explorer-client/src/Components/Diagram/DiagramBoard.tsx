import { useTheme } from "../../contexts/ThemeContext.jsx";
import { Controls, MiniMap, ReactFlow, Background, type ColorMode } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useState, useEffect } from "react";
import CustomBackgroundNode from './CustomBackgroundNode';
import SingleNode from "./SingleNode";
import GroupNode from "./GroupNode";
import CustomEdge from "./CustomEdge";
import React from "react";
import API from "../../API/API.mjs"
import { YScalePosition, getXDatePosition } from "../Utilities/DiagramReferencePositions.js";

export type Item = {
    docid: number;
    title: string;
    type: string;
    scale: string;
    year: string;
    month: string;
    planNumber: string | null;
};

export type DiagramItem = {
    items: Item[],
    x: number,
    y: number
}

const DiagramBoard = () => {
    const { isDarkMode } = useTheme();
    const [colorMode] = useState<ColorMode>(isDarkMode ? "dark" : "light");
    const [zoom, setZoom] = useState(1); // Add zoom state
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 }); // Add viewport state
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [clickedNode, setClickedNode] = useState<string | null>(null);
    const [documents, setDocuments] = useState<DiagramItem[] | []>([])
    const [yearsRange, setYearsRange] = useState<number[]>([])

    const distanceBetweenYears = 400;

    useEffect(() => {
        const getAllDocument = async () => {
            try {
                const docs = await API.getAllDocuments();
                console.log(docs)

                const yearsDoc = docs.map((doc)=>{
                    let date = doc.date.split("-")
                    let year = date[0]
                    return parseInt(year)
                })
                const minYear = Math.min(...yearsDoc)
                const maxYear = Math.max(...yearsDoc)

                const yearsRange: number[] = []
                for(let y=minYear-1; y<=maxYear+3; y++){
                    yearsRange.push(y)
                }
                setYearsRange(yearsRange)

                // Map documents to items
                const mappedItems = docs.map((doc) => {
                    let date = doc.date.split("-")
                    let year = date[0]
                    let month = date[1]
                    return { docid: doc.id, title:doc.title, type: doc.type, scale: doc.scale, year: year, month: month, planNumber: doc.planNumber };
                }).filter((i: Item) => i.scale !== null)

                //Group items by scale and date
                const groupedByScaleAndDate = mappedItems.reduce((acc: { [x: string]: any[]; }, item: Item) => {
                    const key = `${item.scale}${item.planNumber}_${item.year}_${item.month}`;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(item);
                    return acc;
                }, {} as Record<string, Item[]>);

                const docItems: DiagramItem[] =  Object.entries(groupedByScaleAndDate).map((i:any[])=>{
                    const element = i[1][0]
                    const evenMonth = element.month % 2 == 0
                    const yoffset = evenMonth? 50 : -50
                    return {items: i[1], x: getXDatePosition(yearsRange[0],element.year,element.month), y:yoffset+ YScalePosition[element.scale+element.planNumber]}
                })

                setDocuments(docItems)

                console.log(docItems)

            } catch (err) {
                console.log(err)
            }
        }
        getAllDocument()
    }, [])

    //years

    const nodeTypes = {
        background: CustomBackgroundNode,
        singleNode: SingleNode,
        groupNode: GroupNode
    };

    const edgeTypes = {
        custom: CustomEdge,
    };

    //nodes
    const initialNodes = [
        {
            id: '1',
            type: 'background',
            position: { x: 0, y: 0 },
            data: { years: yearsRange, zoom: zoom, distanceBetweenYears: distanceBetweenYears },
            draggable: false,
            selectable: false,
            connectable: false,
            clickable: false,
            style: { zIndex: -1 }
        },
        ...documents.map((e: DiagramItem, index: number)=>{
            const nodetype = e.items.length === 1? "singleNode":"groupNode"
            return {
                id: `${index+2}`,
                type: nodetype,
                position: {x: e.x, y: e.y},
                data: {clickedNode:clickedNode, group: e.items},
                draggable:false
            }
        })
    ];

    //edges
    const initialEdges = [
        {
            id: 'e2-3',
            source: '3',
            target: '2',
            type: 'custom',
            data: { typesOfConnections: ["Collateral Consequence", "Projection", "Direct Consequence", "Update"] }
        },
        { id: 'e2-4', source: '4', target: '2', type: 'custom', data: { typesOfConnections: ["Direct Consequence", "Collateral Consequence", "Projection"] } },
    ];

    const filteredEdges = initialEdges.filter(edge => edge.source === clickedNode || edge.target === clickedNode || edge.source === hoveredNode || edge.target === hoveredNode);

    //boundaries
    const extent: [[number, number], [number, number]] = [
        [0, 0],
        [distanceBetweenYears * yearsRange.length < 1920 * 2 ? 1920 * 2 : distanceBetweenYears * yearsRange.length, 2160]
    ];

    return (
        <div className={`${isDarkMode ? "dark" : "light"} w-screen h-screen`}>
            <ReactFlow
                nodes={initialNodes}
                edges={filteredEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                colorMode={colorMode}
                nodeExtent={extent}
                translateExtent={extent}
                onNodeClick={(event, node) => {
                    setClickedNode((clickedNode === node.id || node.id == "1") ? null : node.id);
                }}
                onNodeMouseEnter={(event, node) => {
                    event.preventDefault();
                    setHoveredNode(node.id);
                }}
            >
                <Background gap={20} size={1} color={isDarkMode ? "#333" : "#ccc"} />
                <MiniMap className="opacity-70" />
            </ReactFlow>

            <div
                className={`fixed w-full bg-black_text dark:bg-white_text h-[1px] top-3 text-black_text dark:text-white_text transition`}>
                {yearsRange.map((year, index) => (
                    <div
                        key={year}
                        className="absolute transform -translate-x-1/2 -translate-y-1/4 pt-2 flex flex-col gap-1 justify-content-center align-items-center transition"
                        style={{ left: `${index * 400 * zoom + (viewport?.x || 0)}px` }}
                    >
                        <div className="w-2 h-2 bg-black_text dark:bg-white_text rounded-full transition"
                            style={{ transform: `scale(${zoom})` }}></div>
                        <div style={{ transform: `scale(${zoom}) ${index == 0 ? "translateX(25px)" : ""}` }}
                            className="transition">{year}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiagramBoard;

/*
onNodeMouseEnter={(event, node) => {
    event.preventDefault();
    setHoveredNode(node.id);
    filterEdges();
}}
onNodeMouseLeave={() => setHoveredNode(null)}
onMoveEnd={(event, viewport) => {
    setZoom(viewport.zoom);
    setViewport(viewport);
}} */