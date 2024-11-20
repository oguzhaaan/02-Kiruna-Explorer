import { useState, useEffect } from "react";
import { useFetcher, useNavigate, useParams } from "react-router-dom";
import Alert from "./Alert.jsx";
import informativeIcon from "../assets/informative.svg";
import { Charging } from "./Charging.jsx";
import { getIcon, getIconByExtension } from "./Utilities/DocumentIcons.jsx";
import { getStakeholderColor } from "./Utilities/StakeholdersColors.jsx";
import { getLanguageName } from "./Utilities/Languages.jsx";
import API from "../API/API.mjs";
import { useTheme } from "../contexts/ThemeContext.jsx";

function SingleDocument(props) {

    const { isDarkMode } = useTheme();
    const [alertMessage, setAlertMessage] = useState(['', '']);


    const [collapsedSections, setCollapsedSections] = useState({});
    const [collapsedFileSections, setCollapsedFileSections] = useState({});
    const [document, setDocument] = useState({});
    const [documentLinks, setDocumentLinks] = useState([]);
    const [isCharging, setIsCharging] = useState(false);
    const [modalPlusVisible, setModalPlusVisible] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); // Tieni traccia dell'indice del dropdown aperto
    const [showModalDeleteConfirm, setShowModalDeleteConfirm] = useState(false);

    const handleToggleDropdown = (index) => {
        // Se il dropdown è già aperto, lo chiudi (toggle)
        if (openDropdown == index) {
            setOpenDropdown(null); // Chiudi il dropdown se già aperto
        } else {
            setOpenDropdown(index); // Altrimenti, apri il dropdown corrispondente
        }
    };


    //upload a new file
    const [fileType, setFileType] = useState(''); // Tipo di file (documento originale o allegato)
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false); // Stato per monitorare se l'upload è in corso


    const handleFileChangeOriginal = (e) => {
        const file = e.target.files[0]; // Ottieni il primo file selezionato
        if (file) {
            setSelectedFile(file);
        }
        setFileType("original");
    };

    useEffect(() => {
        const uploadFile = async () => {
            if (!selectedFile || !fileType) {
                return; // Non fare nulla se non c'è un file o un tipo di file
            }

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('fileType', fileType);

            try {
                setUploading(true); // Imposta lo stato di upload in corso
                console.log(formData.get('file')); // Puoi vedere il file selezionato

                await sleep(2000);
                // Chiamata API per caricare il file
                const response = await API.uploadFile(id, formData);


                if (response) {
                    setAlertMessage([response.message, 'success']);
                    setModalPlusVisible(false); // Chiudi il modal dopo l'upload
                } else {
                    setAlertMessage([response.message, 'error']);
                }
            } catch (error) {
                setAlertMessage([error.message, 'error']);

            } finally {
                setUploading(false); // Termina l'upload
            }
        };

        uploadFile(); // Esegui l'upload quando le dipendenze cambiano
        setModalPlusVisible(false);
        setSelectedFile(null);
        setFileType("");

    }, [fileType]); // Dipendenze: l'effetto si attiva quando questi due stati cambiano

    useEffect(() => {
        if(props.updateAreaId.areaId === "done") {
            props.setUpdateAreaId({areaId:null,docId:null})
            props.setAlertMessage(["Document moved successfully", "success"])
        }
    }, [props.updateAreaId])

    const toggleDropdown = () => {
        setModalPlusVisible(!modalPlusVisible);
    };

    const handleCloseModal = (event) => {
        if (event.target.classList.contains('modal-overlay')) {
            setModalPlusVisible(false);
        }
    };

    const handleDownload = (file) => {
        if (file) {
            console.log('Downloading:', file.name);
            // Chiama la funzione downloadFile dal tuo API
            API.downloadFile(id, file.id, file.path)
                .then(() => {
                    console.log('File downloaded successfully');
                })
                .catch(error => {
                    setAlertMessage([error.message, 'error']);
                });
        }
        setModalPlusVisible(false);
        setSelectedFile(null);
    };


    const handleDelete = async (FileId) => {
        console.log(FileId);

        try {
            const response = await API.deleteFile(id, FileId);

            if (response) {
                setAlertMessage([response.message, 'success']);
            } else {
                setAlertMessage([response.error, 'error']);
            }
        } catch (error) {
            console.error('Upload failed', error);
            setAlertMessage([error.message, 'error']);

        }
        setModalPlusVisible(false);
        setSelectedFile(null);
    };

    //files management
    const [activeTab, setActiveTab] = useState("connections"); // Stato per gestire le schede
    const [files, setFiles] = useState([]);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getDoc = async () => {
            try {
                setIsCharging(true)
                const d = await API.getDocumentById(id)
                if (d !== false) {
                    // Simulate loading time
                    setTimeout(() => {
                        setDocument(d)
                        setIsCharging(false)
                    }, 1000)

                }
                else {
                    navigate("/documents")
                }
            }
            catch (err) {
                navigate("/documents")
                console.log(err)
            }
        }
        if (id) getDoc()
    }, [id])

    useEffect(() => {
        if(props.updateAreaId && props.updateAreaId.areaId === "done") {
            props.setUpdateAreaId({areaId:null,docId:null})
            props.setAlertMessage(["Document moved successfully", "success"])
        }
    }, [props.updateAreaId])

    useEffect(() => {
        const getFiles = async () => {
            try {
                const fileData = await API.getDocumentFiles(id); // Aggiungi un'API per i file
                console.log(fileData);
                setFiles(fileData);
            } catch (error) {
                console.error(error);
            }
        };
        if (id) getFiles();
    }, [id, alertMessage]);

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    {/*TODO adding API to get all document linked to document with specific id*/ }
    useEffect(() => {
        const getLinks = async () => {
            try {
                const links = await API.getDocuemntLinks(id) // [{link1}, {link2}]
                console.log(links)
                setDocumentLinks(links)
            } catch (error) {
                console.error(error)
            }
        }
        if (id) getLinks()

    }, [id])

    function formatString(input) {
        return input
            .replace(/_/g, ' ') // Replace underscores with spaces
            .split(' ') // Split the string into an array of words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join the words back into a single string
    }

    const groupedFiles = files.reduce((acc, file) => {
        if (!acc[file.type]) {
            acc[file.type] = [];
        }
        acc[file.type].push(file);
        return acc;
    }, {});

    return (

        id &&
        <>
            <Alert message={alertMessage[0]} type={alertMessage[1]}
                clearMessage={() => setAlertMessage(['', ''])}></Alert>
            <div className={`${isDarkMode ? 'dark' : 'light'} fixed inset-0 z-[1040] flex items-center justify-center scrollbar-thin scrollbar-webkit`}>

                {/* Modal delete confirm */}
                {showModalDeleteConfirm &&
                    <div className="fixed z-[2000] inset-0 flex items-center justify-center">
                        <div
                            className="flex flex-col justify-items-center align-items-center bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-xl text-black_text dark:text-white_text font-sans p-6">
                            <div className="text-xl text-center w-[26rem] mb-2">Are you really sure to delete the file "{selectedFile.name}"?</div>
                            <div className="flex justify-center space-x-5 mt-10">
                                <button
                                    onClick={() => setShowModalDeleteConfirm(false)}
                                    className="bg-[#FFFFFFcc] dark:bg-customGray hover:bg-[#FFFFFFff] dark:hover:bg-[#938888] transition text-black w-40 h-16 opacity-60  rounded-xl text-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModalDeleteConfirm(false);
                                        console.log(selectedFile);
                                        handleDelete(selectedFile.id);
                                    }}
                                    className="bg-my_red dark:bg-my_red hover:bg-red-500 dark:hover:bg-red-500 transition text-white_text w-40 h-16 rounded-xl text-xl"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                }
                <div
                    className="bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl w-11/12 py-3 px-4 h-5/6 overflow-none rounded-2xl flex flex-col gap-3 items-center relative scrollbar-thin scrollbar-webkit">

                    {
                        uploading && (
                            <div className="fixed inset-0 z-50 bg-[#2b2b2bdd] bg-opacity-50 flex justify-center items-center">
                                <div role="status" className="flex flex-col items-center justify-center">
                                    <svg
                                        aria-hidden="true"
                                        className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-400"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        )
                    }

                    {/* Charging */}
                    {isCharging && <Charging></Charging>}

                    {/* NavBar (X + back) */}
                    <div className="w-100 flex flex-row justify-content-between">
                        <button onClick={() => {
                            navigate(-1);
                        }} className="text-black_text dark:text-white_text text-base right-4 hover:text-gray-600">
                            <i className="bi bi-arrow-left text-2xl"></i>
                        </button>
                        <button onClick={() => {
                            navigate("/documents");
                        }} className="text-black_text dark:text-white_text text-base right-4 hover:text-gray-600">
                            <i className="bi bi-x-lg text-2xl"></i>
                        </button>
                    </div>

                    {/* Content + Links */}
                    <div className="flex flex-row w-100 h-100 text-black_text dark:text-white_text min-h-0">

                        {/* Content */}
                        <div className="w-4/6 h-100 min-h-0 flex flex-col justify-content-between">
                            <div
                                className="flex flex-col gap-3 h-90 pt-3 pe-2 me-2 text-sm text-black_text dark:text-white_text overflow-y-auto">
                                {/* Type */}
                                <div className="font-light">
                                    <div className="text-black_text dark:text-white_text text-base flex flex-row align-items-center gap-2">
                                        <img src={document.type ? getIcon({ type: document.type }, { darkMode: isDarkMode }) : getIcon("informative", { darkMode: isDarkMode })}
                                            className="w-9" alt={"type_icon"}></img>
                                        <p className="m-0 p-0">{document.type ? document.type.charAt(0).toUpperCase() + document.type.slice(1) : ''}</p>
                                    </div>
                                </div>

                                {/*TODO modify to see only the right stakeholders, it should be an array?
                             if it's only one then there is no need of map*/}
                                {/* Stakeholders*/}
                                {<div className="font-normal flex flex-row gap-3 text-white_text">
                                    {
                                        document.stakeholders ? document.stakeholders.map((stakeholder, index) => {
                                            return (
                                                <div key={index}
                                                    className={`text-center ${getStakeholderColor({ stakeholder: stakeholder })} rounded-2xl py-1 px-3`}>
                                                    <p className="m-0 p-0 text-center">{capitalizeWords(stakeholder)}</p>
                                                </div>
                                            );
                                        }) : ""
                                    }
                                </div>}


                                {/* Title */}
                                <div className="text-2xl font-bold">{document.title}</div>

                                {/* Info */}
                                <div className="flex flex-col font-normal">
                                    {/* Scale */}
                                    <div className="flex flex-row gap-2">
                                        <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Scale:</p>
                                        {document.scale ? document.scale.charAt(0).toUpperCase() + document.scale.slice(1) : ''}
                                        {document.scale === "plan" ? " 1:" + document.planNumber : ""}
                                    </div>
                                    {/* Issuance Date */}
                                    <div className="flex flex-row gap-2">
                                        <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Issuance Date:</p>
                                        {document.date}
                                    </div>
                                    {/* Language */}
                                    <div className="flex flex-row gap-2">
                                        <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Language:</p>
                                        {document.language ? getLanguageName(document.language) : ''}
                                    </div>
                                    {/* Pages */}
                                    <div className="flex flex-row gap-2">
                                        <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Pages:</p>
                                        {document.pages ? document.pages : '-'}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="font-normal text-base">{document.description}</div>
                            </div>
                            {/* Other Buttons */}
                            <div className="flex flex-row gap-3 font-normal pt-3">
                                <button onClick={()=>{props.setUpdateAreaId({areaId:document.areaId,docId:document.id}); navigate("/map"); }}
                                    className="flex flex-row gap-2 align-items-center text-black_text dark:text-white_text text-sm bg-[#76767655] dark:bg-[#a0a0a058] hover:bg-[#FFFFFF55] dark:hover:bg-[#d9d9d974] transition rounded-2xl px-3 py-2 drop-shadow-lg">
                                    <i className="bi bi-globe-europe-africa text-base"></i>
                                    <p className="m-0 p-0">{document.areaId == null ? "Add Georeference" : "Edit Georeference"}</p>
                                </button>
                            </div>
                        </div>

                        {/* Links */}
                        <div
                            className="flex flex-col gap-3 w-2/6 h-full bg-[#FFFFFF22] dark:bg-box_high_opacity rounded-xl py-3 px-4 overflow-y-auto">
                            {/* Tab Header */}
                            <div className="flex">
                                {/* Connections Tab */}
                                <button
                                    className={`flex-1 py-2 text-center ${activeTab === "connections"
                                        ? `text-white-500 text-xl border-b-2 ${isDarkMode ? "border-white" : "border-black"}`
                                        : "text-[#5d5d5db4] dark:text-[#646464] border-b-2 border-transparent"
                                        }`}
                                    onClick={() => setActiveTab("connections")}
                                >
                                    Connections
                                </button>

                                {/* Files Tab */}
                                <button
                                    className={`flex-1 py-2 text-center ${activeTab === "files"
                                        ? `text-white-500 text-xl border-b-2 ${isDarkMode ? "border-white" : "border-black"}`
                                        : "text-[#5d5d5db4] dark:text-[#646464] border-b-2 border-transparent"
                                        }`}
                                    onClick={() => setActiveTab("files")}
                                >
                                    Files
                                </button>
                            </div>

                            {/* Connections */}

                            {activeTab === "connections" ? (
                                documentLinks.length > 0 ?
                                Object.entries(documentLinks.reduce((acc, connection) => {
                                    if (!acc[connection.connection]) {
                                        acc[connection.connection] = [];
                                    }
                                    acc[connection.connection].push(connection);
                                    return acc;
                                }, {})).map(([connectionType, connections], index) => (
                                    <div key={index} className="flex flex-col gap-3 bg-[#76767655] dark:bg-[#D9D9D90E] p-3 rounded-xl">
                                        <div className="flex flex-row justify-between items-center cursor-pointer"
                                            onClick={() => setCollapsedSections(prevState => ({
                                                ...prevState,
                                                [connectionType]: !prevState[connectionType]
                                            }))}>
                                            <h3 className="p-0 m-0 text-black_text dark:text-white_text text-sm">
                                                {connectionType ? formatString(connectionType) : ''}
                                            </h3>
                                            <div className="text-black_text dark:text-white_text text-base right-4 hover:text-gray-400">
                                                <i className={`bi ${collapsedSections[connectionType] ? 'bi-caret-down' : 'bi-caret-up'} text-2xl`}></i>
                                            </div>
                                        </div>
                                        {!collapsedSections[connectionType] && connections.map((connection, idx) => (
                                            <div key={idx} className="flex flex-col gap-1">
                                                <div
                                                    onClick={() => {
                                                        navigate(`/documents/${connection.id}`);
                                                    }}
                                                    className="flex flex-row items-center gap-2 bg-[#FFFFFF77] dark:bg-[#d9d9d947] px-3 py-3 rounded-lg hover:bg-[#d9d9d934] transition cursor-pointer"
                                                >
                                                    <img src={getIcon({ type: connection.type }, { darkMode: isDarkMode })} className="w-7" alt={"type_icon"} />
                                                    <p className="m-0 p-0 text-black_text dark:text-white_text text-base font-normal line-clamp-1">
                                                        {connection.title}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )) : <div className="flex flex-col justify-content-center align-content-center w-full h-full">
                                    <p className="m-0 p-0 text-center text_black_text dark:text-white_text">No Connections</p>
                                    </div>
                            ) : (
                                <>
                                    {
                                        files.length > 0 ?
                                        Object.entries(groupedFiles).map(([fileType, fileGroup], index) => (
                                        <div key={index} className="flex flex-col gap-3 bg-[#76767655] dark:bg-[#D9D9D90E] p-3 rounded-xl">
                                            <div
                                                className="flex flex-row justify-between items-center cursor-pointer"
                                                onClick={() => setCollapsedFileSections(prevState => ({
                                                    ...prevState,
                                                    [fileType]: !prevState[fileType]
                                                }))}
                                            >
                                                <h3 className="p-0 m-0 text-black_text dark:text-white_text text-sm">
                                                    {fileType === "original" ? "Original Document" : "Attachments"}
                                                </h3>
                                                <div className="text-black_text dark:text-white_text text-base right-4 hover:text-gray-400">
                                                    <i className={`bi ${collapsedFileSections[fileType] ? 'bi-caret-down' : 'bi-caret-up'} text-2xl`}></i>
                                                </div>
                                            </div>
                                            {!collapsedFileSections[fileType] && fileGroup.map((file, idx) => (
                                                <FileItem
                                                    key={idx}
                                                    file={file}
                                                    setSelectedFile={setSelectedFile}
                                                    isDarkMode={isDarkMode}
                                                    setShowModalDeleteConfirm={setShowModalDeleteConfirm}
                                                    handleDownload={handleDownload}
                                                    isDropdownOpen={openDropdown == idx} // Passa lo stato per determinare se il dropdown è aperto
                                                    onDropdownToggle={() => handleToggleDropdown(idx)} // Passa la funzione per togglare il dropdown
                                                />
                                            ))}
                                        </div>
                                    )) : <div className="flex flex-col justify-content-center align-content-center w-full h-full">
                                                <p className="m-0 p-0 text-center text_black_text dark:text-white_text">No Files</p>
                                            </div>
                                    }

                                </>
                            )}


                            {/* Bottone in basso a destra */}
                            {activeTab === "connections" ? (
                                <button
                                    onClick={() => {
                                        props.setMode("save");
                                        props.setNavShow(false);
                                        props.setoriginalDocId(id);
                                        navigate("/linkDocuments");
                                    }}
                                    className={`fixed bottom-6 right-6 sm:right-9 bg-[#76767655] dark:bg-[#d9d9d951] ${isDarkMode ? "text-white" : "text-black"} rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:bg-[#d9d9d934] transition-all`}
                                >
                                    <i className="bi bi-pencil-square text-xl"></i>
                                </button>
                            ) :
                                (
                                    <>
                                        <div className="relative">
                                            <button
                                                onClick={toggleDropdown}
                                                className={`fixed bottom-6 right-6 sm:right-9 bg-[#76767655] dark:bg-[#d9d9d951] ${isDarkMode ? 'text-white' : 'text-black'
                                                    } rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:bg-[#d9d9d934] transition-all`}
                                            >
                                                <i className="bi bi-plus-lg text-2xl"></i>
                                            </button>
                                            {modalPlusVisible && (
                                                <div
                                                    className="modal-overlay fixed top-0 left-0 w-full h-full"
                                                    onClick={handleCloseModal} // Chiudi il dropdown cliccando all'esterno
                                                >
                                                    <div
                                                        className={`absolute bottom-16 right-6 sm:right-9 dark:bg-[#4F4F4F] bg-[#cccccc] rounded-lg drop-shadow-lg w-44`}
                                                        onClick={(e) => e.stopPropagation()} // Impedisce che il click dentro il modal lo chiuda
                                                    >
                                                        <div className="flex flex-col w-full">
                                                            <label
                                                                className={`py-2 px-2.5 text-sm
                                                                        ${isDarkMode ? 'text-white' : 'text-black'} 
                                                                        cursor-pointer flex items-center text-left hover:opacity-70 transition`}
                                                                htmlFor="fileInput"  // Associa il label al campo input
                                                            >
                                                                <i className="bi bi-file-earmark-text mr-2"></i> Original
                                                                Documents
                                                            </label>
                                                            <input
                                                                id="fileInput"  // Deve corrispondere al valore di `htmlFor` nel label
                                                                type="file"
                                                                className="hidden"  // Nasconde l'input per farlo apparire solo come un'area cliccabile
                                                                accept=".jpeg, .jpg, .png, .pdf, .svg, .txt"
                                                                onChange={handleFileChangeOriginal} // Gestisci il cambiamento del file
                                                            />
                                                            <div
                                                                className="w-full h-[1px] bg-[#4F4F4F22] dark:bg-[#99999922]"></div>
                                                            <button
                                                                className={`py-2 px-2.5 text-sm                                                  
                                                                        ${isDarkMode ? 'text-white' : 'text-black'} 
                                                                        flex items-center text-left cursor-pointer hover:opacity-70 transition`}
                                                                onClick={() => {
                                                                    console.log("TODO")
                                                                }}
                                                            >
                                                                <i className="bi bi-paperclip mr-2"></i> Attachments
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>

                                )
                            }

                        </div>

                    </div>

                </div>
            </div >
        </>
    );
}


const FileItem = ({ file, isDarkMode, handleDownload, setShowModalDeleteConfirm, setSelectedFile, isDropdownOpen, onDropdownToggle }) => {

    // Chiudi il dropdown quando si clicca fuori
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isDropdownOpen && !e.target.closest('.dropdown') && !e.target.closest('.bi-three-dots-vertical')) {
                onDropdownToggle(); // Chiude il dropdown se clicchi fuori
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen, onDropdownToggle]);

    return (
        <div className="relative flex flex-col gap-1">
            <div
                className="flex flex-row items-center gap-2 bg-[#FFFFFF77] dark:bg-[#d9d9d947] px-3 py-3 rounded-lg hover:bg-[#d9d9d934] transition"
            >
                <img
                    src={getIconByExtension({ fileName: file.name }, { darkMode: isDarkMode })}
                    className="w-7"
                    alt="type_icon"
                />
                <p className="m-0 p-0 text-black_text dark:text-white_text text-base font-normal line-clamp-1">
                    {file.name}
                </p>
                <i
                    className="bi bi-three-dots-vertical cursor-pointer ml-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDropdownToggle(); // Toggle dropdown when clicked
                    }}
                ></i>
            </div>

            {isDropdownOpen && (
                <div
                    className={`absolute right-2 top-8 mt-1 z-10 dark:bg-[#4F4F4F] bg-[#cccccc] rounded-md drop-shadow-lg w-40 transition-all dropdown`}
                    onClick={(e) => e.stopPropagation()} // Prevents modal close on click
                >
                    <div className="flex flex-col w-full rounded-md">
                        <button
                            className={`py-2 px-2.5 text-sm ${isDarkMode ? "text-white" : "text-black"} hover:opacity-70 cursor-pointer flex items-center text-left rounded-t-md transition`}
                            onClick={() => {
                                handleDownload(file);
                                onDropdownToggle(); // Chiude il dropdown dopo l'azione
                            }}
                        >
                            <i className="bi bi-download mr-2"></i> Download
                        </button>
                        <div className="w-full h-[1px] bg-[#4F4F4F22] dark:bg-[#99999922]"></div>
                        <button
                            className={`py-2 px-2.5 text-sm text-my_red flex hover:opacity-70 items-center text-left cursor-pointer rounded-b-md transition`}
                            onClick={() => {
                                console.log(file);
                                setSelectedFile(file);
                                setShowModalDeleteConfirm(true);
                                onDropdownToggle(); // Chiude il dropdown dopo l'azione
                            }}
                        >
                            <i className="bi bi-trash3 mr-2 text-my_red"></i> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};



export { SingleDocument };


const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};