import {Navbar,Nav, Container, Offcanvas, Row, Col} from "react-bootstrap"
import { Link } from "react-router-dom"
import { useUserContext } from "../contexts/UserContext"
import { useNavigate } from "react-router-dom";

function NavHeader (props) {

    const navigate = useNavigate();
    const { user, isLoggedIn, logOut } = useUserContext();


    return(
        <>
        {!isLoggedIn ? 
        props.navShow && 
        <Navbar expand="false" className="fixed z-[2000]">
            <Container fluid className="text-center w-screen justify-end">
                <Navbar.Brand className="text-white_text text-2xl flex items-center justify-center mt-4 mr-10">
                    <Link to="login" className="text-inherit no-underline hover:text-slate-300" onClick={()=>props.setNavShow(false)}>
                        <i className="bi bi-person fs-2 align-middle mx-2"></i>
                        Login
                    </Link>
                </Navbar.Brand>
            </Container>
        </Navbar>
        :
        <Navbar expand="false" className="fixed z-[20000]">
          <Container fluid>
            <Navbar.Toggle
                className="navbar-toggler custom-toggler mt-4"
                aria-controls="basic-navbar-nav"
                >
                <span className="toggler-bar"></span>
                <span className="toggler-bar middle-bar"></span>
                <span className="toggler-bar"></span>
            </Navbar.Toggle>
            <Navbar.Offcanvas id="basic-navbar-nav" className="drop-shadow-xl backdrop-blur-2xl bg-navbar text-white_text overflow-hidden" backdrop= {false}>  
                <Offcanvas.Body className="flex flex-col justify-between">
                <div className="offcanvas-content">
                    <Row className="mt-10 w-100 p-1">
                        <Col xs="auto">
                            <i className="bi bi-person-circle fs-2 align-middle"></i>
                        </Col>
                        <Col>
                            <Row>
                                <Col> {user.username}
                                </Col>
                            </Row>
                            <Row className="offcanvas-content-small">
                                <Col> {user.role}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <div className="separator"></div>
                    <Row className="offcanvas-item w-100 p-1"  onClick={() => { navigate("/documents")}}>
                        <Col xs="auto">
                            <i className="bi bi-journals fs-2 align-middle"></i>
                        </Col>
                        <Col className="my-auto">
                            Documents
                        </Col>
                    </Row>
                    <Row className="offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i className="bi bi-globe-americas fs-2 align-middle"></i>
                        </Col>
                        <Col className="my-auto">
                            Map
                        </Col>
                    </Row>
                    <Row className="offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i className="bi bi-diagram-3 fs-2 align-middle"></i>
                        </Col>
                        <Col className="my-auto">
                            Diagram
                        </Col>
                    </Row>
                </div>
                <div className="offcanvas-content" onClick={()=>{logOut(),props.setNavShow(true)}}>
                    <Row className="offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i className="bi bi-door-open-fill fs-2 align-middle"></i>
                        </Col>
                        <Col className="my-auto">
                            Logout
                        </Col>
                    </Row>
                </div>
                </Offcanvas.Body>         
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
        }
        </>
    )
}

export {NavHeader}