import {Row, Col, Container} from "react-bootstrap"

function HomePage(props) {

    return(
        <>
        <Container fluid
        className="place-content-center text-center w-screen h-screen bg-cover bg-center"
        style={{
          backgroundImage:"url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Kiruna.jpg/2560px-Kiruna.jpg')",
        }}>
            <div>
                
            </div>
            <div className="absolute inset-0 bg-black opacity-80"></div>

            <div className="relative text-white_text">
            <Row className="text-8xl font-black p-4">
                <Col>
                    KIRUNA EXPLORER
                </Col>
            </Row>
            <Row className="font-serif text-5xl font-thin p-4 border-3 rounded-full mx-auto max-w-fit ">
                <Col>
                    A place to discover the story of Kiruna
                </Col>
            </Row>
            <Row className="flex justify-center mt-4">
                <Col xs="auto">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flag_of_Sweden.svg/2560px-Flag_of_Sweden.svg.png" alt="sweden-flag" width="80" height="50"></img>
                </Col>
            </Row>
            </div>
        </Container>
        </>
    )

}

export {HomePage}