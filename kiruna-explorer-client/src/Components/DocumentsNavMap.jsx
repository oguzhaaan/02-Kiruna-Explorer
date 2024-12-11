import { Navbar, Nav, Container, Offcanvas, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useEffect, useState } from "react";

function DocumentsNavMap({clickedAreas, setAreaSelected}) {
    const { isDarkMode, toggleTheme, isSatelliteMap } = useTheme();
    const [isCanvasOpen, setIsCanvasOpen] = useState(false)

    const navigate = useNavigate();
    const location = useLocation();
    const currentRoute = location.pathname;
    const { user, isLoggedIn, logOut, handleVisitor, isVisitorLoggedIn } = useUserContext();

    {/*TODO Get all documents that has an area id*/ }

    return (
        <div className={`${isDarkMode ? 'dark' : 'light'}`}>
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
                        className={`drop-shadow-xl ${isDarkMode ? 'bg-background_color text-white_text' : 'bg-[#f6f6f6] text-black_text'} z-[20000] overflow-hidden`}
                        backdropClassName={`${isDarkMode ? 'bg-black_text' : 'bg-white_text'}`}
                        backdrop={false}
                    >
                        <Offcanvas.Body className="flex flex-col justify-between">
                            <div className="offcanvas-content">
                                <Row className="mt-10 w-100 p-1">
                                    <Col xs="auto">
                                        <i className={`bi bi-person-circle fs-2 align-middle ${isDarkMode ? 'text-white_text' : 'text-black_text'}`}></i>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Col className={`${isDarkMode ? 'text-white_text' : 'text-black_text'}`}>
                                                {isVisitorLoggedIn ? "Visitor" : user.username}
                                            </Col>
                                        </Row>
                                        <Row className="offcanvas-content-small">
                                            <Col className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                                {isVisitorLoggedIn ? "guest" : user.role}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <div className={`separator ${isDarkMode ? 'bg-white_text' : 'bg-black_text'} opacity-20`}></div>

                                <Row
                                    className={`offcanvas-item w-100 p-1 ${currentRoute.includes("documents") ? (isDarkMode ? 'bg-customBlue' : 'bg-blue-200') : ''}`}
                                    onClick={() => { {/*TODO clicking the doc simply highlight it in the map -> setAreaSelected(doc.areaid)*/} }}
                                >
                                    {/*TODO add search navbar*/}
                                    {/*TODO document selected are going to be visualize in the top (use clickedAreas dictionary for that -> see in props)*/} 
                                    {/*TODO add list of documents that have an area but are not selected*/}
                                    {/*Use pagination so that you can copy the already existing code*/}
                                </Row>

                            </div>
                            {/* Close Button */}
                            <div className="absolute top-0 right-0 mt-3 mr-4">
                                <button
                                    className={`${isDarkMode ? 'text-white_text' : 'text-black_text'} justify-items-center hover:opacity-50`}
                                    onClick={() => { setIsCanvasOpen(false) }}
                                >
                                    <div>
                                        <i
                                            className="bi bi-x-lg fs-4"
                                        ></i>
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