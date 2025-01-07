import { useEffect } from "react";
import { useUserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

function HomePage(props) {

    const { user, isLoggedIn } = useUserContext();

    const navigate = useNavigate();

    useEffect(() => {
        // When the component mounts
        props.setIsHomePage(true);
        return () => {
            // When the component unmounts
            props.setIsHomePage(false);
        };
    }, []);

    return (
        <div className="h-full w-full min-h-screen flex flex-col justify-content-between bg-black">
            {/* Header Content */}
            <div
                className="flex flex-col justify-content-center bg-cover bg-center text-white_text h-[28rem] w-full px-[10%]"
                style={{
                    backgroundImage:
                        "url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Kiruna.jpg/2560px-Kiruna.jpg')",
                }}>
                <div className="z-[200] w-[20.5rem]">
                    <div className="text-6xl font-black">KIRUNA <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Kiruna_vapen.svg"
                        alt="sweden-flag"
                        width="60"
                        height="50"
                        className="inline-block"
                    /></div>
                    <div className="text-6xl font-black">EXPLORER</div>
                    <div
                        className="font-serif text-[1rem] mt-3  text-center font-thin border-3 p-2 w-full rounded-full">
                        A place to discover the story of Kiruna
                    </div>

                </div>
                

                <div className="absolute inset-0 bg-black opacity-80 h-[28rem]"></div>
            </div>

            <div className="flex flex-col px-[10%] mt-4 w-full h-full">
            <div className="text-md text-white w-full bg-gradient-to-r from-[#333333] to-[#555555] p-6 rounded-lg shadow-lg flex flex-row">
                <div className="w-1/2">
                    <h2 className="font-bold mb-2 text-2xl">Discover Kiruna</h2>
                    <p>Kiruna is a charming town with a population of 20,000. Established in the early 20th century, it thrives around Europe's largest iron ore mine, operated by the renowned state-owned company, LKAB.</p>
                    <br/>
                    <p>Explore Kiruna with the Kiruna Explorer! This intuitive platform allows you to delve into development plans, technical documents, and city planning resources effortlessly. Navigate through a user-friendly map and timeline diagram to access all these features seamlessly.</p>
                    </div>
                <div className="w-1/2 flex justify-content-end">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/tBeTpJUX_DI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>

            </div>
            {/* Middle Section */}
            <div className="flex flex-col text-white_text px-[10%] pb-4 w-full h-full bg-black">
               
                <div className="bottoni flex flex-row justify-content-between mt-10 w-full gap-10">
                    <div className="w-1/3 hover:opacity-70 transition">
                        <div
                            role="button"
                            onClick={() => { navigate("/diagram") }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') navigate("/diagram");
                            }}
                            className="h-52 text-center items-center justify-center flex flex-col bg-[#2E2E2E] rounded-md cursor-pointer">
                            <i className="bi bi-diagram-3 text-6xl"></i>
                            <div className="text-2xl">Diagram</div>
                            <div className="text-sm m-2 text-[#989898]">
                                See a visual representation of documents and their interconnections.
                            </div>
                        </div>
                    </div>
                    <div className="w-1/3 hover:opacity-70 transition">
                        <div
                            role="button"
                            onClick={() => { navigate("/mapDocuments") }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') navigate("/mapDocuments");
                            }}
                            className="h-52 text-center items-center justify-center flex flex-col bg-[#2E2E2E] rounded-md cursor-pointer">
                            <i className="bi bi-globe-europe-africa text-6xl"></i>
                            <div className="text-2xl">Map</div>
                            <div className="text-sm m-2 text-[#989898]">
                                Visualize documents on the map to understand their territorial relationships.
                            </div>
                        </div>
                    </div>
                    {(isLoggedIn && user.role === "urban_planner") ?
                        <div className="w-1/3 hover:opacity-70 transition">
                            <div
                                role="button"
                                onClick={() => { navigate("/documents") }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') navigate("/documents");
                                }}
                                className="h-52 text-center items-center justify-center flex flex-col bg-[#2E2E2E] rounded-md cursor-pointer">
                                <i className="bi bi-journals text-6xl"></i>
                                <div className="text-2xl">Documents</div>
                                <div className="text-sm m-2 text-[#989898]">
                                    Browse and filter documents. Add New.
                                </div>
                            </div>
                        </div>
                        :
                        <div className="w-1/3">
                            <div
                                className="h-52 text-center items-center justify-center flex flex-col bg-[#2E2E2E] opacity-50 rounded-md">
                                <i className="bi bi-journals text-6xl"></i>
                                <div className="text-2xl">Documents</div>
                                <div className="text-sm m-2 text-[#989898]">
                                    Browse and filter documents. Add New.
                                    <br />
                                    (Only for Urban Planners)
                                </div>
                            </div>
                        </div>}
                </div>
            </div>

            {/* Footer Section*/}
            <div className="flex flex-col text-[#777777] text-center bg-[#181818] h-full py-5 px-3">
                <p className="m-0 p-0">
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

        </div>
    );
}

export { HomePage };

HomePage.propTypes = {
    setIsHomePage: PropTypes.func.isRequired,

}
