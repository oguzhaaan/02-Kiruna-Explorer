import {useTheme} from "../../contexts/ThemeContext.jsx";
import {Controls, MiniMap, ReactFlow, Background, type ColorMode} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {useState} from "react";
import CustomBackgroundNode from './CustomBackgroundNode';
import SingleNode from "./SingleNode";
import GroupNode from "./GroupNode";
import CustomEdge from "./CustomEdge";
import React from "react";

const DiagramBoard = () => {
    const {isDarkMode} = useTheme();
    const [colorMode] = useState<ColorMode>(isDarkMode ? "dark" : "light");
    const [zoom, setZoom] = useState(1); // Add zoom state
    const [viewport, setViewport] = useState({x: 0, y: 0, zoom: 1}); // Add viewport state
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [clickedNode, setClickedNode] = useState<string | null>(null);

    const distanceBetweenYears = 400;

    //years
    const [years] = useState(["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036", "2037"]);

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
            position: {x: 0, y: 0},
            data: {years: years, zoom: zoom, distanceBetweenYears: distanceBetweenYears},
            draggable: false,
            selectable: false,
            connectable: false,
            clickable: false,
            style: {zIndex: -1}
        },
        {id: '2', type: 'singleNode', position: {x: 100, y: 100}, data: {clickedNode: clickedNode}, draggable: false},
        {id: '3', type: 'groupNode', position: {x: 400, y: 700}, data: {clickedNode: clickedNode}, draggable: false},
        {id: '4', type: 'groupNode', position: {x: 800, y: 60}, data: {clickedNode: clickedNode}, draggable: false},
    ];

    //edges
    const initialEdges = [
        {
            id: 'e2-3',
            source: '3',
            target: '2',
            type: 'custom',
            data: {typesOfConnections: ["Collateral Consequence", "Projection", "Direct Consequence", "Update"]}
        },
        {id: 'e2-4', source: '4', target: '2', type: 'custom', data: {typesOfConnections: ["Direct Consequence", "Collateral Consequence", "Projection"]}},
    ];

    const filteredEdges = initialEdges.filter(edge => edge.source === clickedNode || edge.target === clickedNode || edge.source === hoveredNode || edge.target === hoveredNode);

    //boundaries
    const extent: [[number, number], [number, number]] = [
        [0, 0],
        [distanceBetweenYears * years.length < 1920 * 2 ? 1920 * 2 : distanceBetweenYears * years.length, 2160]
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
                onMoveEnd={(event, viewport) => {
                    setZoom(viewport.zoom);
                    setViewport(viewport);
                }}
            >
                <Background gap={20} size={1} color={isDarkMode ? "#333" : "#ccc"}/>
                <MiniMap className="opacity-70"/>
            </ReactFlow>

            <div
                className={`fixed w-full bg-black_text dark:bg-white_text h-[1px] top-3 text-black_text dark:text-white_text transition`}>
                {years.map((year, index) => (
                    <div
                        key={year}
                        className="absolute transform -translate-x-1/2 -translate-y-1/4 pt-2 flex flex-col gap-1 justify-content-center align-items-center transition"
                        style={{left: `${index * 400 * zoom + (viewport?.x || 0)}px`}}
                    >
                        <div className="w-2 h-2 bg-black_text dark:bg-white_text rounded-full transition"
                             style={{transform: `scale(${zoom})`}}></div>
                        <div style={{transform: `scale(${zoom}) ${index == 0 ? "translateX(25px)" : ""}`}}
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