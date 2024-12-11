import { useTheme } from "../../contexts/ThemeContext.jsx";
import {
    applyNodeChanges,
    Background,
    type ColorMode,
    Edge,
    MiniMap,
    OnNodesChange,
    ReactFlow,
    useNodesState
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import React, { useCallback, useEffect, useState } from "react";
import CustomBackgroundNode from './CustomBackgroundNode';
import SingleNode from "./SingleNode";
import GroupNode from "./GroupNode";
import CustomEdge from "./CustomEdge";
import CloseNode from "./CustomCloseNode.js";
import API from "../../API/API.mjs"
import {
    getEquidistantPoints,
    getXDatePosition,
    getYPlanScale,
    YScalePosition
} from "../Utilities/DiagramReferencePositions.js";
import {SingleDocumentMap} from "../SingleDocumentMap.jsx";
import {useNodePosition} from "../../contexts/NodePositionContext.tsx";
import ConnectionPopup from "./ConnectionPopup";

type Node<Data = any> = {
    id: string;
    type?: string;
    data: Data;
    position: { x: number; y: number };
    draggable?: boolean;
    selectable?: boolean;
    connectable?: boolean;
    style?: React.CSSProperties;
};
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

const DiagramBoard = (props) => {
    const { isDarkMode } = useTheme();
    const { nodePositions, setNodePosition } = useNodePosition();
    const [colorMode, setColorMode] = useState<ColorMode>(isDarkMode ? "dark" : "light");
    const [zoom, setZoom] = useState(1); // Add zoom state
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 }); // Add viewport state
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [clickedNode, setClickedNode] = useState<string | null>(null);
    const [documents, setDocuments] = useState<DiagramItem[] | []>([])
    const [links, setLinks] = useState<Edge[]>([])
    const [yearsRange, setYearsRange] = useState<number[]>([])
    const [nodes, setNodes] = useNodesState<Node>([])

    const [nodeStates, setNodeStates] = useState<Record<number, string>>({});
    const [nodeisOpen, setNodeIsOpen] = useState<Record<string, boolean | string>>({});

    const [ShowSingleDocument, setShowSingleDocument] = useState(false);
    const [documentId, setDocumentId] = useState(String);

    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const [isLegendVisible, setIsLegendVisible] = useState(false);
    const [allLinkVisible, setAllLinkVisible] = useState(false)

    const connections = [
        { name: "Direct Consequence", color: "#E82929" },
        { name: "Collateral Consequence", color: "#31F518" },
        { name: "Projection", color: "#4F43F1" },
        { name: "Update", color: "#E79716" }
    ];

    useEffect(() => {
        setColorMode(isDarkMode ? "dark" : "light")
    }, [isDarkMode])

    const setNodeSelected = (nodeindex: number, docselected: string) => {
        setNodeStates(prev => ({
            ...prev,
            [nodeindex]: docselected,
        }));
    };

    const setNodeOpen = (nodeindex: number, cancel?: boolean) => {
        if (nodeindex == -1) {
            setNodeIsOpen({})
        } else if (cancel) {
            setNodeIsOpen(prev => ({
                ...prev,
                [nodeindex]: "closed",
            }));
        } else {
            setNodeIsOpen(prev => ({
                ...prev,
                [nodeindex]: true,
            }));
        }
    };

    const distanceBetweenYears = 400;

    useEffect(() => {
        const getAllDocument = async () => {
            try {
                const docs = await API.getAllDocuments();

                const yearsDoc = docs.map((doc) => {
                    let date = doc.date.split("-")
                    let year = date[0]
                    return parseInt(year)
                })
                const minYear = Math.min(...yearsDoc)
                const maxYear = Math.max(...yearsDoc)

                const yearsRange: number[] = []
                for (let y = minYear - 1; y <= maxYear + 3; y++) {
                    yearsRange.push(y)
                }
                setYearsRange(yearsRange)

                // Map documents to items
                const mappedItems = docs.map((doc) => {
                    let date = doc.date.split("-")
                    let year = date[0]
                    let month = date[1]
                    return {
                        docid: doc.id,
                        title: doc.title,
                        type: doc.type,
                        scale: doc.scale,
                        year: year,
                        month: month,
                        planNumber: doc.planNumber
                    };
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

                const docItems: DiagramItem[] = Object.entries(groupedByScaleAndDate).map((i: any[]) => {
                    const element = i[1][0]
                    let yoffset
                    if (element.month) {
                        const evenMonth = element.month % 2 == 0
                        yoffset = evenMonth ? 50 : -50
                    } else {
                        yoffset = -100
                    }
                    let ypos
                    if (element.scale === "plan") {
                        ypos = getYPlanScale(element.planNumber)
                        yoffset = 0
                    } else {
                        ypos = YScalePosition[element.scale]
                    }

                    return {
                        items: i[1],
                        x: getXDatePosition(yearsRange[0], element.year, element.month),
                        y: yoffset + ypos
                    }
                })

                setDocuments(docItems)

            } catch (err) {
                console.log(err)
            }
        }
        getAllDocument()
    }, [])

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes((nds) =>
                applyNodeChanges(
                    changes.map((change) => {
                        if (change.type === 'position' && change.position) {

                            const node = nds.find((e) => e.id == change.id)

                            const nodeYear = parseInt(node?.data.group?.[0]?.year, 10);
                            const yearIndex = yearsRange.indexOf(nodeYear);
                            if (yearIndex === -1) return change

                            const yearStart = yearIndex * distanceBetweenYears
                            const yearEnd = yearStart + ((distanceBetweenYears / 12) * 11)

                            const limitedX = Math.max(yearStart, Math.min(change.position.x, yearEnd));

                            const scale = node?.data.group?.[0]?.scale

                            let minY, maxY
                            if (scale !== "plan") {
                                minY = YScalePosition[scale] - 100;
                                maxY = YScalePosition[scale] + 100;
                            }
                            else {
                                minY = maxY = getYPlanScale(node?.data.group?.[0]?.planNumber)
                                minY = minY - 30
                                maxY = maxY + 30
                            }

                            const limitedY = Math.max(minY, Math.min(change.position.y, maxY));

                            return {
                                ...change,
                                position: { x: limitedX, y: limitedY },
                            };
                        }
                        return change;
                    }),
                    nds
                )
            );
        },
        [setNodes, viewport, yearsRange]
    );

    const onNodeDragStop = useCallback(
        (_, node) => {
            if (node.nodetype !== "groupNode") {
                const nodeYear = parseInt(node.data.group?.[0]?.year, 10);
                const yearIndex = yearsRange.indexOf(nodeYear);
                if (yearIndex === -1) return;

                // Define boundaries
                const yearStart = (yearIndex * distanceBetweenYears);
                const yearEnd = yearStart + ((distanceBetweenYears / 12) * 11);

                const scale = node.data.group?.[0]?.scale;
                let minY, maxY
                if (scale !== "plan") {
                    minY = YScalePosition[scale] - 100;
                    maxY = YScalePosition[scale] + 100;
                }
                else {
                    minY = maxY = getYPlanScale(node?.data.group?.[0]?.planNumber)
                    minY = minY - 30
                    maxY = maxY + 30
                }

                // Limit position within boundaries
                const limitedX = Math.max(yearStart, Math.min(node.position.x, yearEnd));
                const limitedY = Math.max(minY, Math.min(node.position.y, maxY));

                // Save the new position to context
                setNodePosition(node.id, { x: limitedX, y: limitedY });
            }

        },
        [setNodePosition, yearsRange]
    );

    const nodeTypes = {
        background: CustomBackgroundNode,
        singleNode: SingleNode,
        groupNode: GroupNode,
        closeNode: CloseNode
    };

    const edgeTypes = {
        custom: CustomEdge,
    };

    useEffect(() => {
        const getNodes = () => {
            const initialNodes: Node[] = [
                {
                    id: '0',
                    type: 'background',
                    position: { x: 0, y: 0 },
                    data: { years: yearsRange, zoom: zoom, distanceBetweenYears: distanceBetweenYears },
                    draggable: false,
                    selectable: false,
                    connectable: false,
                    clickable: false,
                    style: { zIndex: -1, pointerEvents: 'none' }
                },
                ...documents.flatMap((e, index: number) => {
                    const nodetype = e.items.length === 1 ? 'singleNode' : 'groupNode';

                    const nodeSelected = nodeStates[index] || e.items[0].docid;
                    //console.log(`${index}:` + nodeisOpen[index])
                    if (zoom > 1.1 && nodetype === 'groupNode' && nodeisOpen[index] !== "closed") setNodeOpen(index)

                    if (nodeisOpen[index] === true && nodetype === 'groupNode') {
                        const positions = getEquidistantPoints(e.x, e.y, e.items.length == 2 ? 45 : 5 + e.items.length * 7, e.items.length);

                        const nodes = e.items.map((item: Item, index1: number) => {


                            return {
                                id: `${item.docid}`,
                                type: 'singleNode',
                                position: nodePositions[item.docid] || { x: positions[index1].x, y: positions[index1].y },
                                data: {
                                    clickedNode: clickedNode,
                                    group: [item],
                                    zoom: zoom,
                                    index: index,
                                    showSingleDocument: (id: string) => {
                                        setDocumentId(id), setShowSingleDocument(true)
                                    },
                                    groupPosition: { x: e.x, y: e.y }
                                },
                                draggable: item.month === undefined,
                            };
                        });

                        const closeNode = {
                            id: `closeNode-${index}`,
                            type: 'closeNode',
                            position: { x: e.x + 10, y: e.y + 10 },
                            data: { zoom: zoom, index: index },
                            draggable: false,
                        };

                        return [...nodes, closeNode];
                    } else {
                        const savedPosition = nodePositions[nodeSelected] || { x: e.x, y: e.y };
                        return {
                            id: `${nodeSelected}`,
                            type: nodetype,
                            position: nodetype === "groupNode" ? { x: e.x, y: e.y } : savedPosition,
                            data: {
                                clickedNode: clickedNode,
                                group: e.items,
                                zoom: zoom,
                                index: index,
                                setNodeSelected: (id: number) => setNodeSelected(index, `${id}`),
                                showSingleDocument: (id: string) => {
                                    setDocumentId(id), setShowSingleDocument(true)
                                }
                            },
                            draggable: e.items[0].month === undefined && nodetype !== "groupNode",
                        };
                    }
                }),
            ]
            setNodes(initialNodes)
        }
        if (zoom <= 1.1) setNodeOpen(-1)
        getNodes()
    }, [documents, clickedNode, zoom, nodeStates])

    useEffect(() => {
        const getLinks = async () => {
            const allLinks = nodes.flatMap((node, index: number) => {
                if (node.type === "background" || node.type === "closeNode") return [];

                const nodetype = node.data.group.length === 1 ? 'singleNode' : 'groupNode';
                return node.data.group.flatMap(async (elem: Item) => {
                    const docid = elem.docid
                    const docLinks = await API.getDocuemntLinks(docid)
                    if (docLinks.length === 0) return [];

                    const groupedLinks = docLinks.reduce((acc, linkitem) => {
                        if (!acc[linkitem.id]) {
                            acc[linkitem.id] = [];
                        }
                        acc[linkitem.id].push(`${linkitem.connection}`);
                        return acc;
                    }, {} as Record<string, Item[]>);

                    return Object.entries(groupedLinks).map((dl) => (
                        {
                            id: `l${docid}-${dl[0]}`,
                            source: `${docid}`,
                            target: `${dl[0]}`,
                            type: "custom",
                            data: {
                                typesOfConnections: dl[1],
                                selectedEdge: `${docid}` === clickedNode || `${docid}` === hoveredNode || allLinkVisible
                            }
                        }
                    ))
                })
            })
            const resolvedEdges = (await Promise.all(allLinks)).flat();
            setLinks(resolvedEdges)
        }
        getLinks()
    }, [nodes, nodeStates, hoveredNode, allLinkVisible])

    //const filteredEdges = links.filter(edge => edge.source === clickedNode || edge.source === hoveredNode);

    //boundaries
    const extent: [[number, number], [number, number]] = [
        [0, 0],
        [distanceBetweenYears * yearsRange.length < 1920 * 2 ? 1920 * 2 : distanceBetweenYears * yearsRange.length, 2160]
    ];

    return (
        <div className={`${isDarkMode ? "dark" : "light"} w-screen h-screen`}>
            {/*<ConnectionPopup
                isEditing={false}
                documentFromId={40} documentToId={43}
                closePopup={() => {}}
            ></ConnectionPopup>*/}
            {ShowSingleDocument &&
                <SingleDocumentMap setShowArea={props.setShowArea} municipalGeoJson={props.municipalGeoJson}
                    setDocumentId={setDocumentId} id={documentId}
                    setShowSingleDocument={setShowSingleDocument}></SingleDocumentMap>}
            <ReactFlow
                nodes={nodes}
                edges={links}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                colorMode={colorMode}
                nodeExtent={extent}
                minZoom={0.4}
                translateExtent={extent}
                zoomOnDoubleClick={false}
                onNodesChange={onNodesChange}
                onNodeClick={(event, node) => {
                    if (node.type === "closeNode") {
                        setNodeOpen(node.data.index, true)
                        setClickedNode((clickedNode === node.id || node.id == "0") ? null : node.id);
                    } else {
                        setClickedNode((clickedNode === node.id || node.id == "0") ? null : node.id);
                        if (clickedNode != node.id && node.type !== "groupNode") {
                            setNodeSelected(node.data.index, node.id)
                        }
                        if (node.type === "groupNode") {
                            if (zoom <= 1) {
                                setNodeOpen(-1)
                            } else if (clickedNode == node.id) {
                                setNodeOpen(node.data.index, true)
                            } else {
                                setNodeOpen(node.data.index)
                            }
                        }
                    }
                }}
                onNodeMouseLeave={() => {
                    setHoveredNode(null)
                }}
                onNodeMouseEnter={(event, node) => {
                    event.preventDefault();
                    setHoveredNode(node.id !== "0" ? node.id : null);
                }}
                onMoveEnd={(event, viewport) => {
                    setZoom(viewport.zoom);
                    setViewport(viewport);

                }}
                onNodeDoubleClick={(event, node) => {
                    setShowSingleDocument(true);
                    setDocumentId(node.id);
                }}
                onNodeDragStop={onNodeDragStop}
            >

                <Background gap={20} size={1} color={isDarkMode ? "#333" : "#ccc"} />
                <MiniMap className="opacity-70" />
            </ReactFlow>

            <div
                className={`fixed w-full bg-black_text dark:bg-white_text h-[1px] top-3 text-black_text dark:text-white_text transition`}
            >
                {yearsRange.map((year, index) => (

                    index != 0 && <div
                        key={year}
                        className="absolute transform -translate-x-1/2 -translate-y-1/4 pt-2 flex flex-col gap-1 justify-content-center align-items-center transition"
                        style={{ left: `${index * distanceBetweenYears * zoom + (viewport?.x || 0)}px` }}
                    >
                        <div className="w-3 h-3 bg-black_text dark:bg-white_text rounded-full transition"
                            style={{ transform: `scale(${zoom})` }}>
                        </div>
                        <div style={{ transform: `scale(${zoom}) ${index === 0 ? "translateX(25px)" : ""}` }}
                            className="transition">{year}</div>
                    </div>
                ))}

                {/* Aggiungi le linee per i mesi */}
                {yearsRange.map((year, yearIndex) => (

                    yearIndex != 0 && months.map((month, monthIndex) => {
                        // Calcola la posizione proporzionale dei mesi
                        const monthPosition = yearIndex * distanceBetweenYears * zoom + (viewport?.x || 0) + (monthIndex * (distanceBetweenYears / 12)) * zoom;

                        return (
                            <div key={`${year}-${month}`}
                                className="absolute h-screen border-l border-[#00000015] dark:border-[#ffffff11] transition z-[-1]"
                                style={{
                                    left: `${monthPosition}px`,
                                    borderStyle: 'dashed',
                                }}

                            >
                                {/* Numero del mese */}
                                <div
                                    className="absolute top-1 text-xs text-gray-500 dark:text-gray-300"
                                    style={{ transform: `translateX(-50%) scale(${zoom})` }}
                                >
                                    {month}
                                </div>
                            </div>
                        );
                    })
                ))}
                {/* Linea verticale rossa per il giorno corrente */}
                {(() => {
                    const currentDate = new Date();
                    const currentYearIndex = yearsRange.indexOf(currentDate.getFullYear());
                    const currentMonthIndex = currentDate.getMonth();
                    const daysInMonth = new Date(currentDate.getFullYear(), currentMonthIndex + 1, 0).getDate();
                    const dayFraction = currentDate.getDate() / daysInMonth;

                    const currentDayPosition = currentYearIndex * distanceBetweenYears * zoom + (viewport?.x || 0)
                        + currentMonthIndex * (distanceBetweenYears / 12) * zoom
                        + dayFraction * (distanceBetweenYears / 12) * zoom;

                    return (
                        <div
                            className="absolute h-screen border-l border-red-500"
                            style={{ left: `${currentDayPosition}px` }}
                        />
                    );
                })()}
            </div>

            {/* Legend */}
            <button
                title="legend"
                onClick={() => setIsLegendVisible(!isLegendVisible)}
                className="flex justify-content-center align-content-center fixed top-4 right-4 bg-white_text  dark:bg-[#323232] w-12 h-12 border-2 border-dark_node dark:border-white_text rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-[#696969] transition"
            >
                <i className="bi bi-list-task text-[1.8em] dark:text-white_text"></i>
            </button>

            {isLegendVisible && (
                <div
                    className="z-10 fixed top-16 right-4 bg-white_text dark:bg-dark_node dark:text-white_text shadow-lg rounded-lg p-4 w-60">
                    <h3 className="text-lg font-semibold mb-2">Legend</h3>

                    {connections.map((connection) => (
                        <li
                            key={connection.name}
                            className="flex items-center justify-between text-xs mb-2"
                        >
                            <span>{connection.name}</span>
                            <span
                                style={{ backgroundColor: connection.color }}
                                className="w-12 h-[2px] rounded-full"
                            ></span>
                        </li>
                    ))}


                </div>
            )}

            {/* Link button */}
            <button
                title={allLinkVisible ? "Hide all connections" : "Color all connections"}
                onClick={() => {
                    setAllLinkVisible(prev => !prev)
                }}
                className="flex justify-content-center align-content-center fixed top-20 right-4 bg-white_text  dark:bg-[#323232] w-12 h-12 border-2 border-dark_node dark:border-white_text rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-[#696969] transition"
            >
                <i className={`bi bi-share${allLinkVisible ? "-fill" : ""} text-[1.8em] dark:text-white_text`}></i>
            </button>

        </div>
    );
};

export default DiagramBoard;
