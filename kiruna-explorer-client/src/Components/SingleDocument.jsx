import { useState, useEffect } from "react";
import { useFetcher, useNavigate, useParams } from "react-router-dom";

import informativeIcon from "../assets/informative.svg";
import { Charging } from "./Charging.jsx";
import { getIcon, getIconByExtension } from "./Utilities/DocumentIcons.jsx";
import { getStakeholderColor } from "./Utilities/StakeholdersColors.jsx";
import { getLanguageName } from "./Utilities/Languages.jsx";
import API from "../API/API.mjs";
import { useTheme } from "../contexts/ThemeContext.jsx";

function SingleDocument(props) {

    const { isDarkMode } = useTheme();

    const [collapsedSections, setCollapsedSections] = useState({});
    const [collapsedFileSections, setCollapsedFileSections] = useState({});
    const [document, setDocument] = useState({});
    const [documentLinks, setDocumentLinks] = useState([]);
    const [isCharging, setIsCharging] = useState(false);
    const [modalPlusVisible, setModalPlusVisible] = useState(false);

    //upload a new file
    const [fileType, setFileType] = useState(''); // Tipo di file (documento originale o allegato)
    const [selectedFile, setSelectedFile] = useState(null);


    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Ottieni il primo file selezionato
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !fileType) {
            alert('Please select a file and file type.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('fileType', fileType);



        console.log(formData.get('file'));

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('File uploaded successfully!');
                handleCloseModal(); // Chiudi il modal dopo l'upload
            } else {
                alert('Error uploading file.');
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Error uploading file.');
        }
    };

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
            // Download logic goes here
        }
    };

    const handleDelete = (file) => {
        if (file) {
            console.log('Deleting:', file.name);
            // Delete logic goes here
        }
    };

    //files management
    const [activeTab, setActiveTab] = useState("connections"); // Stato per gestire le schede
    const [files, setFiles] = useState(
        [
            {
                "name": "name.txt",
                "type": "original",
                "path": "path/to/file"
            },
            {
                "name": "name.pdf",
                "type": "original",
                "path": "path/to/file"
            },
            {
                "name": "name.css",
                "type": "original",
                "path": "path/to/file"
            },
            {
                "name": "name.svg",
                "type": "original",
                "path": "path/to/file"
            },
            {
                "name": "name.png",
                "type": "original",
                "path": "path/to/file"
            },
            {
                "name": "name.jpg",
                "type": "original",
                "path": "path/to/file"
            },
            {
                "name": "NoeeMoltoLungoLunghissimoMbareTroppoLungo.jpeg",
                "type": "original",
                "path": "path/to/file"
            },
        ]
    );

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

    /*  useEffect(() => {
          const getFiles = async () => {
              try {
                  const fileData = await API.getDocumentFiles(id); // Aggiungi un'API per i file
                  setFiles(fileData);
              } catch (error) {
                  console.error(error);
              }
          };
          if (id) getFiles();
      }, [id]);
      */

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
        id && <div className={`${isDarkMode ? 'dark' : 'light'} fixed inset-0 z-[200] flex items-center justify-center scrollbar-thin scrollbar-webkit`}>

            <div
                className="bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl w-11/12 py-3 px-4 h-5/6 overflow-none rounded-2xl flex flex-col gap-3 items-center relative scrollbar-thin scrollbar-webkit">

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
                            <button
                                className="flex flex-row gap-2 align-items-center text-black_text dark:text-white_text text-sm bg-[#76767655] dark:bg-[#a0a0a058] hover:bg-[#FFFFFF55] dark:hover:bg-[#d9d9d974] transition rounded-2xl px-3 py-2 drop-shadow-lg">
                                <i className="bi bi-globe-europe-africa text-base"></i>
                                <p className="m-0 p-0">See on the map</p>
                            </button>
                        </div>
                    </div>

                    {/* Links */}
                    <div
                        className="flex flex-col gap-3 w-2/6 h-100 bg-[#FFFFFF22] dark:bg-box_high_opacity rounded-xl py-3 px-4 overflow-y-auto">
                        {/* Tab Header */}
                        <div className="flex">
                            {/* Connections Tab */}
                            <button
                                className={`flex-1 py-2 text-center ${activeTab === "connections"
                                    ? `text-white-500 text-xl border-b-2 ${isDarkMode ? "border-white" : "border-black"}`
                                    : "text-[#5d5d5db4] dark:text-[#5D5D5D] border-b-2 border-transparent"
                                    }`}
                                onClick={() => setActiveTab("connections")}
                            >
                                Connections
                            </button>

                            {/* Files Tab */}
                            <button
                                className={`flex-1 py-2 text-center ${activeTab === "files"
                                    ? `text-white-500 text-xl border-b-2 ${isDarkMode ? "border-white" : "border-black"}`
                                    : "text-[#5d5d5db4] dark:text-[#5D5D5D] border-b-2 border-transparent"
                                    }`}
                                onClick={() => setActiveTab("files")}
                            >
                                Files
                            </button>
                        </div>


                        {/* Connections */}
                        {activeTab === "connections" ? (
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
                            ))
                        ) : (
                            <>
                                {Object.entries(groupedFiles).map(([fileType, fileGroup], index) => (
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
                                                isDarkMode={isDarkMode}
                                                handleDownload={handleDownload}
                                                handleDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                ))}

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
                                                    className={`absolute bottom-16 right-6 sm:right-9 ${isDarkMode ? 'dark:bg-[#4F4F4F]' : 'bg-[#76767655]'
                                                        } rounded-lg shadow-lg w-44`}
                                                    onClick={(e) => e.stopPropagation()} // Impedisce che il click dentro il modal lo chiuda
                                                >
                                                    <div className="flex flex-col w-full">
                                                        <button
                                                            className={`py-1 px-2 text-sm border-b-[0.0001rem] 
                                                                        ${isDarkMode ? 'border-white' : 'border-black'} 
                                                                        ${isDarkMode ? 'dark:bg-[#4F4F4F]' : 'bg-[#76767655]'} 
                                                                        ${isDarkMode ? 'text-white' : 'text-black'} 
                                                                        cursor-pointer flex items-center text-left`}
                                                            onClick={() => {
                                                                setFileType('attachment')
                                                            }}
                                                        >
                                                            <i className="bi bi-file-earmark-text mr-2"></i> Original Documents
                                                        </button>
                                                        {fileType && (
                                                            <div className="py-2 px-3">
                                                                <input
                                                                    type="file"
                                                                    onChange={handleFileChange}
                                                                    className="w-full text-sm"
                                                                />
                                                            </div>
                                                        )}
                                                        {/* Bottone per caricare il file */}
                                                        {fileType && selectedFile && (
                                                            <div className="flex justify-between mt-3">
                                                                <button
                                                                    onClick={handleFileUpload}
                                                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                                                                >
                                                                    Upload
                                                                </button>
                                                            </div>
                                                        )}
                                                        <button
                                                            className={`py-1 px-2 text-sm 
                                                                        ${isDarkMode ? 'dark:bg-[#4F4F4F]' : 'bg-[#76767655]'} 
                                                                        ${isDarkMode ? 'text-white' : 'text-black'} 
                                                                        flex items-center text-left cursor-pointer`}
                                                            onClick={handleDelete}
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
    );
}

const FileItem = ({ file, isDarkMode, handleDownload, handleDelete }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // Handle dropdown toggle
    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownVisible(!dropdownVisible);
    };

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
                    onClick={toggleDropdown}
                ></i>
            </div>

            {dropdownVisible && (
                <div
                    className={`absolute right-3 top-full mt-1 z-10 ${isDarkMode ? "dark:bg-[#4F4F4F]" : "bg-[#76767655]"
                        } rounded-lg shadow-lg w-40 transition-all`}
                    onClick={(e) => e.stopPropagation()} // Prevents modal close on click
                >
                    <div className="flex flex-col w-full">
                        <button
                            className={`py-1 px-2 text-sm border-b-[0.0001rem] ${isDarkMode ? "border-white" : "border-black"
                                } ${isDarkMode ? "dark:bg-[#4F4F4F]" : "bg-[#76767655]"
                                } ${isDarkMode ? "text-white" : "text-black"} cursor-pointer flex items-center text-left`}
                            onClick={() => {
                                handleDownload(file);
                                setDropdownVisible(false);
                            }}
                        >
                            <i className="bi bi-download mr-2"></i> Download
                        </button>
                        <button
                            className={`py-1 px-2 text-sm ${isDarkMode ? "dark:bg-[#4F4F4F]" : "bg-[#76767655]"
                                } text-[#E63232] flex items-center text-left cursor-pointer`}
                            onClick={() => {
                                handleDelete(file);
                                setDropdownVisible(false);
                            }}
                        >
                            <i className="bi bi-trash3 mr-2 text-[#E63232]"></i> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileItem;
export { SingleDocument };