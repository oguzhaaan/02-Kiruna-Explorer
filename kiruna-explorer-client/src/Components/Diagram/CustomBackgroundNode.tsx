import {NodeProps} from '@xyflow/react';

interface CustomBackgroundNodeProps extends NodeProps {
    data: {
        years: string[];
        distanceBetweenYears: number;
    };
}

function CustomBackgroundNode({
                                  data: {years, distanceBetweenYears}
                              }: CustomBackgroundNodeProps) {
    const barWidth = distanceBetweenYears * years.length < 1920 * 2 ? 1920 * 2 : distanceBetweenYears * years.length;

    return (
        <div style={{width: `${barWidth}px`, height: '2160px'}}
             className={`pointer-events-none text-black_text dark:text-white_text`}>
            {/* <div className={`absolute w-full bg-white h-[2px]`}>
                {years.map((year, index) => (
                    <div
                        key={year}
                        className="absolute transform -translate-x-1/2 -translate-y-1/3 pt-2 flex flex-col justify-content-center align-items-center"
                        style={{ left: `${index * distanceBetweenYears}px` }}
                    >
                        <div className="w-8 h-8 bg-white rounded-full"></div>
                        {year}
                    </div>
                ))}
            </div> */}

            {/* Text (0 to 350)px */}
            <div className={`absolute w-full text-black_text dark:text-white_text top-[165px] px-5 text-3xl`}>Text
            </div>

            {/* Concept (350 to 700)px */}
            <div className={`absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] top-[350px]`}></div>
            <div
                className={`absolute w-full text-black_text dark:text-white_text top-[515px] px-5 text-3xl`}>Concept
            </div>

            {/* Plan (125 + 175 + 300 + 175 + 125) (700 to 1600)px */}
            <div className={`absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] top-[700px]`}></div>
            <div
                className={`absolute w-full text-black_text dark:text-white_text top-[1140px] px-5 text-3xl`}>Plan
            </div>

            <div
                className={`absolute w-full text-black_text dark:text-white_text top-[805px] px-5 text-3xl left-[200px]`}>1:100,000
            </div>
            <div
                className={`absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] top-[825px] left-[400px]`}></div>

            <div
                className={`absolute w-full text-black_text dark:text-white_text top-[980px] px-5 text-3xl left-[200px]`}>1:10,000
            </div>
            <div
                className={`absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] top-[1000px] left-[400px]`}></div>

            <div
                className={`absolute w-full text-black_text dark:text-white_text top-[1280px] px-5 text-3xl left-[200px]`}>1:5,000
            </div>
            <div
                className={`absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] top-[1300px] left-[400px]`}></div>

            <div
                className={`absolute w-full text-black_text dark:text-white_text top-[1455px] px-5 text-3xl left-[200px]`}>1:1,000
            </div>
            <div
                className={`absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] top-[1475px] left-[400px]`}></div>


            {/* Blueprints/effects (1600 to 2160)px */}
            <div className={`absolute w-full bg-[#44444455] dark:bg-[#cccccc55] h-[2px] top-[1600px]`}></div>
            <div
                className={`absolute w-full text-black_text dark:text-white_text top-[1870px] px-5 text-3xl`}>Blueprints/effects
            </div>
        </div>
    );
}

export default CustomBackgroundNode;