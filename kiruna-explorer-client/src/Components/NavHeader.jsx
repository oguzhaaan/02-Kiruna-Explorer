import { Navbar, Nav, Container, Offcanvas, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";

function NavHeader(props) {
    const { isDarkMode } = useTheme();

    const navigate = useNavigate();
    const location = useLocation();
    const currentRoute = location.pathname;
    const { user, isLoggedIn, logOut } = useUserContext();

    return (
        <div className={`${isDarkMode ? 'dark' : 'light'}`}>
            {!isLoggedIn ?
                props.navShow &&
                <Navbar expand="false" className="fixed z-[2000]">
                    <Container fluid className="text-center w-screen justify-end">
                        <Navbar.Brand className="text-white_text text-xl flex items-center justify-center mt-4 mr-10">
                            <Link to="login" className="text-inherit no-underline hover:text-slate-300" onClick={() => props.setNavShow(false)}>
                                <i className="bi bi-person fs-2 align-middle mx-2"></i>
                                Login
                            </Link>
                        </Navbar.Brand>
                    </Container>
                </Navbar>
                :
                props.navShow &&
                <Navbar expand="false" className="fixed z-[20000]">
                    <Container fluid>
                        <Navbar.Toggle
                            className={`navbar-toggler custom-toggler mt-2.5 ${isDarkMode ? 'text-white_text' : 'text-black_text'}`}
                            aria-controls="basic-navbar-nav"
                        >
                            <span className={`toggler-bar ${isDarkMode ? 'bg-white_text' : 'bg-black_text'}`}></span>
                            <span className={`toggler-bar middle-bar ${isDarkMode ? 'bg-white_text' : 'bg-black_text'}`}></span>
                            <span className={`toggler-bar ${isDarkMode ? 'bg-white_text' : 'bg-black_text'}`}></span>
                        </Navbar.Toggle>
                        <Navbar.Offcanvas
                            id="basic-navbar-nav"
                            className={`drop-shadow-xl ${isDarkMode ? 'bg-background_color text-white_text' : 'bg-background_color_light text-black_text'} overflow-hidden`}
                            backdropClassName={`${isDarkMode ? 'bg-black_text' : 'bg-white_text'}`}
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
                                                    {user.username}
                                                </Col>
                                            </Row>
                                            <Row className="offcanvas-content-small">
                                                <Col className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                                    {user.role}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <div className={`separator ${isDarkMode ? 'bg-white_text' : 'bg-black_text'} opacity-20`}></div>
                                    { user.role === "urban_planner" && (<Row
                                        className={`offcanvas-item w-100 p-1 ${currentRoute.includes("documents") ? (isDarkMode ? 'bg-customBlue' : 'bg-blue-200') : ''}`}
                                        onClick={() => { navigate("/documents") }}
                                    >
                                        <Col xs="auto">
                                            <i className={`bi bi-journals fs-3 align-middle ${isDarkMode ? 'text-white_text' : 'text-black_text'}`}></i>
                                        </Col>
                                        <Col className={`${isDarkMode ? 'text-white_text' : 'text-black_text'} my-auto`}>
                                            Documents
                                        </Col>
                                    </Row>)}
                                    <Row
                                        className={`offcanvas-item w-100 p-1 ${currentRoute.includes("map") ? (isDarkMode ? 'bg-customBlue' : 'bg-blue-200') : ''}`}
                                        onClick={() => { navigate("/mapDocuments")}}
                                    >
                                        <Col xs="auto">
                                            <i className={`bi bi-globe-americas fs-3 align-middle ${isDarkMode ? 'text-white_text' : 'text-black_text'}`}></i>
                                        </Col>
                                        <Col className={`${isDarkMode ? 'text-white_text' : 'text-black_text'} my-auto`}>
                                            Map
                                        </Col>
                                    </Row>
                                    <Row
                                        className={`offcanvas-item w-100 p-1 ${currentRoute.includes("diagram") ? (isDarkMode ? 'bg-customBlue' : 'bg-blue-200') : ''}`}
                                        onClick={() => { }}
                                    >
                                        <Col xs="auto">
                                            <i className={`bi bi-diagram-3 fs-3 align-middle ${isDarkMode ? 'text-white_text' : 'text-black_text'}`}></i>
                                        </Col>
                                        <Col className={`${isDarkMode ? 'text-white_text' : 'text-black_text'} my-auto`}>
                                            Diagram
                                        </Col>
                                    </Row>
                                </div>
                                <div className="offcanvas-content" onClick={() => { logOut(); props.setNavShow(true); }}>
                                    <Row className="offcanvas-item w-100 p-1">
                                        <Col xs="auto">
                                            <i className={`bi bi-door-open-fill fs-3 align-middle ${isDarkMode ? 'text-white_text' : 'text-black_text'}`}></i>
                                        </Col>
                                        <Col className={`${isDarkMode ? 'text-white_text' : 'text-black_text'} my-auto`}>
                                            Logout
                                        </Col>
                                    </Row>
                                </div>
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>
            }
        </div>
    );
}

export { NavHeader };




/*
 <div className={`${isDarkMode ? 'dark' : 'light'}`}>
            {!isLoggedIn ?
                props.navShow &&
                <Navbar expand="false" className="fixed z-[2000]">
                    <Container fluid className="text-center w-screen justify-end">
                        <Navbar.Brand className="text-white_text text-xl flex items-center justify-center mt-4 mr-10">
                            <Link to="login" className="text-inherit no-underline hover:text-slate-300" onClick={() => props.setNavShow(false)}>
                                <i className="bi bi-person fs-2 align-middle mx-2"></i>
                                Login
                            </Link>
                        </Navbar.Brand>
                    </Container>
                </Navbar>
                :
                props.navShow &&
                <Navbar expand="false" className="fixed z-[20000]">
                    <Container fluid>
                        <Navbar.Toggle
                            className="navbar-toggler text-black_text custom-toggler mt-2.5"
                            aria-controls="basic-navbar-nav"
                        >
                            <span className="toggler-bar dark:bg-white_text bg-black_text"></span>
                            <span className="toggler-bar middle-bar dark:bg-white_text bg-black_text"></span>
                            <span className="toggler-bar dark:bg-white_text bg-black_text"></span>
                        </Navbar.Toggle>
                        <Navbar.Offcanvas id="basic-navbar-nav" className="drop-shadow-xl backdrop-blur-2xl bg-navbar_light dark:bg-navbar text-black_text dark:text-white_text overflow-hidden" backdrop={false}>
                            <Offcanvas.Body className="flex flex-col justify-between">
                                <div className="offcanvas-content">
                                    <Row className="mt-10 w-100 p-1">
                                        <Col xs="auto">
                                            <i className="bi bi-person-circle fs-2 align-middle text-black_text dark:text-white_text"></i>
                                        </Col>
                                        <Col>
                                            <Row>
                                                <Col className="text-black_text dark:text-white_text">
                                                    {user.username}
                                                </Col>
                                            </Row>
                                            <Row className="offcanvas-content-small text-gray-800 dark:text-gray-400">
                                                <Col> {user.role}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <div className="separator bg-black_text dark:bg-white_text "></div>
                                    <Row className={`offcanvas-item hover:[#] w-100 p-1 ${currentRoute.includes("documents") ? "bg-customBlue dark:bg-customBlue_dark" : ""}`} onClick={() => { navigate("/documents") }}>
                                        <Col xs="auto">
                                            <i className="bi bi-journals fs-3 align-middle text-black_text dark:text-white_text"></i>
                                        </Col>
                                        <Col className="my-auto text-black_text dark:text-white_text">
                                            Documents
                                        </Col>
                                    </Row>
                                    <Row className={`offcanvas-item w-100 p-1 ${currentRoute.includes("map") ? "bg-customBlue dark:bg-customBlue_dark" : ""}`} onClick={() => { }} >
                                        <Col xs="auto">
                                            <i className="bi bi-globe-americas fs-3 align-middle text-black_text dark:text-white_text"></i>
                                        </Col>
                                        <Col className="my-auto text-black_text dark:text-white_text">
                                            Map
                                        </Col>
                                    </Row>
                                    <Row className={`offcanvas-item w-100 p-1 ${currentRoute.includes("diagram") ? "bg-customBlue dark:bg-customBlue_dark" : ""}`} onClick={() => { }}>
                                        <Col xs="auto">
                                            <i className="bi bi-diagram-3 fs-3 align-middle text-black_text dark:text-white_text"></i>
                                        </Col>
                                        <Col className="my-auto text-black_text dark:text-white_text">
                                            Diagram
                                        </Col>
                                    </Row>
                                </div>
                                <div className="offcanvas-content" onClick={() => { logOut(), props.setNavShow(true) }}>
                                    <Row className="offcanvas-item w-100 p-1">
                                        <Col xs="auto">
                                            <i className="bi bi-door-open-fill fs-3 align-middle text-black_text dark:text-white_text"></i>
                                        </Col>
                                        <Col className="my-auto text-black_text dark:text-white_text">
                                            Logout
                                        </Col>
                                    </Row>
                                </div>
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>
            }
        </div>
*/