import { createContext, useState, useEffect, useContext } from 'react';
import API from '../API/API.mjs';

const NewDocumentContext = createContext();

export const NewDocumentProvider = ({ children }) => {
    const [stakeholderOptions, setStakeholderOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [isAddingNewStakeholder, setIsAddingNewStakeholder] = useState(false);
    const [newStakeholderName, setNewStakeholderName] = useState("");
    const [newStakeholders, setNewStakeholders] = useState([]);
    const [oldStakeholders, setOldStakeholders] = useState([]);

    const [typeOptions, setTypeOptions] = useState([]);
    const [isAddingNewType, setIsAddingNewType] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [oldTypes, setOldTypes] = useState([]);

    useEffect(() => {
        const initialization = async () => {
            try {
                const types = await API.getAllTypes();
                setOldTypes(types);
                types.push({ id: types.length + 1, name: "Add a new one..." });
                setTypeOptions(types);
                const stakeholders = await API.getAllStakeholders();
                setOldStakeholders(stakeholders);
                stakeholders.push({ id: stakeholders.length + 1, name: "Add a new one..." });
                setStakeholderOptions(stakeholders);
            } catch (err) {
                console.log(err.message);
            }
        };
        initialization();
    }, []);

    return (
        <NewDocumentContext.Provider value={{
            stakeholderOptions, setStakeholderOptions,
            selectedOption, setSelectedOption,
            isAddingNewStakeholder, setIsAddingNewStakeholder,
            newStakeholderName, setNewStakeholderName,
            newStakeholders, setNewStakeholders,
            oldStakeholders, setOldStakeholders,
            typeOptions, setTypeOptions,
            isAddingNewType, setIsAddingNewType,
            newTypeName, setNewTypeName,
            selectedType, setSelectedType,
            oldTypes, setOldTypes
        }}>
            {children}
        </NewDocumentContext.Provider>
    );
};

export const useNewDocument = () => useContext(NewDocumentContext);