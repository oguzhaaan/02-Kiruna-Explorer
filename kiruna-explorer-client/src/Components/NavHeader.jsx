import {Navbar,Nav, Container, Offcanvas, Row, Col} from "react-bootstrap"

function NavHeader () {

    return(
        <Navbar expand="false" className="">
          <Container fluid>
            <Navbar.Toggle
                className="navbar-toggler custom-toggler"
                aria-controls="basic-navbar-nav"
                >
                <span className="toggler-bar"></span>
                <span className="toggler-bar middle-bar"></span>
                <span className="toggler-bar"></span>
            </Navbar.Toggle>
            <Navbar.Offcanvas id="basic-navbar-nav" className="navbar-bg drop-shadow-xl">  
                <Offcanvas.Body>
                <div className="offcanvas-content">
                    <Row className="mt-5 offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i class="bi bi-person-circle fs-2 align-middle"></i>
                        </Col>
                        <Col>
                            <Row>
                                <Col> Username
                                </Col>
                            </Row>
                            <Row className="offcanvas-content-small">
                                <Col> Role
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <div className="separator"></div>
                    <Row className="offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i class="bi bi-journals fs-2 align-middle"></i>
                        </Col>
                        <Col className="my-auto">
                            Documents
                        </Col>
                    </Row>
                    <Row className="offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i class="bi bi-globe-americas fs-2 align-middle"></i>
                        </Col>
                        <Col className="my-auto">
                            Map
                        </Col>
                    </Row>
                    <Row className="offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i class="bi bi-diagram-3 fs-2 align-middle"></i>
                        </Col>
                        <Col className="my-auto">
                            Diagram
                        </Col>
                    </Row>
                    <Row className="offcanvas-footer offcanvas-item w-100 p-1">
                        <Col xs="auto">
                            <i class="bi bi-door-open-fill fs-2 align-middle"></i>
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
    )
}

export {NavHeader}