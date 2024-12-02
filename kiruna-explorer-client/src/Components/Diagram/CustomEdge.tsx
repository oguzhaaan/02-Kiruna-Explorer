import {EdgeProps, getBezierPath} from '@xyflow/react';
import React from 'react';
import {useState} from "react";

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
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition
    });

    const [isHovered, setIsHovered] = useState(false);

    const getColor = (typeOfConnection: string) => {
        return typeOfConnection === "Direct Consequence" ? "#E82929"
            : typeOfConnection === "Collateral Consequence" ? "#31F518"
                : typeOfConnection === "Projection" ? "#4F43F1"
                    : typeOfConnection === "Update" ? "#E79716"
                        : "#000000";
    }

    const generateGradientStops = (colors: string[]) => {
        if (colors.length === 0) {
            colors = ["#000000"];
        }
        const stops = [];
        for (let i = 0; i < colors.length; i++) {
            const offset = (i / (colors.length - 1)) * 100;
            stops.push(<stop key={i} offset={`${offset}%`} stopColor={colors[i]} />);
            if (i < colors.length - 1) {
                const nextOffset = ((i + 0.5) / (colors.length - 1)) * 100;
                const intermediateColor = colors[i]; // You can also blend colors[i] and colors[i+1] for a smoother transition
                stops.push(<stop key={`${i}-intermediate`} offset={`${nextOffset}%`} stopColor={intermediateColor} />);
            }
        }
        return stops;
    };

    const gradientColors: string[] = Array.isArray(data.typesOfConnections) ? data.typesOfConnections.map((typeOfConnection: string) => getColor(typeOfConnection)) : [];

    return (
        <>
            <defs>
                <linearGradient id={`gradient-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
                    {generateGradientStops(gradientColors)}
                </linearGradient>
            </defs>
            <path
                id={id}
                style={{...style, stroke: `url(#gradient-${id})`, pointerEvents: 'none'}}
                className={`react-flow__edge-path stroke-[0.2em]`}
                d={edgePath}
                markerEnd={markerEnd}
            />
            <path
                d={edgePath}
                style={{fill: 'none', stroke: 'transparent', strokeWidth: '3em'}}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
            {isHovered && (
                <foreignObject x={labelX - 50} y={labelY - 20} className="w-3/4 h-100 p-0 m-0">
                    <div
                        className="bg-white_text dark:bg-black_text text-black_text dark:text-white_text rounded-md shadow-md text-sm">
                        <ul className="m-0 p-2">
                            {Array.isArray(data.typesOfConnections) ? data.typesOfConnections.map((str: string, index: number) => (
                                <li key={index}>
                                    {"- " + str}
                                </li>
                            )) : []}
                        </ul>
                    </div>
                </foreignObject>
            )}
        </>
    );
};

export default CustomEdge;