import { useTheme } from "../../contexts/ThemeContext.jsx";
import {
    applyNodeChanges,
    Background,
    type ColorMode,
    Edge,
    MiniMap,
    OnNodesChange,
    ReactFlow,
    useNodesState,
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
import { SingleDocumentMap } from "../SingleDocumentMap.jsx";
import { useNodePosition } from "../../contexts/NodePositionContext.tsx";
import ConnectionPopup from "./ConnectionPopup";
import Alert from "../Alert.jsx";
import FilterMenu from "../FilterMenu.jsx";
import FilterLabels from "../FilterLabels.jsx";
import { Message } from "../Map.jsx";

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
    const [extent, setExtent] = useState<[[number, number], [number, number]] | undefined>(undefined)
    const [alertMessage, setAlertMessage] = useState("");

    const [nodeStates, setNodeStates] = useState<Record<number, string>>({});
    const [nodeisOpen, setNodeIsOpen] = useState<Record<string, boolean | string>>({});

    const [ShowSingleDocument, setShowSingleDocument] = useState(false);
    const [documentId, setDocumentId] = useState(String);

    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const [isLegendVisible, setIsLegendVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [allLinkVisible, setAllLinkVisible] = useState(false)
    const [currentFilteredDoc, setCurrentFilteredDoc] = useState(null)
    const [filteredDocs, setFilteredDocs] = useState<[] | null>(null)

    const [alertMessageArray, setAlertMessageArray] = useState(['', '']);


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

    const distanceBetweenYears = 800;
    const offsetTimeLine = -400

    // Filter Documents
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        type: "",
        stakeholders: [],
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        const getAllDocument = async () => {
            try {
                let docs = await API.getFilteredDocuments(filterValues);
                setAlertMessage("")
                setFilteredDocs(docs)


                if (docs.length === 0) {
                    setAlertMessage("No documents found")
                    docs = await API.getAllDocuments()
                    setCurrentFilteredDoc(null)
                }
                else {
                    if (filteredDocs && (filterValues.type !== "" ||
                        filterValues.stakeholders.length !== 0 ||
                        filterValues.startDate !== "" ||
                        filterValues.endDate !== "") && currentFilteredDoc === null) {
                        setCurrentFilteredDoc(docs[0].id)
                    }
                }

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
                        scale: doc.scale === "blueprints/effects" ? "blueprints" : doc.scale,
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
    }, [filterValues])

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

                            const yearStart = offsetTimeLine + yearIndex * distanceBetweenYears
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
                const yearStart = offsetTimeLine + (yearIndex * distanceBetweenYears);
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

    const [popupVisible, setPopupVisible] = useState(false);

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
                    style: { zIndex: -1, pointerEvents: 'none' },
                },
                ...documents.flatMap((e: DiagramItem, index: number) => {
                    const nodetype = e.items.length === 1 ? 'singleNode' : 'groupNode';

                    const doc_to_center = e.items.findIndex(e => e.docid === props.showDiagramDoc || e.docid === currentFilteredDoc)

                    let nodeSelected: string
                    if (doc_to_center === -1) {
                        nodeSelected = nodeStates[index] || e.items[0].docid.toString();
                    }
                    else {
                        nodeSelected = e.items[doc_to_center].docid.toString();
                        setClickedNode(nodeSelected)
                        setNodeSelected(index, nodeSelected)
                        props.setShowDiagramDoc(null);
                        setCurrentFilteredDoc(null)
                    }

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
                                    pos: nodePositions[item.docid] || { x: positions[index1].x, y: positions[index1].y },
                                    zoom: zoom,
                                    index: index,
                                    showSingleDocument: (id: string) => {
                                        setDocumentId(id), setShowSingleDocument(true)
                                    },
                                    groupPosition: { x: e.x, y: e.y },
                                    showDiagramDoc: props.showDiagramDoc,
                                    currentFilteredDoc: currentFilteredDoc
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
                                pos: nodetype === "groupNode" ? { x: e.x, y: e.y } : savedPosition,
                                zoom: zoom,
                                index: index,
                                setNodeSelected: (id: number) => setNodeSelected(index, `${id}`),
                                showSingleDocument: (id: string) => {
                                    setDocumentId(id), setShowSingleDocument(true)
                                },
                                showDiagramDoc: props.showDiagramDoc,
                                currentFilteredDoc: currentFilteredDoc
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
    }, [documents, clickedNode, zoom, nodeStates, currentFilteredDoc, filterValues, editMode, popupVisible])

    const [popupData, setPopupData] = useState<{ fromId: number, toId: number } | null>(null);


    useEffect(() => {
        const getLinks = async () => {
            const allLinks = nodes.flatMap((node, index: number) => {
                if (node.type === "background" || node.type === "closeNode") return [];

                const nodetype = node.data.group.length === 1 ? 'singleNode' : 'groupNode';
                return node.data.group.flatMap(async (elem: Item) => {
                    const docid = elem.docid;
                    const docLinks = await API.getDocuemntLinks(docid);
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
                                selectedEdge: `${docid}` === clickedNode || `${docid}` === hoveredNode || `${dl[0]}` === clickedNode || `${dl[0]}` === hoveredNode || allLinkVisible,
                                editMode: editMode,
                                setPopupVisible: (fromId: number, toId: number) => {
                                    setPopupData({ fromId, toId });
                                    setPopupVisible(true);  // Mostra il popup
                                },
                                source: `${docid}`,
                                target: `${dl[0]}`
                            }
                        }
                    ));
                });
            });

            const resolvedEdges = (await Promise.all(allLinks)).flat();

            // Filtra le connessioni duplicati con la logica position.x inversa
            const filteredEdges = resolvedEdges.filter((edge, index, self) => {
                const sourceNode = nodes.find(node => node.id === edge.source);
                const targetNode = nodes.find(node => node.id === edge.target);

                if (!sourceNode || !targetNode) return false;

                // Determina quale nodo deve essere il source e quale il target
                const [finalSource, finalTarget] = sourceNode.position.x >= targetNode.position.x
                    ? [edge.source, edge.target]
                    : [edge.target, edge.source];

                // Verifica se una connessione simile esiste già
                return self.findIndex((e) => (e.source === finalSource && e.target === finalTarget)) === index;
            });

            setLinks(filteredEdges);
        };

        getLinks();
    }, [nodes, nodeStates, hoveredNode, allLinkVisible, editMode, popupVisible]);

    //const filteredEdges = links.filter(edge => edge.source === clickedNode || edge.source === hoveredNode);

    //boundaries

    useEffect(() => {
        const bounds: [[number, number], [number, number]] = [
            [0, 0],
            [offsetTimeLine + distanceBetweenYears * yearsRange.length, 2160]
        ];
        setExtent(bounds)
    }, [yearsRange])

    const onConnect = (params) => {
        if (params.source === params.target) {
            setAlertMessageArray(["You can't connect a document to itself", "error"]);
        }
        else {
            if (editMode) {
                console.log(params);
                setPopupData({
                    fromId: parseInt(params.source, 10),
                    toId: parseInt(params.target, 10),
                });
                //setEditMode(false);
                setPopupVisible(true);
            }
            else {
                setAlertMessageArray(["You need to be in edit mode to creat a new connection", "error"]);
            }
        }
    }

    return (
        <div className={`${isDarkMode ? "dark" : "light"} w-screen h-screen`}>
            <Alert message={alertMessageArray[0]} type={alertMessageArray[1]}
                clearMessage={() => setAlertMessageArray(['', ''])}></Alert>
            {popupVisible && <ConnectionPopup
                isEditing={editMode}
                documentFromId={popupData ? popupData.fromId : 55} documentToId={popupData ? popupData.toId : 56}
                closePopup={() => { setPopupVisible(false) }}
                setAlertMessage={(message: [string, string]) => setAlertMessageArray(message)}
            ></ConnectionPopup>}
            {/* Filter Document Control*/}
            {filteredDocs?.length !== 0 &&
                (filterValues.type !== "" ||
                    filterValues.stakeholders.length !== 0 ||
                    filterValues.startDate !== "" ||
                    filterValues.endDate !== "") &&
                <FilterDocumentsControl currentFilteredDoc={currentFilteredDoc} setCurrentFilteredDoc={setCurrentFilteredDoc} filteredDocs={filteredDocs}></FilterDocumentsControl>}
            {/* Alert message */}
            {alertMessage && (<Message alertMessage={alertMessage} setAlertMessage={setAlertMessage}></Message>)}
            {/* Filter Menu */}
            {isFilterMenuOpen &&
                <div className="z-10 top-36 right-20 flex justify-content-center align-content-center fixed ">
                    <FilterMenu filterValues={filterValues} setFilterValues={setFilterValues} homePage={false} setCurrentFilteredDoc={setCurrentFilteredDoc} setFilteredDocs={setFilteredDocs} setNodeStates={setNodeStates} />
                </div>
            }
            {/* Filter Labels */}
            <div className="z-10 bottom-5 left-20 px-2 flex items-start fixed">
                <FilterLabels filterValues={filterValues} setFilterValues={setFilterValues} setNodeStates={setNodeStates} />
            </div>
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
                onConnect={onConnect}
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
                    if (!props.showDiagramDoc && currentFilteredDoc === null) {
                        setZoom(viewport.zoom);
                        setViewport(viewport);
                    }
                }}
                onNodeDoubleClick={(event, node) => {
                    setShowSingleDocument(true);
                    setDocumentId(node.id);
                }}
                onNodeDragStop={onNodeDragStop}
            >

                <Background gap={20} size={1} color={isDarkMode ? "#333" : "#ccc"} />
                {/*<MiniMap className="opacity-50" />*/}
            </ReactFlow>

            <div
                className={`fixed w-full bg-black_text dark:bg-white_text h-[1px] top-3 text-black_text dark:text-white_text transition pointer-events-none`}
            >
                {yearsRange.map((year, index) => (

                    index != 0 && <div
                        key={year}
                        className="absolute transform -translate-x-1/2 -translate-y-1/4 pt-2 flex flex-col gap-1 justify-content-center align-items-center transition"
                        style={{ left: `${offsetTimeLine * zoom + index * distanceBetweenYears * zoom + (viewport?.x || 0)}px` }}
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
                        const monthPosition = offsetTimeLine * zoom + yearIndex * distanceBetweenYears * zoom + (viewport?.x || 0) + (monthIndex * (distanceBetweenYears / 12)) * zoom;

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
                {/* red line for today */}
                {(() => {
                    const currentDate = new Date();
                    const currentYearIndex = yearsRange.indexOf(currentDate.getFullYear());
                    const currentMonthIndex = currentDate.getMonth();
                    const daysInMonth = new Date(currentDate.getFullYear(), currentMonthIndex + 1, 0).getDate();
                    const dayFraction = currentDate.getDate() / daysInMonth;

                    const currentDayPosition = offsetTimeLine * zoom + currentYearIndex * distanceBetweenYears * zoom + (viewport?.x || 0)
                        + currentMonthIndex * (distanceBetweenYears / 12) * zoom
                        + dayFraction * (distanceBetweenYears / 12) * zoom;

                    return (
                        <>
                            <div
                                className="absolute h-screen border-l border-my_red"
                                style={{ left: `${currentDayPosition}px` }}
                            />
                            {/* Numero del mese */}
                            <div
                                className="absolute top-10 text-xs text-my_red"
                                style={{ transform: `translateX(-50%) scale(${zoom})`, left: `${currentDayPosition + 20 * zoom}px` }}
                            >
                                Today
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Legend */}
            {!editMode && (
                <button
                    title="legend"
                    onClick={() => setIsLegendVisible(!isLegendVisible)}
                    className="flex justify-content-center align-content-center fixed top-4 right-4 bg-white_text  dark:bg-[#323232] w-12 h-12 border-2 border-dark_node dark:border-white_text rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-[#696969] transition"
                >
                    <i className="bi bi-list-task text-[1.8em] dark:text-white_text"></i>
                </button>
            )}

            {!editMode && isLegendVisible && (
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
            {!editMode && (
                <button
                    title={allLinkVisible ? "Hide all connections" : "Color all connections"}
                    onClick={() => {
                        setAllLinkVisible(prev => !prev);
                    }}
                    className="flex justify-content-center align-content-center fixed top-20 right-4 bg-white_text  dark:bg-[#323232] w-12 h-12 border-2 border-dark_node dark:border-white_text rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-[#696969] transition"
                >
                    <i className={`bi bi-share${allLinkVisible ? "-fill" : ""} text-[1.8em] dark:text-white_text`}></i>
                </button>
            )}

            {/* Filter button */}
            {!editMode && (
                <button
                    title="filter"
                    onClick={() => { setIsFilterMenuOpen(prev => !prev) }}
                    className="flex justify-content-center align-content-center fixed top-36 right-4 bg-white_text  dark:bg-[#323232] w-12 h-12 border-2 border-dark_node dark:border-white_text rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-[#696969] transition"
                >
                    <i className="bi bi-filter text-[1.8em] dark:text-white_text"></i>
                </button>
            )}

            {/* Edit button */}
            <button
                title={editMode ? "exit" : "edit mode"}
                onClick={() => {
                    setEditMode(prev => !prev);
                }}
                className={`flex justify-content-center align-content-center fixed ${editMode ? "top-4" : "top-52"} right-4 bg-white_text  dark:bg-[#323232] w-12 h-12 border-2 border-dark_node dark:border-white_text rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-[#696969] transition`}
            >
                <i className={`bi ${editMode ? "bi-x-lg" : "bi-pencil-square "} text-[1.7em] dark:text-white_text`}></i>
            </button>

        </div>
    );
};

export default DiagramBoard;

function FilterDocumentsControl({
    currentFilteredDoc,
    setCurrentFilteredDoc,
    filteredDocs
}) {
    const [currentCount, setCurrentCount] = useState(0)
    useEffect(() => {
        setCurrentCount(0);
    }, [filteredDocs])
    return (
        <div className="fixed z-[1000] top-[40px] left-[50%] translate-x-[-50%] translate-y-[20%] flex flex-row items-center justify-between py-2 text-black_text dark:text-white_text bg-[#ffffff55] dark:bg-box_color rounded-lg">
            <i
                className={`ml-3 bi bi-arrow-left cursor-pointer text-3xl ${ currentCount === 0 ? "opacity-10 pointer-events-none" : "" }`}
                onClick={() => {
                    const prevdoc = currentCount - 1
                    if (prevdoc >= 0) {
                        setCurrentCount(prev => prev - 1)
                        setCurrentFilteredDoc(filteredDocs[prevdoc].id)
                    }
                }}

            />
            <div className="text-xl">
                <span className="bg-primary_color_light dark:bg-customBlue rounded-md px-2">
                    {currentCount + 1}
                </span>
                <span className="mx-2 px-2">of</span>
                <span className="px-2">{filteredDocs.length}</span>
            </div>

            
            <i
                className={`mr-3 bi bi-arrow-right cursor-pointer ${ currentCount+1 === filteredDocs.length ? "opacity-10 pointer-events-none" : "" } text-3xl`}
                onClick={() => {
                    const nextdoc = currentCount + 1
                    if (nextdoc < filteredDocs.length) {
                        setCurrentCount(prev => prev + 1)
                        setCurrentFilteredDoc(filteredDocs[nextdoc].id)
                    }
                }}

            />
        </div>
    );
}
