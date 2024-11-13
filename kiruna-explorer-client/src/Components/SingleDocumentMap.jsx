import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Charging } from "./Charging.jsx";
import { getIcon } from "./Utilities/DocumentIcons.jsx";
import { getStakeholderColor } from "./Utilities/StakeholdersColors.jsx";
import { getLanguageName } from "./Utilities/Languages.jsx";
import API from "../API/API.mjs";
import {useTheme} from "../contexts/ThemeContext.jsx";

function SingleDocumentMap({id, setShowSingleDocument}) {

    const {isDarkMode} = useTheme();

    const [collapsedSections, setCollapsedSections] = useState({});
    const [document, setDocument] = useState({});
    const [documenLinks, setDocumentLinks] = useState([]);
    const [isCharging, setIsCharging] = useState(false);
    const navigate = useNavigate();

    useEffect( () => {
        const getDoc = async () => {
            try {
                setIsCharging(true)
                const d = await API.getDocumentById(id)
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
        if (id) getDoc()
    }, [id])

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    {/*TODO adding API to get all document linked to document with specific id*/ }
    useEffect(() => {
        const getLinks = async () => {
            try {
                const links  = await API.getDocuemntLinks(id) // [{link1}, {link2}]
                console.log(links)
                setDocumentLinks(links)
            } catch (error) {
                console.error(error)
            }
        }
        if (id) getLinks()
        
    }, [id])
   

    function formatString(input) {
        return input
            .replace(/_/g, ' ') // Replace underscores with spaces
            .split(' ') // Split the string into an array of words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join the words back into a single string
    }

    return (
        id && <div className={`${isDarkMode ? 'dark' : 'light'} fixed inset-0 z-[200000] flex items-center justify-center scrollbar-thin scrollbar-webkit`}>

            <div
                className="bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl w-11/12 py-3 px-4 h-5/6 overflow-none rounded-2xl flex flex-col gap-3 items-center relative scrollbar-thin scrollbar-webkit">

                {/* Charging */}
                {isCharging && <Charging></Charging>}

                {/* NavBar (X + back) */}
                <div className="w-100 flex flex-row justify-content-end">
                    <button onClick={() => {
                        setShowSingleDocument(false);
                    }} className="text-black_text dark:text-white_text text-base right-4 hover:text-gray-600">
                        <i className="bi bi-x-lg text-2xl"></i>
                    </button>
                </div>

                {/* Content + Links */}
                <div className="flex flex-row w-100 h-100 text-black_text dark:text-white_text min-h-0">

                    {/* Content */}
                    <div className="w-4/6 h-100 min-h-0 flex flex-col justify-content-between">
                        <div
                            className="flex flex-col gap-3 h-90 pt-3 pe-2 me-2 text-sm text-black_text dark:text-white_text overflow-y-auto">
                            {/* Type */}
                            <div className="font-light">
                                <div className="text-black_text dark:text-white_text text-base flex flex-row align-items-center gap-2">
                                    <img src={document.type ? getIcon({ type: document.type}, {darkMode: isDarkMode }) : getIcon("informative", {darkMode: isDarkMode})}
                                        className="w-9" alt={"type_icon"}></img>
                                    <p className="m-0 p-0">{document.type ? document.type.charAt(0).toUpperCase() + document.type.slice(1) : ''}</p>
                                </div>
                            </div>

                            {/*TODO modify to see only the right stakeholders, it should be an array?
                             if it's only one then there is no need of map*/}
                            {/* Stakeholders*/}
                            {<div className="font-normal flex flex-row gap-3 text-white_text">
                                {
                                    document.stakeholders ? document.stakeholders.map((stakeholder, index) => {
                                        return (
                                            <div key={index}
                                                className={`text-center ${getStakeholderColor({ stakeholder: stakeholder })} rounded-2xl py-1 px-3`}>
                                                <p className="m-0 p-0 text-center">{capitalizeWords(stakeholder)}</p>
                                            </div>
                                        );
                                    }) : ""
                                }
                            </div>}


                            {/* Title */}
                            <div className="text-2xl font-bold">{document.title}</div>

                            {/* Info */}
                            <div className="flex flex-col font-normal">
                                {/* Scale */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Scale:</p>
                                    {document.scale ? document.scale.charAt(0).toUpperCase() + document.scale.slice(1) : ''}
                                    {document.scale === "plan" ? " 1:" + document.planNumber : ""}
                                </div>
                                {/* Issuance Date */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Issuance Date:</p>
                                    {document.date}
                                </div>
                                {/* Language */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Language:</p>
                                    {document.language ? getLanguageName(document.language) : ''}
                                </div>
                                {/* Pages */}
                                <div className="flex flex-row gap-2">
                                    <p className="m-0 p-0 text-customGray1 dark:text-text_gray">Pages:</p>
                                    {document.pages ? document.pages : '-'}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="font-normal text-base">{document.description}</div>
                        </div>
                        {/* Other Buttons */}
                        <div className="flex flex-row gap-3 font-normal pt-3">
                            <button
                                className="flex flex-row gap-2 align-items-center text-black_text dark:text-white_text text-sm bg-[#76767655] dark:bg-[#D9D9D90E] hover:bg-[#FFFFFF55] dark:hover:bg-[#D9D9D933] transition rounded-2xl px-3 py-2 drop-shadow-lg">
                                <p className="m-0 p-0">Original Document</p>
                            </button>
                        </div>
                    </div>

                    {/* Links */}
                    <div
                        className="flex flex-col gap-3 w-2/6 h-100 bg-[#FFFFFF22] dark:bg-box_high_opacity rounded-xl py-3 px-4 overflow-y-auto">
                        {/* NavBar */}
                        <div className="flex flex-row justify-content-between align-items-center">
                            <p className="m-0 p-0 text-xl font-bold">Connections</p>
                        </div>

                        <div className="w-full h-[2px] bg-[#C3C3C3CC] dark:bg-[#79797980]">

                        </div>
                        {/* Connections */}
                        {Object.entries(documenLinks.reduce((acc, connection) => {
                            if (!acc[connection.connection]) {
                                acc[connection.connection] = [];
                            }
                            acc[connection.connection].push(connection);
                            return acc;
                        }, {})).map(([connectionType, connections], index) => (
                            <div key={index} className="flex flex-col gap-3 bg-[#FFFFFF33] dark:bg-[#D9D9D90E] p-3 rounded-xl">
                                <div className="flex flex-row justify-content-between align-items-center cursor-pointer"
                                    onClick={() => setCollapsedSections(prevState => ({
                                        ...prevState,
                                        [connectionType]: !prevState[connectionType]
                                    }))}
                                >
                                    <h3 className="p-0 m-0 text-black_text dark:text-white_text text-sm">{connectionType ? formatString(connectionType) : ''}</h3>
                                    <div
                                        className="text-black_text dark:text-white_text text-base right-4 hover:text-gray-400">
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
                                            className="flex flex-row align-items-center gap-2 bg-[#FFFFFF77] dark:bg-box_high_opacity px-3 py-3 rounded-lg hover:bg-[#D9D9D950] transition cursor-pointer">
                                            <img src={getIcon({type : connection.type}, {darkMode: isDarkMode})} className="w-7" alt={"type_icon"}></img>
                                            <p className="m-0 p-0 text-black_text dark:text-white_text text-base font-normal line-clamp-1">{connection.title}</p>
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

export { SingleDocumentMap };