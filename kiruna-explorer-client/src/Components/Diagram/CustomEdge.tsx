import {EdgeProps, getBezierPath} from '@xyflow/react';
import React, {useState} from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const CustomEdge = ({
    id,
    data,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd
}: EdgeProps) => {
    const { isDarkMode } = useTheme();

    // Otteniamo il path principale (di base) con getBezierPath
    const [basePath , labelX, labelY] = getBezierPath({
        sourceX: sourceX || 0,
        sourceY: sourceY || 0,
        targetX: targetX || 0,
        targetY: targetY || 0,
        sourcePosition,
        targetPosition,
        curvature: 2
    });

    const isColored = data?.selectedEdge

    // Funzione per associare i colori ai tipi di connessione
    const getColor = (typeOfConnection: string) => {
        return typeOfConnection === "direct_consequence" ? "#E82929"
            : typeOfConnection === "collateral_consequence" ? "#31F518"
                : typeOfConnection === "projection" ? "#4F43F1"
                    : typeOfConnection === "update" ? "#E79716"
                            : isDarkMode ? "#FFFFFF"
                                : "#000000";
    };

    // Array di colori dai tipi di connessione
    const colors: string[] = Array.isArray(data?.typesOfConnections)
        ? data.typesOfConnections.map((typeOfConnection: string) => getColor(typeOfConnection))
        : ["#000000"];

    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            {/* Se c'è un solo colore, disegniamo un solo path continuo */}
            {colors.length === 1 && isColored ? (
                <path
                    key={`${id}-color-0`}
                    id={`${id}-color-0`}
                    style={{
                        ...style,
                        stroke: colors[0],
                        strokeWidth: "0.2em", // Tutti i path hanno la stessa larghezza
                        pointerEvents: 'none'
                    }}
                    className={`react-flow__edge-path`}
                    d={basePath} // Usa lo stesso percorso
                    markerEnd={markerEnd} // Aggiungi la freccia se presente
                />
            ) : colors.length > 1 && isColored? (
                // Altrimenti, per più colori, creiamo percorsi segmentati
                colors.map((color, index) => (
                    <path
                        key={`${id}-color-${index}`}
                        id={`${id}-color-${index}`}
                        style={{
                            ...style,
                            stroke: color,
                            strokeWidth: "0.2em", // Tutti i path hanno la stessa larghezza
                            pointerEvents: 'none'
                        }}
                        className={`react-flow__edge-path`}
                        d={basePath} // Usa lo stesso percorso
                        strokeDasharray={`${15},${15*(colors.length-1)}`} // Lunghezza e spazio dei segmenti
                        strokeDashoffset={index * 15} // Offset incrementale per separare i colori
                        markerEnd={index === colors.length - 1 ? markerEnd : undefined} // La freccia sull'ultimo path
                    />
                ))
            ) : (
                <path
                    key={`${id}-color-0`}
                    id={`${id}-color-0`}
                    style={{
                        ...style,
                        stroke: "#777777",
                        strokeWidth: "0.2em", // Tutti i path hanno la stessa larghezza
                        pointerEvents: 'none'
                    }}
                    className={`react-flow__edge-path`}
                    d={basePath} // Usa lo stesso percorso
                    markerEnd={markerEnd} // Aggiungi la freccia se presente
                />
            )
        }
            <path
                d={basePath}
                style={{fill: 'none', stroke: 'transparent', strokeWidth: '0.3em'}}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
            {/*isHovered && (
                <foreignObject x={labelX - 50} y={labelY - 20}  className="w-3/4 h-100 p-0 m-0">
                    <div
                        className="bg-white_text dark:bg-black_text text-black_text dark:text-white_text rounded-md shadow-md text-sm">
                        <ul className="m-0 p-2">
                            {Array.isArray(data?.typesOfConnections) ? data.typesOfConnections.map((str: string, index: number) => (
                                <li key={index}>
                                    {"- " + str}
                                </li>
                            )) : []}
                        </ul>
                    </div>
                </foreignObject>
            )*/}
        </>
    );
};

export default CustomEdge;
