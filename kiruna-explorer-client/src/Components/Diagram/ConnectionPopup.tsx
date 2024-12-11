import {useTheme} from '../../contexts/ThemeContext.jsx';
import {SelectedDocument} from '../LinkDocuments.jsx';
import {Charging} from '../Charging.jsx';
import {useEffect, useState} from "react";
import API from "../../API/API.mjs";
import dayjs from "dayjs";

interface ConnectionPopupProps {
    isEditing: boolean;
    documentFromId: number;
    documentToId: number;
    closePopup: () => void;
}

function ConnectionPopup({isEditing, documentFromId, documentToId, closePopup}: ConnectionPopupProps) {

    const {isDarkMode} = useTheme();

    const [link, setLink] = useState([]);
    const [documentFrom, setDocumentFrom] = useState(null);
    const [documentTo, setDocumentTo] = useState(null);

    const defaultConnectionOptions = [
        "direct_consequence",
        "collateral_consequence",
        "projection",
        "update",
    ];

    const handleConnectionChange = (docId, value) => {
        setLink((prevLinks) => {
            const currentConnections = prevLinks[docId] || [];
            const newLinks = currentConnections.includes(value)
                ? currentConnections.filter((conn) => conn !== value)
                : [...currentConnections, value];

            return {
                ...prevLinks,
                [docId]: newLinks,
            };
        });
    };

    const getFilteredOptions = (docId) => {
        const currentConnections = link[docId];
        return defaultConnectionOptions.filter(
            (option) => !currentConnections.includes(option)
        );
    };

    const generateLinkArray = () => {
        return Object.entries(link).reduce((acc, [docId, connectionTypes]) => {
            connectionTypes.forEach((connectionType) => {
                if (connectionType !== "None") {
                    const linkObject =
                        {
                            originalDocId: documentFromId.toString(),
                            selectedDocId: docId,
                            connectionType,
                            date: dayjs().format("YYYY-MM-DD"),
                        };
                    acc.push(linkObject);
                }
            });
            return acc;
        }, []);
    };

    const handleConfirm = async () => {
        const linkArray = generateLinkArray();
        try {
            if (linkArray.length == 0) {
                //await API.deleteAll(documentFromId);
            } else {
                //await API.addLinks(linkArray);
            }
        } catch (error) {
            throw new Error(
                "Unable to add the connection. Please check your connection and try again."
            );
        }
    }

    useEffect(() => {
        if (documentFromId != undefined && documentToId != undefined) {
            const getDocumentLinks = async () => {
                try {
                    const documentToTemp = await API.getDocumentById(documentToId);
                    const documentFromTemp = await API.getDocumentById(documentFromId);
                    const linkedDocument = await API.getDocuemntLinks(documentFromId);
                    setDocumentTo(documentToTemp);
                    setDocumentFrom(documentFromTemp);
                    setLink((prevLinks) => ({
                        ...prevLinks,
                        [documentToId]: linkedDocument.filter((link) => link.id === documentToId).map((link) => link.type)
                    }));
                } catch (error) {
                    console.error(error)
                }
            }
            getDocumentLinks();
        }
    }, [documentToId, documentFromId]);

    return (
        <div className={`fixed z-[1300] inset-0 flex items-center justify-center ${isDarkMode ? "dark" : "light"}`}>
            <div
                className="w-[50em] flex flex-col bg-background_color_light dark:bg-background_color shadow-md rounded-md text-black_text dark:text-white_text font-sans p-4 overflow-y-auto">
                <div className="w-full pb-3 flex flex-row justify-content-between">
                <p className="m-0 p-0 font-normal text-xl">{isEditing ? "Edit Connection" : "Add Connection"}</p>
                <button onClick={() => {
                    closePopup()
                }} className="text-black_text dark:text-white_text text-base right-4 hover:opacity-50 transition">
                    <i className="bi bi-x-lg text-2xl"></i>
                </button>
                </div>
                <div className={"flex flex-row gap-1 pb-1"}>
                    <p className="m-0 p-0 font-light text-md opacity-50">{"From: "}</p>
                    <p className="m-0 p-0 font-light text-md line-clamp-1 text-truncate"> {documentFrom ? documentFrom.title :
                        ""}</p>
                </div>

                <p className="m-0 p-0 font-light text-md opacity-50 pb-1">{"To: "}</p>
                {
                    documentTo ? <SelectedDocument
                            docId={documentTo.id}
                            key={documentTo.id}
                            title={documentTo.title}
                            type={documentTo.type}
                            date={documentTo.date}
                            stakeholders={[]}
                            connectionOptions={defaultConnectionOptions}
                            selectedOption={
                                documentToId ? link[documentToId] : []
                            }
                            onConnectionChange={(value: string) => {
                                handleConnectionChange(documentTo.id, value);
                            }
                            }
                            getFilteredOptions={getFilteredOptions}
                            isDarkMode={isDarkMode}>

                        </SelectedDocument> :
                        <Charging></Charging>
                }
                <div className="w-full flex justify-content-end">
                    <button
                        className={"w-28 bg-primary_color_light dark:bg-primary_color_dark hover:opacity-70 text-black_text dark:text-white_text font-semibold py-2 px-4 rounded-md mt-4 transition justify-end"}
                        onClick={handleConfirm}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConnectionPopup;