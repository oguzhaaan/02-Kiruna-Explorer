import { NodeProps } from '@xyflow/react';
import React from 'react';
import { useState } from 'react';
import { YScalePosition } from '../Utilities/DiagramReferencePositions.js';

interface CustomBackgroundNodeProps extends NodeProps {
    data: {
        years: string[];
        zoom: number;
        viewport: { x: number, y: number, zoom: number };
        distanceBetweenYears: number;
    };
}

function CustomBackgroundNode({
    data: { years, distanceBetweenYears }
}: CustomBackgroundNodeProps) {
    const offsetTimeLine = -400
    const barWidth = offsetTimeLine + distanceBetweenYears * years.length < 1920 * 2 ? 1920 * 2 : offsetTimeLine + distanceBetweenYears * years.length;

    return (
        <div style={{ width: `${barWidth}px`, height: '2160px' }}
            className={`text-black_text dark:text-white_text`}>

            {/* Text (0 to 350)px */}
            <div style={{ top: `${YScalePosition["text"]}px` }}
                className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl">Text
            </div>

            {/* Concept (350 to 700)px */}
            <div className="absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px]" style={{ top: '350px' }}></div>
            <div style={{ top: `${YScalePosition["concept"]}px` }}
                className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl">Concept
            </div>

            {/* Plan (125 + 175 + 300 + 175 + 125) (700 to 1600)px */}
            <div className="absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px]" style={{ top: '700px' }}></div>
            <div className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl" style={{ top: '1140px' }}>
                Plan
            </div>

            <div className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl left-[200px]"
                style={{ top: `${YScalePosition["plan100000"]}px` }}>1:100,000
            </div>
            <div className="absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] left-[400px]"
                style={{ top: '825px' }}></div>

            <div className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl left-[200px]"
                style={{ top: `${YScalePosition["plan10000"]}px` }}>1:10,000
            </div>
            <div className="absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] left-[400px]"
                style={{ top: '1000px' }}></div>

            <div className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl left-[200px]"
                style={{ top: `${YScalePosition["plan5000"]}px` }}>1:5,000
            </div>
            <div className="absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] left-[400px]"
                style={{ top: '1300px' }}></div>

            <div className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl left-[200px]"
                style={{ top: `${YScalePosition["plan1000"]}px` }}>1:1,000
            </div>
            <div className="absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] left-[400px]"
                style={{ top: '1475px' }}></div>

            {/* Blueprints/effects (1600 to 2160)px */}
            <div className="absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px]"
                style={{ top: '1600px' }}></div>
            <div style={{ top: `${YScalePosition["blueprints"]}px` }}
                className="absolute w-full text-black_text dark:text-white_text px-5 text-3xl">Blueprints/effects
            </div>
        </div>
    );
}


export default CustomBackgroundNode;