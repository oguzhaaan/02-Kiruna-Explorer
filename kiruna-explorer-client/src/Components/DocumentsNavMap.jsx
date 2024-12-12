import { Navbar, Nav, Container, Offcanvas, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useEffect, useState } from "react";
import API from "../API/API.mjs";
import { getIcon } from "./Utilities/DocumentIcons.jsx";

function DocumentsNavMap({ clickedAreas, setAreaSelected, clickedDocs, setClickedDocs, handleDocumentClick, setAreaCounts }) {
    const { isDarkMode, toggleTheme, isSatelliteMap } = useTheme();
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const currentRoute = location.pathname;
    const { user, isLoggedIn, logOut, handleVisitor, isVisitorLoggedIn } = useUserContext();

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
                    <Navbar.Toggle
                        aria-controls="basic-navbar-nav"
                        onClick={() => setIsCanvasOpen(true)}
                    >
                        <i className="bi bi-file-text fs-2 dark:text-white_text"></i>
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
                            <div className="offcanvas-content">
                                {/* Search Bar */}
                                <div className="z-[0] relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black_text">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color lg:md:w-72 sm:w-48 py-2 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {/* Selected Documents */}
                                {documents
                                    .filter((document) => clickedDocs[document.id])
                                    .map((document) => (
                                        <div
                                            key={document.id}
                                            className={`w-100 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 cursor-pointer rounded-lg p-2 flex justify-start ${isDarkMode
                                                    ? "bg-document_item_radient_blue"
                                                    : "bg-document_item_radient_blue_light"
                                                }`}
                                            onClick={() => handleDocumentClick(document)}
                                        >
                                            <img
                                                src={getIcon(
                                                    { type: document.type.toLowerCase() },
                                                    { darkMode: isDarkMode }
                                                )}
                                                className="w-8 mr-2"
                                                alt="type_icon"
                                            />
                                            <span className="font-sans">{document.title}</span>
                                        </div>
                                    ))}
                                {/* Separator */}
                                {Object.values(clickedDocs).some((value) => value) &&
                                    Object.values(clickedDocs).some((value) => !value) && (
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
                                            className={`w-100 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 cursor-pointer rounded-lg p-2 flex justify-start ${isDarkMode
                                                    ? "bg-document_item_radient_grey"
                                                    : "bg-[#ffffffdd]"
                                                }`}
                                            onClick={() => handleDocumentClick(document)}
                                        >
                                            <img
                                                src={getIcon(
                                                    { type: document.type.toLowerCase() },
                                                    { darkMode: isDarkMode }
                                                )}
                                                className="w-8 mr-2"
                                                alt="type_icon"
                                            />
                                            <span className="font-sans">{document.title}</span>
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
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </div>
    );
}

export { DocumentsNavMap };
