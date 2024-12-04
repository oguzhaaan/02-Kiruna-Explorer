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

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sourceX || 0,
        sourceY: sourceY || 0,
        targetX: targetX || 0,
        targetY: targetY || 0,
        sourcePosition,
        targetPosition
    });

    const [isHovered, setIsHovered] = useState(false);

    const getColor = (typeOfConnection: string) => {
        return typeOfConnection === "direct_consequence" ? "#E82929"
            : typeOfConnection === "collateral_consequence" ? "#31F518"
                : typeOfConnection === "projection" ? "#4F43F1"
                    : typeOfConnection === "update" ? "#E79716"
                    : typeOfConnection === "prevision"? "#26C6DA"
                        : isDarkMode ? "#FFFFFF"
                            : "#000000";
    };

    const generateGradientStops = (colors: string[]) => {
        if (colors.length === 0) {
            colors = ["#000000"];
        }
        if (colors.length === 1) {
            return [
                <stop key="start" offset="0%" stopColor={colors[0]} />,
                <stop key="end" offset="100%" stopColor={colors[0]} />
            ];
        }

        const stops:any[] = [];
        for (let i = 0; i < colors.length; i++) {
            const offset = (i / (colors.length - 1)) * 100;
            stops.push(<stop key={i} offset={`${offset}%`} stopColor={colors[i]} />);
            if (i < colors.length - 1) {
                const nextOffset = ((i + 0.5) / (colors.length - 1)) * 100;
                stops.push(<stop key={`${i}-intermediate`} offset={`${nextOffset}%`} stopColor={colors[i]} />);
            }
        }
        return stops;
    };

    const gradientColors: string[] = Array.isArray(data?.typesOfConnections)
        ? data.typesOfConnections.map((typeOfConnection: string) => getColor(typeOfConnection))
        : ["#000000"];

    return (
        <>
            <defs>
                <linearGradient id={`gradient-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
                    {generateGradientStops(gradientColors)}
                </linearGradient>
            </defs>
            <path
                id={id}
                style={{
                    ...style,
                    stroke: gradientColors.length > 0 ? `url(#gradient-${id})` : "#000000",
                    pointerEvents: 'none'
                }}
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
                            {Array.isArray(data?.typesOfConnections) ? data.typesOfConnections.map((str: string, index: number) => (
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
