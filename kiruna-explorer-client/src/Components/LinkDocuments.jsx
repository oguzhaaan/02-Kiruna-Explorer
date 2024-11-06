import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {getStakeholderColor} from "./Utilities/StakeholdersColors";
import {getIcon} from "./Utilities/DocumentIcons";
import API from "../API/API.mjs";

function formatString(input) {
    return input
        .replace(/_/g, " ") // Replace underscores with spaces
        .split(" ") // Split the string into an array of words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(" "); // Join the words back into a single string
}

const LinkDocuments = ({originalDocId, mode, setConnectionsInForm}) => {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [documents, setDocuments] = useState([]);

    // Default connection options for all documents
    const defaultConnectionOptions = [
        "None",
        "direct_consequence",
        "collateral_consequence",
        "prevision",
        "update",
    ];

    // State to hold the connection types for each document
    const [links, setLinks] = useState([]);

    console.log(links)

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const linkedDocument = await API.getDocuemntLinks(originalDocId);
                const allDocuments = await API.getAllDocuments();
                // Filter out the document with the same ID as originalDocId
                const mergedDocuments = allDocuments.filter(doc => {
                    // Verifica se il documento NON è presente in linkedDocument
                    return !linkedDocument.some(linkedDoc => linkedDoc.id === doc.id);
                }).map(doc => {
                    // Se il documento non è presente nei linkedDocument, aggiungi il campo `connection`
                    const linkedDoc = linkedDocument.find(link => link.id === doc.id);
                    return {
                        ...doc,
                        connection: linkedDoc ? linkedDoc.connection : "None"
                    };
                });
                setDocuments(mergedDocuments);
                setLinks(mergedDocuments.reduce((acc, doc) => {
                    acc[doc.id] = "None";
                    return acc;
                }, {}));
            } catch (error) {
                console.error("Error in getAllDocuments function:", error.message);
                throw new Error(
                    "Unable to get the documents. Please check your connection and try again."
                );
            }
        };

        fetchDocuments();
    }, []);

    // State to hold the search query
    const [searchQuery, setSearchQuery] = useState("");

    const handleConnectionChange = (docId, value) => {
        setLinks(prevLinks => ({
            ...prevLinks,
            [docId]: value
        }));
    };

    // Generate link array based on user selections
    const generateLinkArray = () => {
        return Object.entries(links).reduce((acc, [docId, connectionType]) => {
            if (connectionType !== "None") {
                const linkObject =
                    mode === "return"
                        ? {
                            selectedDocId: docId,
                            connectionType,
                            date: dayjs().format("YYYY/MM/DD"),
                        }
                        : {
                            originalDocId,
                            selectedDocId: docId,
                            connectionType,
                            date: dayjs().format("YYYY/MM/DD"),
                        };
                acc.push(linkObject);
            }
            return acc;
        }, []);
    };

    // Filter documents based on the search query and connection status
    const filteredDocuments = documents.filter(doc => {
        const connectionType = links[doc.id];
        return (
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            connectionType !== "None"
        );
    });

    // Show modal when "Done" is clicked
    const handleDoneClick = () => {
        setIsModalVisible(true);
    };

    // Confirm and log link array when modal confirmation is clicked
    const handleConfirm = async () => {
        const linkArray = generateLinkArray();

        if (mode === "return") {
            // In "return" mode, call the callback function with connectionArray
            setConnectionsInForm(linkArray);
            navigate(-1);
        } else if (mode === "save") {
            //
            // In "save" mode, make an API call to save the connections
            for (const link of linkArray) {
                try {
                    await API.addLink(link);
                    navigate(-1);
                } catch (error) {
                    console.error("Error in adding connection:", error.message);
                    throw new Error(
                        "Unable to add the connection. Please check your connection and try again."
                    );
                }
            }
        }

        setIsModalVisible(false); // Hide modal after confirmation
    };

    // Close modal without saving changes
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div className="min-h-screen bg-background_color p-3 text-white">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between w-full h-14 mb-4">
                <div className="flex items-center gap-3">
                    {/* Back Button */}
                    <button
                        onClick={() => {
                            setLinks(documents.map(() => "None")); // Reset connections
                            setSearchQuery(""); // Reset search query
                            navigate(-1); // Navigate back
                        }}
                        className="text-white text-xl right-4 hover:text-gray-600"
                    >
                        <i className="bi bi-arrow-left text-4xl"></i>
                    </button>

                    {/* Search Input */}
                    <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="bi bi-search"></i>
            </span>
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-search_color w-60 py-2 pl-10 pr-4 text-black rounded-full focus:outline-none placeholder-black"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Sort Button */}
                    <button className="text-white text-4xl">
                        <i className="bi bi-sort-down-alt"></i>
                    </button>
                </div>

                {/* Done Button */}
                <button
                    onClick={handleDoneClick}
                    className="bg-[#2E6A8E] text-white py-2 px-4 rounded-full"
                >
          <span>
            <i className="bi bi-file-earmark-plus"></i> Done
          </span>
                </button>
            </div>

            <div className="flex flex-row gap-3">
                {/* Document List */}
                <div className="space-y-3 w-7/12">
                    {filteredDocuments.filter((doc) => links[doc.id] === "None").map((doc) => (
                        <DocumentItem
                            key={doc.id}
                            title={doc.title}
                            type={doc.type}
                            date={doc.date}
                            stakeholders={doc.stakeholders}
                            connectionOptions={defaultConnectionOptions}
                            selectedOption={links[doc.id]}
                            onConnectionChange={(value) => handleConnectionChange(doc.id, value)}
                        />
                    ))}
                </div>

                <div className="px-3 py-3 space-y-3 w-5/12 rounded-2xl bg-[#0e2430]">
                    <p className="m-0 p-0 text-white_text text-2xl font-bold">Connected Documents</p>
                    {filteredDocuments.filter((doc) => links[doc.id] !== "None").map((doc) => (
                        <SelectedDocument
                            key={doc.id}
                            title={doc.title}
                            type={doc.type}
                            date={doc.date}
                            stakeholders={doc.stakeholders}
                            connectionOptions={defaultConnectionOptions}
                            selectedOption={links[doc.id]}
                            onConnectionChange={(value) => handleConnectionChange(doc.id, value)}
                        />
                    ))}
                </div>

            </div>

            {/* Confirmation Modal */}
            {isModalVisible && (
                <ConfirmationModal onConfirm={handleConfirm} onCancel={handleCancel}/>
            )}
        </div>
    );
};

const DocumentItem = ({
                          title,
                          type,
                          date,
                          stakeholders,
                          connectionOptions,
                          selectedOption,
                          onConnectionChange,
                      }) => {
    const backgroundColor =
        selectedOption === "None"
            ? "bg-document_item_radient_grey"
            : "bg-document_item_radient_blue";

    return (
        <div
            className={`flex flex-row rounded-3xl ${backgroundColor} p-3 relative`}
        >
            {/* Connection Section */}
            <div className="flex basis-1/6 flex-col self-center">
                <label>Connection:</label>
                <select
                    className="rounded-full min-w-36 h-8 mt-1 pl-3 bg-customGray3_30 text-white"
                    value={selectedOption}
                    onChange={(e) => onConnectionChange(e.target.value)}
                >
                    {connectionOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                            {formatString(option)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Vertical Line */}
            <div className="w-0.5 bg-white opacity-10 ms-4 me-2"></div>

            {/* Document Title and Type */}
            <div className="mx-4 flex-col">
                <div className="text-xl mb-3 font-normal">{formatString(title)}</div>
                <div className="text-lg font-light flex items-center">
                    <img src={getIcon({type})} className="w-8 mr-2" alt="type_icon"/>
                    {formatString(type)}
                </div>
            </div>

            {/* Date */}
            <div className="absolute top-3 right-5 text-gray-400">{date}</div>

            {/* Stakeholders */}
            <div className="flex space-x-2 absolute bottom-4 right-5">
                {stakeholders.map((stakeholder, idx) => (
                    <span
                        key={idx}
                        className={`rounded-full px-3 py-1 text-sm text-white ${getStakeholderColor(
                            {stakeholder}
                        )}`}
                    >
            {formatString(stakeholder)}
          </span>
                ))}
            </div>
        </div>
    );
};

const SelectedDocument = ({
                              title,
                              type,
                              date,
                              stakeholders,
                              connectionOptions,
                              selectedOption,
                              onConnectionChange,
                          }) => {
    const backgroundColor =
        selectedOption === "None"
            ? "bg-document_item_radient_grey"
            : "bg-document_item_radient_blue";

    return (
        <div
            className={`flex flex-row rounded-3xl bg-document_item_radient_blue p-3 gap-3`}
        >
            {/* Connection Section */}
            <div className="flex flex-col w-1/2 self-center">
                <label>Connection:</label>
                <select
                    className="rounded-full min-w-36 h-8 mt-1 pl-3 bg-customGray3_30 text-white"
                    value={selectedOption}
                    onChange={(e) => onConnectionChange(e.target.value)}
                >
                    {connectionOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                            {formatString(option)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Vertical Line */}
            <div className="w-0.5 bg-white opacity-10"></div>

            {/* Document Title and Type */}
            <div className="mx-4 flex-col">
                <div className="text-xl mb-3 font-normal">{formatString(title)}</div>
                <div className="text-lg font-light flex items-center">
                    <img src={getIcon({type})} className="w-8 mr-2" alt="type_icon"/>
                    {formatString(type)}
                </div>
            </div>

            {/* Date */
                /*
                <div className="m-0 p-0 text-gray-400 justify-self-end">{date}</div>
                */
            }
        </div>
    );
};

// Modal component for confirmation
const ConfirmationModal = ({onConfirm, onCancel}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div
                className="flex flex-col justify-items-center align-items-center bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-3xl text-white font-sans p-6">
                <div className="text-2xl font-bold">Add connections?</div>
                <div className="flex justify-center space-x-3 mt-16">
                    <button
                        onClick={onCancel}
                        className="bg-customGray text-black w-40 h-16 opacity-60 px-4 py-2 rounded-full text-2xl"
                    >
                        Go back
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-customBlue  text-white w-40 h-16 px-4 py-2 rounded-full text-2xl"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkDocuments;
