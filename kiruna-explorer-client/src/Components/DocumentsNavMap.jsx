import { Navbar, Nav, Container, Offcanvas, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useEffect, useState } from "react";
import API from "../API/API.mjs";

function DocumentsNavMap({ clickedAreas, setAreaSelected }) {
    const { isDarkMode, toggleTheme, isSatelliteMap } = useTheme();
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const currentRoute = location.pathname;
    const { user, isLoggedIn, logOut, handleVisitor, isVisitorLoggedIn } = useUserContext();

    const [documents, setDocuments] = useState([]);
    const [clickedDocs, setClickedDocs] = useState({});
    const [areaCounts, setAreaCounts] = useState({});

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
    }, []);

    const handleDocumentClick = (doc) => {
        const { id, areaId } = doc;
        const wasClicked = clickedDocs[id];
        const newClickedState = !wasClicked;

        setClickedDocs((prev) => ({
            ...prev,
            [id]: newClickedState,
        }));

        setAreaCounts((prev) => {
            const currentCount = prev[areaId] || 0;
            const newCount = newClickedState ? currentCount + 1 : currentCount - 1;

            // Toggle area if a 0 <-> 1 transition occurs
            if (
                (currentCount === 0 && newCount === 1) ||
                (currentCount === 1 && newCount === 0)
            ) {
                setAreaSelected(areaId);
            }

            return {
                ...prev,
                [areaId]: Math.max(newCount, 0),
            };
        });
    };

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
                                            className="w-100 bg-document_item_radient_blue_light dark:bg-document_item_radient_blue rounded-lg p-1 flex justify-between"
                                            onClick={() => handleDocumentClick(document)}
                                        >
                                            <span className="font-sans">{document.title}</span>
                                            <span className="font-sans font-light text-sm">
                                                {document.type}
                                            </span>
                                        </div>
                                    ))}
                                {/* Available Documents */}
                                {documents
                                    .filter((document) => !clickedDocs[document.id])
                                    .filter((document) => document.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((document) => (
                                        <div
                                            key={document.id}
                                            className="w-100 bg-[#ffffffdd] dark:bg-document_item_radient_grey rounded-lg p-1 flex justify-between"
                                            onClick={() => handleDocumentClick(document)}
                                        >
                                            <span className="font-sans">{document.title}</span>
                                            <span className="font-sans font-light text-sm">
                                                {document.type}
                                            </span>
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
