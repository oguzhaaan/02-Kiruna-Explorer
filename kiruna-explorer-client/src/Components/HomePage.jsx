import { Row, Col, Container, Button } from "react-bootstrap";

function HomePage(props) {
    return (
        <>



            {/* Header Content */}
            <div className="flex-col flex bg-cover bg-center  text-white_text h-5/12 w-full" style={{
                backgroundImage:
                    "url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Kiruna.jpg/2560px-Kiruna.jpg')",
            }}>
                <div className="absolute inset-0 bg-black opacity-70"></div>

                <div className="m-10  ml-52 relative  w-3/12">
                    <div className="text-6xl font-black">KIRUNA <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Kiruna_vapen.svg"
                        alt="sweden-flag"
                        width="60"
                        height="50"
                        className="inline-block"
                    /> </div>
                    <div className="text-6xl font-black">EXPLORER</div>
                    <div className="font-serif text-xl mt-3  text-center font-thin border-3 p-2 max-w-fit rounded-full">
                        A place to discover the story of Kiruna
                    </div>

                </div>
            </div>


            {/* Middle Section */}
            <div className="flex flex-col relative text-white_text bg-black w-screen h-96">
                <div className="flex flex-col items-center m-10">
                    <div className="text-white_text text-2xl self-start ml-[calc(50%-38.5rem)]">
                        What would you like to view?
                    </div>
                    <div className="bottoni flex flex-row justify-center mt-10 gap-10">
                        <div className="bottone">
                            <div className="w-96 h-52 text-center items-center justify-center flex flex-col bg-[#2E2E2E] rounded-md">
                                <i className="bi bi-diagram-3 text-6xl"></i>
                                <div className="text-2xl">Diagram</div>
                                <div className="text-sm m-2 text-[#989898]">
                                    See a visual representation of documents and their interconnections.
                                </div>
                            </div>
                        </div>
                        <div className="bottone">
                            <div className="w-96 h-52 text-center items-center justify-center flex flex-col bg-[#2E2E2E] rounded-md">
                                <i className="bi bi-globe-europe-africa text-6xl"></i>
                                <div className="text-2xl">Map</div>
                                <div className="text-sm m-2 text-[#989898]">
                                    Visualize documents on the map to understand their territorial relationships.
                                </div>
                            </div>
                        </div>
                        <div className="bottone">
                            <div className="w-96 h-52 text-center items-center justify-center flex flex-col bg-[#2E2E2E] rounded-md">
                                <i className="bi bi-journals text-6xl"></i>
                                <div className="text-2xl">Documents</div>
                                <div className="text-sm m-2 text-[#989898]">
                                    Browse and filter documents. Add New.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section*/}
            <div className="flex flex-col text-[#cccaca] text-center bg-[#181818a9] h-full">
                <p>
                    Kiruna Explorer
                    <br />
                    © 2024 Group 02
                    <br />
                    This application is licensed under the Creative Commons
                    Attribution-NonCommercial 4.0 International License. You are free
                    to share and adapt this work for non-commercial purposes, provided
                    you give appropriate credit to the original author.
                </p>

            </div>

        </>
    );
}

export { HomePage };