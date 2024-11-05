import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import informativeIcon from "../assets/informative.svg";
import { Charging } from "./Charging.jsx";
import { getIcon } from "./Utilities/DocumentIcons.jsx";
import { getStakeholderColor } from "./Utilities/StakeholdersColors.jsx";
import { getLanguageName } from "./Utilities/Languages.jsx";
import API from "../API/API.mjs";

function SingleDocument(props) {
    const [collapsedSections, setCollapsedSections] = useState({});
    const [document, setDocument] = useState({});
    const [isCharging, setIsCharging] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getDoc = async () => {
            try {
                setIsCharging(true)
                const d = await API.getDocumentById(id)
                console.log(d)
                if (d !== false) {
                    // Simulate loading time
                    setTimeout(() => {
                        setDocument(d)
                        setIsCharging(false)
                    }, 1000)

                }
                else {
                    navigate("/documents")
                }
            }
            catch (err) {
                navigate("/documents")
                console.log(err)
            }
        }
        getDoc()
    }, [id])

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    {/*TODO adding API to get all document linked to document with specific id*/ }
    const documentlink = {
        connections: [
            {
                id: 2,
                title: "Compilation of responses “So what the people of Kiruna think?” (15)",
                type: "Informative Document",
                connection: "Direct Consequence"
            }, {
                id: 3,
                title: "Compilation of responses “So what the people of Kiruna think?” (15)",
                type: "Informative Document",
                connection: "Collateral Consequence"
            }, {
                id: 4,
                title: "Compilation of responses “So what the people of Kiruna think?” (15)",
                type: "Informative Document",
                connection: "Projection"
            }, {
                id: 5,
                title: "Compilation of responses “So what the people of Kiruna think?” (15)",
                type: "Informative Document",
                connection: "Update"
            }, {
                id: 6,
                title: "Compilation of responses “So what the people of Kiruna think?” (15)",
                type: "Informative Document",
                connection: "Update"
            }
        ]
    };

    return (
        id && <div className="fixed inset-0 z-[200] flex items-center justify-center scrollbar-thin scrollbar-webkit">

            <div
                className="bg-box_color backdrop-blur-2xl drop-shadow-xl w-11/12 py-3 px-4 h-5/6 overflow-none rounded-2xl flex flex-col gap-3 items-center relative scrollbar-thin scrollbar-webkit">

                {/* Charging */}
                {isCharging && <Charging></Charging>}

                {/* NavBar (X + back) */}
                <div className="w-100 flex flex-row justify-content-between">
                    <button onClick={() => {
                        navigate(-1);
                    }} className="text-white text-xl right-4 hover:text-gray-600">
                        <i className="bi bi-arrow-left text-3xl"></i>
                    </button>
                    <button onClick={() => {
                        navigate("/documents");
                    }} className="text-white text-xl right-4 hover:text-gray-600">
                        <i className="bi bi-x-lg text-3xl"></i>
                    </button>
                </div>

                {/* Content + Links */}
                <div className="flex flex-row w-100 h-100 text-white_text min-h-0">

                    {/* Content */}
                    <div className="w-4/6 h-100 min-h-0 flex flex-col justify-content-between">
                        <div
                            className="flex flex-col gap-3 h-90 pt-3 pe-2 me-2 text-lg text-white_text overflow-y-auto">
                            {/* Type */}
                            <div className="font-light">
                                <div className="text-white text-xl flex flex-row align-items-center gap-3">
                                    <img src={document.type ? getIcon({type: document.type}) : getIcon("informative")}
                                        className="w-12" alt={"type_icon"}></img>
                                    <p className="m-0 p-0">{document.type ? document.type.charAt(0).toUpperCase() + document.type.slice(1) : ''}</p>
                                </div>
                            </div>

                            {/*TODO modify to see only the right stakeholders, it should be an array?
                             if it's only one then there is no need of map*/}
                            {/* Stakeholders*/}
                            {<div className="font-normal flex flex-row gap-3">
                                {
                                    document.stakeholders ? document.stakeholders.map((stakeholder, index) => {
                                        return (
                                            <div key={index}
                                                className={`text-center ${getStakeholderColor({ stakeholder: stakeholder })} rounded-2xl py-1 px-3`}>
                                                <p className="m-0 p-0 text-center mb-1">{capitalizeWords(stakeholder)}</p>
                                            </div>
                                        );
                                    }) : ""
                                }
                            </div>}


                            {/* Title */}
                            <div className="text-4xl font-bold">{document.title}</div>

                            {/* Info */}
                            <div className="flex flex-col font-normal">
                                {/* Scale */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-text_gray">Scale:</p>
                                    {document.scale ? document.scale.charAt(0).toUpperCase() + document.scale.slice(1) : ''}
                                    {document.scale === "plan" ? " 1:" + document.planNumber : ""}
                                </div>
                                {/* Issuance Date */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-text_gray">Issuance Date:</p>
                                    {document.date}
                                </div>
                                {/* Language */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-text_gray">Language:</p>
                                    {document.language ? getLanguageName(document.language) : ''}
                                </div>
                                {/* Pages */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-text_gray">Pages:</p>
                                    {document.pages ? document.pages : '-'}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="font-normal">{document.description}</div>
                        </div>
                        {/* Other Buttons */}
                        <div className="flex flex-row gap-3 font-normal pt-3">
                            <button
                                className="flex flex-row gap-2 align-items-center text-white_text text-lg bg-[#D9D9D90E] hover:bg-[#D9D9D933] transition rounded-2xl px-3 py-2 drop-shadow-lg">
                                <i className="bi bi-globe-europe-africa text-xl"></i>
                                <p className="m-0 p-0">See on the map</p>
                            </button>
                            <button
                                className="flex flex-row gap-2 align-items-center text-white_text text-lg bg-[#D9D9D90E] hover:bg-[#D9D9D933] transition rounded-2xl px-3 py-2 drop-shadow-lg">
                                <p className="m-0 p-0">Original Document</p>
                            </button>
                        </div>
                    </div>

                    {/* Links */}
                    <div
                        className="flex flex-col gap-3 w-2/6 h-100 bg-box_high_opacity rounded-xl py-3 px-4 overflow-y-auto">
                        {/* NavBar */}
                        <div className="flex flex-row justify-content-between align-items-center">
                            <p className="m-0 p-0 text-2xl font-bold">Connections</p>

                            <button onClick={() => {
                            }} className="text-white_text text-xl right-4 hover:text-gray-400">
                                <i className="bi bi-plus-circle-fill text-4xl"></i>
                            </button>
                        </div>

                        <div className="w-full h-[2px] bg-[#79797980]">

                        </div>
                        {/* Connections */}
                        {Object.entries(documentlink.connections.reduce((acc, connection) => {
                            if (!acc[connection.connection]) {
                                acc[connection.connection] = [];
                            }
                            acc[connection.connection].push(connection);
                            return acc;
                        }, {})).map(([connectionType, connections], index) => (
                            <div key={index} className="flex flex-col gap-3 bg-[#D9D9D90E] p-3 rounded-xl">
                                <div className="flex flex-row justify-content-between align-items-center cursor-pointer"
                                    onClick={() => setCollapsedSections(prevState => ({
                                        ...prevState,
                                        [connectionType]: !prevState[connectionType]
                                    }))}
                                >
                                    <h3 className="p-0 m-0 text-white_text text-lg">{connectionType}</h3>
                                    <div
                                        className="text-white_text text-xl right-4 hover:text-gray-400">
                                        <i className={`bi ${collapsedSections[connectionType] ? 'bi-caret-down' : 'bi-caret-up'} text-2xl`}></i>
                                    </div>
                                </div>
                                {!collapsedSections[connectionType] && connections.map((connection, idx) => (
                                    <div key={idx} className={"flex flex-col gap-1"}
                                        onClick={() => {
                                            //add click event to navigate to the document
                                        }}
                                    >
                                        <div
                                            onClick={() => {
                                                navigate(`/documents/${connection.id}`);
                                            }}
                                            className="flex flex-row gap-2 bg-box_high_opacity px-3 py-4 rounded-lg hover:bg-[#D9D9D950] transition cursor-pointer">
                                            <img src={getIcon(connection.type)} className="w-8" alt={"type_icon"}></img>
                                            <p className="m-0 p-0 text-white_text text-lg font-normal line-clamp-1">{connection.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export { SingleDocument };