import React, {createContext, useContext, useEffect, useState} from 'react';
import API from '../API/API.mjs';

interface NodePosition {
    [key: string]: { x: number; y: number };
}

interface NodePositionContextProps {
    nodePositions: NodePosition;
    saveNodePosition: (newPosition: { docId: number, x: number, y: number }) => void;
}

const NodePositionContext = createContext<NodePositionContextProps | undefined>(undefined);

export const NodePositionProvider: React.FC = ({children}) => {
    const [nodePositions, setNodePositions] = useState<NodePosition>({});

    useEffect(() => {
        const fetchNodePositions = async () => {
            const nodePositions = await API.getAllDiagramPositions();
            const nodePositionsMap = {} as NodePosition;
            nodePositions.forEach((nodePosition: { id: number, documentId: number, x: number, y: number }) => {
                nodePositionsMap[nodePosition.documentId.toString()] = { x: nodePosition.x, y: nodePosition.y };
            });
            setNodePositions(nodePositionsMap);
            //console.log(nodePositions);
        };
        fetchNodePositions();
    }, []);

    const saveNodePosition = async (newPosition: { docId: number, x: number, y: number }) => {
        try {
            await API.postNewDiagramPosition(newPosition);
            setNodePositions((prev) => ({ ...prev, [newPosition.docId]: { x: newPosition.x, y: newPosition.y } }));
        } catch (error) {
            console.error('Failed to save node position:', error);
        }
    };

    return (
        <NodePositionContext.Provider value={{nodePositions, saveNodePosition}}>
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