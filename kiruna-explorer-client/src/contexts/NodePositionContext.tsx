import React, {createContext, useContext, useEffect, useState} from 'react';

interface NodePosition {
    [key: string]: { x: number; y: number };
}

interface NodePositionContextProps {
    nodePositions: NodePosition;
    setNodePosition: (id: string, position: { x: number; y: number }) => void;
}

const NodePositionContext = createContext<NodePositionContextProps | undefined>(undefined);

export const NodePositionProvider: React.FC = ({ children }) => {
    const [nodePositions, setNodePositions] = useState<NodePosition>({});

    const setNodePosition = (id: string, position: { x: number; y: number }) => {
        setNodePositions((prev) => ({ ...prev, [id]: position }));
    };

    useEffect(() => {
        console.log(nodePositions)
    }, []);

    return (
        <NodePositionContext.Provider value={{ nodePositions, setNodePosition }}>
            {children}
        </NodePositionContext.Provider>
    );
};

export const useNodePosition = () => {
    const context = useContext(NodePositionContext);
    if (!context) {
        throw new Error('useNodePosition must be used within a NodePositionProvider');
    }
    return context;
};