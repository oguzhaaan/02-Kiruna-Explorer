import { Navbar, Container, Offcanvas } from "react-bootstrap";
import { useUserContext } from "../contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useEffect, useState } from "react";
import API from "../API/API.mjs";
import { getIcon } from "./Utilities/DocumentIcons.jsx";
import PropTypes from 'prop-types';


function DocumentsNavMap({ clickedDocs, handleDocumentClick, setShowDiagramDoc }) {
    const { isDarkMode } = useTheme();
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const { isLoggedIn } = useUserContext();

    const AddDocumentButton = () => {
        return (
            <div
                title={"Add Document"}
                className={`rounded-full h-12 w-12 fixed bottom-4 right-4 ${isDarkMode ? " bg-[#333333]" : "bg-white"} flex items-center justify-center shadow-md`}
                role="button" // Adds button role for better accessibility
                aria-label={"Add Document"}
                onClick={() => {
                    navigate("/documents", { state: {open: true} })
                }}
            >
                <i className={`bi bi-plus text-[2rem]  ${isDarkMode ? "text-white_text" : "text-black_text"} `}></i>
            </div>
        );
    };
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);

    // --- Search ---
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const allDocuments = await API.getAllDocuments();
                const documentsWithArea = allDocuments.filter(
                    (document) => document.areaId != null
                );
                setDocuments(documentsWithArea);
            } catch (err) {
                console.error("Error fetching documents:", err.message);
            }
        };
        fetchDocuments();
    }, [clickedDocs]);


    return (
        <div className={isDarkMode ? "dark" : "light"}>
            <Navbar expand="false" className={`fixed top-20 z-[1000]`}>
                <Container fluid>
                    <div
                        className="bg-background_color_light dark:bg-background_color rounded-md h-12 w-12 absolute z-[-1] ml-1"></div>
                    <Navbar.Toggle
                        aria-controls="basic-navbar-nav"
                        onClick={() => setIsCanvasOpen(true)}
                    >
                        <i className="bi bi-file-text fs-2 text-black_text dark:text-white_text"></i>
                    </Navbar.Toggle>
                    <Navbar.Offcanvas
                        show={isCanvasOpen}
                        id="basic-navbar-nav"
                        className={`drop-shadow-xl ${isDarkMode
                            ? "bg-background_color text-white_text"
                            : "bg-[#f6f6f6] text-black_text"
                            } z-[20000] overflow-hidden`}
                        backdropClassName={`${isDarkMode ? "bg-black_text" : "bg-white_text"
                            }`}
                        backdrop={false}
                    >
                        <Offcanvas.Body className="flex flex-col justify-between">
                            <div className="offcanvas-content mb-6">
                                {/* Search Bar */}
                                <div className="z-[0] relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black_text">
                                        <i className="bi bi-search fs-5"></i>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="text-xl outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color lg:md:w-72 sm:w-48 py-0.5 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                    {/* Selected Documents */}
                                    {
                                        documents
                                            .filter((document) => clickedDocs[document.id])
                                            .map((document) => (
                                                <div
                                                    key={document.id}
                                                    className={`w-full h-fit transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 cursor-pointer rounded-lg p-2 flex justify-start items-center ${isDarkMode
                                                        ? "bg-document_item_radient_blue"
                                                        : "bg-document_item_radient_blue_light"
                                                        }`}
                                                >
                                                    <div role="button" className="w-5/6 flex flex-row"
                                                        onClick={() => handleDocumentClick(document)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') handleDocumentClick(document);
                                                        }}
                                                        title="deselect document area">
                                                        <img
                                                            src={getIcon(
                                                                { type: document.type.toLowerCase() },
                                                                { darkMode: isDarkMode }
                                                            )}
                                                            className="w-8 mr-2"
                                                            alt="type_icon"
                                                        />
                                                        <span className="font-sans text-base">{document.title}</span>
                                                    </div>
                                                    <div
                                                        role="button"
                                                        key={document.id}
                                                        className={`w-1/6 h-fit transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 cursor-pointer rounded-2xl p-2 flex justify-center ${isDarkMode
                                                            ? "bg-document_item_radient_blue"
                                                            : "bg-document_item_radient_blue_light"
                                                            }`}
                                                        onClick={() => {
                                                            setShowDiagramDoc(document.id);
                                                            navigate("/diagram");
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') { setShowDiagramDoc(document.id); navigate("/diagram"); }
                                                        }}
                                                        title="see document in the diagram"
                                                    >
                                                        <button><i className="bi bi-diagram-3"></i></button>
                                                    </div>

                                                </div>
                                            ))
                                    }
                                    {/* Separator */}
                                    {Object.values(clickedDocs).some((value) => value) && (
                                        <div
                                            className={`separator w-full ${isDarkMode ? "bg-white_text" : "bg-black_text"
                                                } opacity-20`}
                                        />
                                    )}

                                    {/* Available Documents */}
                                    {documents
                                        .filter((document) => !clickedDocs[document.id])
                                        .filter((document) =>
                                            document.title
                                                .toLowerCase()
                                                .includes(searchQuery.toLowerCase())
                                        )
                                        .map((document) => (
                                            <div
                                                key={document.id}
                                                className={`flex-row w-full h-fit transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 cursor-pointer rounded-lg p-2 flex justify-start items-center ${isDarkMode
                                                    ? "bg-document_item_radient_grey"
                                                    : "bg-[#ffffffdd]"
                                                    }`}
                                            >
                                                <div className="w-5/6 flex flex-row"
                                                    role="button"
                                                    onClick={() => handleDocumentClick(document)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') { handleDocumentClick(document); }
                                                    }}
                                                    title="highlight document area">
                                                    <img
                                                        src={getIcon(
                                                            { type: document.type.toLowerCase() },
                                                            { darkMode: isDarkMode }
                                                        )}
                                                        className="w-8 mr-2"
                                                        alt="type_icon"
                                                    />
                                                    <span className="font-sans text-base">{document.title}</span>
                                                </div>

                                                <div
                                                    key={document.id}
                                                    role="button"
                                                    className={`w-1/6 h-fit transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 cursor-pointer rounded-2xl p-2 flex justify-center ${isDarkMode
                                                        ? "bg-document_item_radient_grey"
                                                        : "bg-[#ffffffdd]"
                                                        }`}
                                                    onClick={() => {
                                                        setShowDiagramDoc(document.id)
                                                        navigate("/diagram")
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') { setShowDiagramDoc(document.id); navigate("/diagram"); }
                                                    }}
                                                    title="see document in the diagram"
                                                >
                                                    <button><i className="bi bi-diagram-3"></i></button>
                                                </div>

                                            </div>
                                        ))}
                            </div>
                            {/* Close Button */}
                            <div className="absolute top-0 right-0 mt-3 mr-4">
                                <button
                                    className={`${isDarkMode ? "text-white_text" : "text-black_text"
                                        } justify-items-center hover:opacity-50`}
                                    onClick={() => {
                                        setIsCanvasOpen(false);
                                    }}
                                >
                                    <div>
                                        <i className="bi bi-x-lg fs-4"></i>
                                    </div>
                                </button>
                            </div>
                        </Offcanvas.Body>
                        <AddDocumentButton></AddDocumentButton>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </div >
    );
}

export { DocumentsNavMap };

DocumentsNavMap.propTypes = {
    clickedDocs: PropTypes.object.isRequired, // Tipo array, obbligatorio
    handleDocumentClick: PropTypes.func.isRequired, // Tipo funzione, obbligatorio
    setShowDiagramDoc: PropTypes.func.isRequired, // Tipo funzione, obbligatorio
};
