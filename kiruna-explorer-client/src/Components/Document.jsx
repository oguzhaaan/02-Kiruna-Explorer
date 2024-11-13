import {useState, useEffect} from "react";
import dayjs from "dayjs";
import "./document.css";
import Alert from "./Alert";
import API from "../API/API.mjs";
import {SingleDocument} from "./SingleDocument.jsx";
import {useNavigate} from "react-router-dom";
import Select from "react-select";
import DocumentClass from "../classes/Document.mjs";
import {useTheme} from "../contexts/ThemeContext.jsx";
import {getStakeholderColor} from "./Utilities/StakeholdersColors";
import {getIcon} from "./Utilities/DocumentIcons";
import { formatString } from "./Utilities/StringUtils.js";


function Document(props) {

    const navigate = useNavigate();

    const { isDarkMode, toggleTheme } = useTheme();

    // --- Update Documents List ---
    const [documents, setDocuments] = useState([]);
    const [refreshList, setRefreshList] = useState(0);
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const allDocuments = await API.getAllDocuments();
                setDocuments(allDocuments);
            } catch (error) {
                console.error("Error in getAllDocuments function:", error.message);
                throw new Error(
                    "Unable to get the documents."
                );
            }
        };
        fetchDocuments();
    }, [refreshList]);

    // --- Handle Fields Changes ---
    const handleFieldChange = (field, value) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            [field]: value
        }));
        if (value && value !== "none") {
            setErrors(prevErrors => {
                const { [field]: removedError, ...remainingErrors } = prevErrors;
                return remainingErrors;
            });
        }
    };

    const handleTitle = (event) => handleFieldChange("title", event.target.value);
    const handleStakeholder = (selectedOptions) => handleFieldChange("stakeholders", selectedOptions || []);
    const handleScale = (event) => handleFieldChange("scale", event.target.value);
    const handlePlanNumber = (event) => handleFieldChange("planNumber", event.target.value);
    const handleDate = (event) => {
        const selectedDate = dayjs(event.target.value).format("YYYY/MM/DD");
        handleFieldChange("date", selectedDate);
    };
    const handleType = (event) => handleFieldChange("type", event.target.value);
    const handleLanguage = (event) => handleFieldChange("language", event.target.value);
    const handleNumber = (event) => handleFieldChange("pages", event.target.value);
    const handleDescription = (event) => handleFieldChange("description", event.target.value);

    // --- Errors ---
    const [errors, setErrors] = useState({});
    const validateFields = () => {
        const newErrors = {
            ...(props.newDocument.title ? {} : { title: "Title is required" }),
            ...(props.newDocument.stakeholders?.length > 0 ? {} : { stakeholder: "At least one stakeholder is required" }),
            ...(props.newDocument.scale && props.newDocument.scale !== "none" ? {} : { scale: "Scale is required" }),
            ...(props.newDocument.scale === "plan" && !props.newDocument.planNumber 
                ? { planNumber: "Plan Number is required for scale 'plan'" } 
                : {}),
            ...(props.newDocument.date ? {} : { date: "Date is required" }),
            ...(props.newDocument.type && props.newDocument.type !== "none" ? {} : { type: "Type is required" }),
            ...(props.newDocument.description ? {} : { description: "Description is required" })
        };
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearErrors = () => {
        setErrors({});
    };

    // --- Submit Form ---
    const handleConfirm = async () => {
        // Refresh the list of the documents
        setRefreshList(prev => prev + 1)
        //CAMPI OPZIONALI: PAGE + LANGUAGE + GIORNO DELLA DATA(?) + COORDINATES
        //CAMPI OBBLIGATORI: TITLE + STAKEHOLDER + SCALE(PLANE NUMBER IN CASE) + DATE + DESCRIPTION + TYPE 


        const documentData = {
            title: props.newDocument.title,
            stakeholder: props.newDocument.stakeholders.map((e) => {
                return e.value;
            }),
            scale: props.newDocument.scale,
            planNumber: props.newDocument.planNumber, // Optional
            date: props.newDocument.date, //day is optional
            type: props.newDocument.type,
            language: props.newDocument.language || null, // Set to null if not provided
            pageNumber: props.newDocument.pages || null, // Set to null if not provided
            description: props.newDocument.description, // Mandatory
            areaId: props.newAreaId,
            links: props.connections.length > 0 ? props.connections : null
        };

        console.log(documentData);

        if (!validateFields()) {
            setAlertMessage(['Please fill all the mandatory fields.', 'error']);
            return;
        }

        try {
            await API.addDocument(documentData);
            setAlertMessage(['Document added successfully!', 'success']);
            props.setnewAreaId(null)
            props.setConnections([])
            resetForm();
            toggleModal();
        } catch (error) {
            console.log(error);
            setAlertMessage([error.message, 'error']);
        }
    }

    // --- others ---
    const [alertMessage, setAlertMessage] = useState(['', '']);
    
    useEffect(() => {
        props.setNavShow(true);
    }, []);


    const toggleModal = () => {
        props.setIsModalOpen(!props.isModalOpen);
        clearErrors();
        resetForm();
    };

    const resetForm = () => {
        props.setNewDocument(new DocumentClass())
    };

    // --- Styles ---
    const customDropdownStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#d9d9d93f' : '#FFFFFFE2', // Sfondo del campo
            borderRadius: '0.375rem', // Bordo arrotondato
            borderColor: 'transparent', // Bordo trasparente
            padding: '0px 5px', // Padding per centrare il testo
            boxShadow: 'none', // Rimuove l'ombra
            cursor: 'pointer',
            fontSize: '1rem',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white', // Testo bianco per leggibilità
            fontSize: '1rem', // Testo uniforme e visibile
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDarkMode ? 'white' : 'black'
        }),
        dropdownIndicator: () => ({
            display: 'none', // Rimuove la freccia predefinita
        }),
        indicatorSeparator: () => ({
            display: 'none', // Rimuove la linea separatrice
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#2b2b2b' : '#FFFFFF', // Sfondo del menu (bianco in modalità chiara)
            borderRadius: '8px', // Bordo arrotondato del menu
            overflow: 'hidden', // Rimuove eventuali scroll imprevisti
            border: '0px solid white',
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0', // Rimuove padding extra
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? isDarkMode
                    ? '#373737a6' // Sfondo opzione selezionata in modalità scura
                    : '#d3d3d3' // Sfondo opzione selezionata in modalità chiara
                : isDarkMode
                    ? '#373737a6' // Sfondo opzione non selezionata in modalità scura
                    : '#FFFFFF', // Sfondo opzione non selezionata in modalità chiara
            cursor: 'pointer',
            fontSize: '0.9rem', // Aumenta la dimensione del testo delle opzioni
            '&:hover': {
                backgroundColor: '#1e90ff', // Colore blu al passaggio del mouse
            },
            color: isDarkMode ? '#F4F4F4' : '#0e0e0e', // Colore del testo
        }),
        multiValue: (provided) => ({
            ...provided,
            marginLeft: '-10px',
            marginRight: '15px'
        }),
    };

    // --- Data ---
    const stakeholderOptions = [
        {value: "lkab", label: "LKAB"},
        {value: "municipality", label: "Municipality"},
        {value: "regional authority", label: "Regional authority"},
        {value: "architecture firms", label: "Architecture firms"},
        {value: "citizens", label: "Citizens"},
        {value: "others", label: "Others"},
    ];

    const popularLanguages = [
        {code: "en", name: "English"},
        {code: "sv", name: "Swedish"},
        {code: "se", name: "Northern Sami"},
        {code: "fi", name: "Finnish"},
        {code: "es", name: "Spanish"},
        {code: "zh", name: "Chinese"},
        {code: "fr", name: "French"},
        {code: "de", name: "German"},
        {code: "ja", name: "Japanese"},
        {code: "ru", name: "Russian"},
        {code: "pt", name: "Portuguese"},
        {code: "ar", name: "Arabic"},
        {code: "it", name: "Italian"},
    ];

    return (
        <div className={isDarkMode ? 'dark' : 'light'}>
            <div className="bg-background_color_white dark:bg-background_color min-h-screen flex flex-col items-center">
                <SingleDocument setNavShow={props.setNavShow} setMode={props.setMode}
                                setoriginalDocId={props.setoriginalDocId}></SingleDocument>
                <Alert message={alertMessage[0]} type={alertMessage[1]}
                       clearMessage={() => setAlertMessage(['', ''])}></Alert>
                <div className="flex flex-row justify-content-between align-items-center w-full h-16 px-3">

                    <div className="flex flex-row items-center ml-14 gap-3">
                        <div className="z-[0] relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black_text">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Search"
                                className="outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color w-60 py-2 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
                            />
                        </div>

                        <button className="text-black_text dark:text-white_text text-2xl">
                            <i className="bi bi-sort-down-alt"></i>
                        </button>
                    </div>

                    <div className="flex flex-row justify-content-end gap-3 align-items-center">
                        <button onClick={toggleModal}
                                className="bg-primary_color_light dark:bg-primary_color_dark hover:bg-[#2E6A8E66] transition text-black_text dark:text-white_text grid justify-items-end py-2 px-4 rounded-md">
                            <span className="text-base"><i className="bi bi-file-earmark-plus"></i> Add document</span>
                        </button>

                        {/* Change Theme Button */}
                        <button
                            className="text-black_text dark:text-white_text grid justify-items-center transition-transform transform hover:scale-105 active:scale-95"
                            onClick={() => {
                                toggleTheme();
                            }}>
                            <div className="flex justify-center items-center gap-2 relative">
                                <i className="bi bi-sun-fill transition-opacity duration-300 ease-in-out text-2xl"
                                   style={{opacity: isDarkMode ? 0.2 : 1}}></i>
                                <i className="bi bi-moon-fill transition-opacity duration-300 ease-in-out text-2xl"
                                   style={{opacity: isDarkMode ? 1 : 0.2}}></i>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Documents List */}
                <div className="flex flex-col gap-3 p-3 w-100">
                    {documents.map((doc) => (
                        <DocumentItem
                            key={doc.id}
                            documentId={doc.id}
                            title={doc.title}
                            type={doc.type}
                            date={doc.date}
                            stakeholders={doc.stakeholders}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </div>
            </div>
            {/* Add Document Form */}
            {
                props.isModalOpen && (
                    <div
                        className={`${isDarkMode ? "dark-select" : "light-select"} py-4 fixed inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit`}
                        onClick={toggleModal}
                    >

                        <div
                            className="bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl w-3/6 px-14 py-10 h-full overflow-y-auto rounded-lg flex flex-col relative scrollbar-thin scrollbar-webkit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-black_text mb-4 dark:text-white_text text-2xl  ">Add New Document</h2>
                            {/* Close Button */}
                            <button onClick={toggleModal}
                                    className="absolute top-5 text-black_text dark:text-white_text right-4 hover:text-gray-600">
                                <i className="bi bi-x-lg text-2xl"></i>
                            </button>
                            {/* Title */}
                            <div className="input-title mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text w-full ml-2 mb-1 text-base text-left">Title<span
                                    className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={props.newDocument.title}
                                    onChange={handleTitle}
                                    className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.title ? 'border-red-500 border-1' : 'focus:border-blue-400 border-1 border-transparent'} focus:outline-none`}
                                />
                            </div>
                            {/* Stakeholders */}
                            <div className="input-stakeholder mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Stakeholders<span
                                    className="text-red-400">*</span></label>
                                <Select
                                    isMulti
                                    options={stakeholderOptions}
                                    value={props.newDocument.stakeholders}
                                    onChange={handleStakeholder}
                                    styles={customDropdownStyles}
                                    placeholder="None"
                                    isClearable={false}
                                    isSearchable={false}
                                    className="select text-black_text"
                                />
                            </div>
                            {/* Scale */}
                            <div className="input-scale mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Scale<span
                                    className="text-red-400">*</span></label>
                                <select
                                    id="document-type"
                                    value={props.newDocument.scale}
                                    onChange={handleScale}
                                    className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.title ? 'border-red-500 border-1' : 'focus:border-blue-400 border-1 border-transparent'} focus:outline-none`}>
                                    <option value="none">None</option>
                                    <option value="text">Text</option>
                                    <option value="concept">Concept</option>
                                    <option value="plan">Plan</option>
                                    <option value="blueprints">Blueprints/effects</option>
                                </select>
                            </div>

                            {props.newDocument.scale === 'plan' &&
                                <div className="input-plan mb-4 w-full">
                                    <label
                                        className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Enter
                                        the scale
                                        1:n</label>
                                    <input
                                        id="number-input"
                                        type="number"
                                        value={props.newDocument.planNumber}
                                        placeholder="n"
                                        onChange={handlePlanNumber}
                                        className={`w-full text-base px-3 py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.title ? 'border-red-500 border-1' : 'focus:border-blue-400 border-1 border-transparent'} focus:outline-none`}>
                                    </input>
                                </div>}
                            {/* Date */}
                            <div className="input-date mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Issuance
                                    date<span className="text-red-400">*</span></label>
                                <input
                                    id="document-date"
                                    type="date"
                                    value={props.newDocument.date}
                                    onChange={handleDate}
                                    className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${isDarkMode ? 'dark-mode' : 'light-mode'} ${errors.title ? 'border-red-500 border-1' : 'focus:border-blue-400 border-1 border-transparent'} focus:outline-none`}
                                />
                            </div>
                            {/* Type */}
                            <div className="input-type mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Type<span
                                    className="text-red-400">*</span></label>
                                <select
                                    id="document-type"
                                    value={props.newDocument.type}
                                    onChange={handleType}
                                    className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.title ? 'border-red-500 border-1' : 'focus:border-blue-400 border-1 border-transparent'} focus:outline-none`}>
                                    <option value="none">None</option>
                                    <option value="design">Design document</option>
                                    <option value="informative">Informative document</option>
                                    <option value="prescriptive">Prescriptive document</option>
                                    <option value="technical">Technical document</option>
                                    <option value="agreement">Agreement</option>
                                    <option value="conflict">Conflict</option>
                                    <option value="consultation">Consultation</option>
                                    <option value="material effects">Material effects</option>
                                </select>
                            </div>
                            {/* Language */}
                            <div className="input-language mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Language</label>
                                <select
                                    id="document-language"
                                    value={props.newDocument.language}
                                    onChange={handleLanguage}
                                    className="w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md focus:border-blue-400 border-1 border-transparent focus:outline-none">
                                    <option value="">None</option>
                                    {popularLanguages.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Pages */}
                            <div className="input-number mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Pages</label>
                                <input
                                    id="number-input"
                                    type="number"
                                    value={props.newDocument.pages}
                                    placeholder="Select a number"
                                    onChange={handleNumber}
                                    className="w-full text-base px-3 py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md focus:border-blue-400 border-1 border-transparent :outline-none">
                                </input>
                            </div>
                            {/* Description */}
                            <div className="input-description mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Description<span
                                    className="text-red-400">*</span></label>
                                <textarea
                                    placeholder="Description"
                                    value={props.newDocument.description}
                                    onChange={handleDescription}
                                    className={`w-full p-2 px-3 py-2 text-base text-text-black_text dark:text-white_text border-gray-300 placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark  ${errors.title ? 'border-red-500 border-1' : 'focus:border-blue-400 border-1 border-transparent'} focus:outline-none`}
                                    rows="4"
                                ></textarea>
                            </div>
                            {/* Georeference */}
                            <div className="input-map mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Georeference</label>
                                {
                                    props.newAreaId &&
                                    <label className="text-black_text dark:text-white_text text-base w-full text-left py-1"><i
                                        className="bi bi-check-lg align-middle text-green-400"></i> You
                                        selected {props.newAreaId === 1 ? "Municipality Area" : `Area N. ${props.newAreaId}`}
                                    </label>
                                }
                                <button
                                    onClick={() => {
                                        navigate("/map")
                                    }}
                                    className="w-full p-2 text-white_text dark:text-black_text text-base border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] hover:bg-[#000000] dark:hover:bg-customGray1 :transition rounded-md">
                                    <i className="bi bi-globe-europe-africa"></i> Open the Map
                                </button>
                            </div >
                            {/* Linking */}
                            <div className="input-link mb-4 w-full">
                                <label
                                    className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Linking</label>
                                {
                                    props.connections && props.connections.length > 0 &&
                                    <p className="m-0 px-2 py-1 text-gray-500">{(props.connections.length) + " connections selected"}</p>
                                }
                                <button
                                    onClick={() => {
                                        props.setNavShow(false);
                                        props.setMode("return");
                                        navigate("/linkDocuments");
                                    }}
                                    className="w-full p-2 text-white_text dark:text-black_text text-base border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] hover:bg-[#000000] dark:hover:bg-customGray1 :transition rounded-md"> Select
                                    Documents to Link
                                </button>
                            </div>
                            {/* Save Button */}
                            <button
                                className="bg-primary_color_light dark:bg-primary_color_dark w-full hover:bg-[#2E6A8E66] transition  text-lg dark:text-white_text text-black_text py-2 px-4 rounded-lg mt-4"
                                onClick={handleConfirm}>
                                Confirm
                            </button>
                        </div >
                    </div >
                )
            }
        </div>
    );
}

const DocumentItem = ({
                          documentId,
                          title,
                          type,
                          date,
                          stakeholders = [],
                          isDarkMode
                      }) => {
    const navigate = useNavigate()
    return (
        <div className={isDarkMode ? "dark" : "light"}>
            <div
                className={`flex flex-wrap drop-shadow-xl rounded-xl bg-document_item_radient_grey_light dark:bg-document_item_radient_grey p-3 cursor-pointer`}
                onClick={() => {
                    navigate(/documents/ + documentId)
                }}
            >
                {/* Document Title and Type */}
                <div className="w-1/2 flex flex-row text-black_text dark:text-white_text">

                    <div>
                        <div className="text-base mb-3 font-normal">{formatString(title)}</div>
                        <div className="text-sm font-light flex items-center">
                            <img src={getIcon({type: type}, {darkMode: isDarkMode})} className="w-8 mr-2"
                                 alt="type_icon"/>
                            {formatString(type)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-1/2 justify-content-between align-items-end">
                    {/* Date */}
                    <div className="text-sm top-3 right-5 text-gray-400">{date}</div>

                    {/* Stakeholders */}
                    <div className="flex flex-wrap gap-2 bottom-4 right-5">
                        {stakeholders && stakeholders.map((stakeholder, idx) => (
                            <span
                                key={idx}
                                className={`rounded-2xl px-3 py-1 text-sm text-white_text ${getStakeholderColor(
                                    {stakeholder}
                                )}`}
                            >
            {formatString(stakeholder)}
          </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export {Document};
