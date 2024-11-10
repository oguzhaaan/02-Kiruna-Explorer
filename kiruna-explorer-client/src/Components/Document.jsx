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

function Document(props) {

    const {isDarkMode, toggleTheme} = useTheme();

    useEffect(() => {
        props.setNavShow(true);
    }, []);

    //className={`w-full px-3 text-xl py-2 text-white bg-input_color rounded-[40px] ${errors.scale ? 'border-red-500 border-1' : ''}`}>


    const customDropdownStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#d9d9d93f' : '#FFFFFFE2',     // Sfondo del campo
            borderRadius: '0.375rem',         // Bordo arrotondato come richiesto
            borderColor: 'transparent',        // Bordo attivo se selezionato
            padding: '0px 5px',               // Padding interno per centrare il testo
            boxShadow: 'none',                // Rimozione ombra
            cursor: 'pointer',
            fontSize: '1rem',

        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',                   // Testo bianco per leggibilità
            fontSize: '1rem',                 // Testo uniforme e visibile
        }),
        placeholder: (provided) => ({
            ...provided,
        }),
        dropdownIndicator: () => ({
            display: 'none',                  // Rimuove la freccia predefinita
        }),
        indicatorSeparator: () => ({
            display: 'none',                  // Rimuove la linea separatrice
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#2b2b2b',       // Sfondo opaco per il menu
            borderRadius: '10px',             // Bordo arrotondato del menu
            marginTop: '8px',                 // Spazio tra campo e menu
            padding: '0',                     // Rimuove padding extra
            overflow: 'hidden',               // Rimuove eventuali scroll imprevisti
            border: ' 0px solid white'
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0',                     // Rimuove padding extra

        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#373737a6' : '#373737a6',  // Sfondo opzione selezionata
            cursor: 'pointer',
            fontSize: '1rem',                 // Aumenta la dimensione del testo delle opzioni
            '&:hover': {
                backgroundColor: '#1e90ff',   // Colore blu al passaggio del mouse
            },
            color: isDarkMode ? '#F4F4F4' : '#0e0e0e',
        }),
        multiValue: (provided) => ({
            ...provided,
            borderRadius: '0.375rem',              // Bordi arrotondati per il tag
            padding: '7px 7px',               // Padding per rendere i tag più "pillole"
            margin: '10px 5px',
        }),
    };

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

    const [alertMessage, setAlertMessage] = useState(['', '']);

    const [errors, setErrors] = useState({});

    const validateFields = () => {
        const newErrors = {};
        if (!props.newDocument.title) newErrors.title = "Title is required";
        if (props.newDocument.stakeholders.length === 0) newErrors.stakeholder = "At least one stakeholder is required";
        if (props.newDocument.scale === "none") newErrors.scale = "Scale is required";
        if (props.newDocument.scale === "plan" && !props.newDocument.planNumber) newErrors.planNumber = "Plan Number is required for scale 'plan'";
        if (!props.newDocument.date) newErrors.date = "Date is required";
        if (props.newDocument.type === "none") newErrors.type = "Type is required";
        if (!props.newDocument.description) newErrors.description = "Description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleModal = () => {
        props.setIsModalOpen(!props.isModalOpen);
        clearErrors();
        resetForm();
    };

    const handleTitle = (event) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            title: event.target.value
        }));

        if (event.target.value) {
            setErrors((prevErrors) => {
                const {title, ...remainingErrors} = prevErrors;
                return remainingErrors;
            });
        }
    };

    const handleStakeholder = (selectedOptions) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            stakeholders: selectedOptions || []
        }));

        if (selectedOptions.length > 0) {
            setErrors((prevErrors) => {
                const {stakeholder, ...remainingErrors} = prevErrors;
                return remainingErrors;
            });
        }
    };

    const handleScale = (event) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            scale: event.target.value
        }));

        if (event.target.value !== "none") {
            setErrors((prevErrors) => {
                const {scale, ...remainingErrors} = prevErrors;
                return remainingErrors;
            });
        }
    };

    const handlePlanNumber = (event) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            planNumber: event.target.value
        }));

        if (event.target.value) {
            setErrors((prevErrors) => {
                const {planNumber, ...remainingErrors} = prevErrors;
                return remainingErrors;
            });
        }
    };

    const handleDate = (event) => {
        const selectedDate = dayjs(event.target.value).format("YYYY-MM-DD");
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            date: selectedDate
        }));

        if (selectedDate) {
            setErrors((prevErrors) => {
                const {date, ...remainingErrors} = prevErrors;
                return remainingErrors;
            });
        }
    };

    const handleType = (event) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            type: event.target.value
        }));

        if (event.target.value !== "none") {
            setErrors((prevErrors) => {
                const {type, ...remainingErrors} = prevErrors;
                return remainingErrors;
            });
        }
    };

    const handleLanguage = (event) => {
        const selectedLanguage = event.target.value;
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            language: selectedLanguage
        }));
    };

    const handleNumber = (event) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            pages: event.target.value
        }));
    };

    const handleDescription = (event) => {
        props.setNewDocument(prevDoc => ({
            ...prevDoc,
            description: event.target.value
        }));

        if (event.target.value) {
            setErrors((prevErrors) => {
                const {description, ...remainingErrors} = prevErrors;
                return remainingErrors;
            });
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    const handleConfirm = async () => {

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

    const resetForm = () => {

        props.setNewDocument(new DocumentClass())
    };
    const navigate = useNavigate();

    return (
        <div className={isDarkMode ? 'dark' : 'light'}>
            <div className="bg-background_color_white dark:bg-background_color min-h-screen flex flex-row justify-center">
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

                        <button
                            className="bg-[#2E6A8E] justify-items-end text-black_text dark:text-white_text py-2 px-5 rounded-md"
                            onClick={() => {
                                navigate("/documents/1")
                            }}>
                            document
                        </button>
                    </div>
                </div>
            </div>

            {props.isModalOpen && (
                <div className={`${isDarkMode ? "dark-select" : "light-select"} py-4 fixed inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit`}>

                    <div
                        className="bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl w-3/6 p-6 h-full overflow-y-auto rounded-lg flex flex-col items-center relative scrollbar-thin scrollbar-webkit">
                        <h2 className="text-black_text dark:text-white_text text-xl font-bold ">Add New Document</h2>
                        <button onClick={toggleModal}
                                className="absolute top-5 text-black_text dark:text-white_text right-4 hover:text-gray-600">
                            <i className="bi bi-x-lg text-2xl"></i>
                        </button>

                        <div className="input-title mb-4 w-full">
                            <label className="text-black_text dark:text-white_text w-full ml-2 mb-1 text-base text-left">Title*</label>
                            <input
                                type="text"
                                placeholder="Title"
                                value={props.newDocument.title}
                                onChange={handleTitle}
                                className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.title ? 'border-red-500 border-1' : ''}`}
                            />
                        </div>

                        <div className="input-stakeholder mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Stakeholders*</label>
                            <Select
                                isMulti
                                options={stakeholderOptions}
                                value={props.newDocument.stakeholders}
                                onChange={handleStakeholder}
                                classNamePrefix="react-select"
                                styles={customDropdownStyles}
                                placeholder="None"
                                isClearable={false}
                                isSearchable={false}
                                className="select text-black_text"
                            />
                        </div>

                        <div className="input-scale mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Scale*</label>
                            <select
                                id="document-type"
                                value={props.newDocument.scale}
                                onChange={handleScale}
                                className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.scale ? 'border-red-500 border-1' : ''}`}>
                                <option value="none">None</option>
                                <option value="text">Text</option>
                                <option value="concept">Concept</option>
                                <option value="plan">Plan</option>
                                <option value="blueprints">Blueprints/effects</option>
                            </select>
                        </div>

                        {props.newDocument.scale === 'plan' &&
                            <div className="input-plan mb-4 w-full">
                                <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Enter the scale
                                    1:n</label>
                                <input
                                    id="number-input"
                                    type="number"
                                    value={props.newDocument.planNumber}
                                    placeholder="n"
                                    onChange={handlePlanNumber}
                                    className={`w-full text-base px-3 py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.planNumber ? 'border-red-500 border-1' : ''}`}>
                                </input>
                            </div>}

                        <div className="input-date mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Issuance
                                date*</label>
                            <input
                                id="document-date"
                                type="date"
                                value={props.newDocument.date}
                                onChange={handleDate}
                                className={`w-full px-3 text-base py-2 text-placeholder_color text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md  ${errors.date ? 'border-red-500 border-1' : ''}`}>
                            </input>
                        </div>

                        <div className="input-type mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Type*</label>
                            <select
                                id="document-type"
                                value={props.newDocument.type}
                                onChange={handleType}
                                className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.type ? 'border-red-500 border-1' : ''}`}>
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

                        <div className="input-language mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Language</label>
                            <select
                                id="document-language"
                                value={props.newDocument.language}
                                onChange={handleLanguage}
                                className="w-full px-3 text-base py-2 text-placeholder_color text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md">
                                <option value="">None</option>
                                {popularLanguages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="input-number mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Pages</label>
                            <input
                                id="number-input"
                                type="number"
                                value={props.newDocument.pages}
                                placeholder="Select a number"
                                onChange={handleNumber}
                                className="w-full text-base px-3 py-2 text-placeholder_color text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md">
                            </input>
                        </div>

                        <div className="input-description mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Description*</label>
                            <textarea
                                placeholder="Description"
                                value={props.newDocument.description}
                                onChange={handleDescription}
                                className={`w-full p-2 px-3 py-2 text-base text-text-black_text dark:text-white_text border-gray-300 placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark ${errors.description ? 'border-red-500 border-1' : ''}`}
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="input-map mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Georeference</label>
                            {props.newAreaId && <label className="text-black_text dark:text-white_text text-base w-full text-left py-1"><i
                                className="bi bi-check-lg align-middle text-green-400"></i> You
                                selected {props.newAreaId === 1 ? "Municipality Area" : `Area N. ${props.newAreaId}`}
                            </label>}
                            <button
                                onClick={() => {
                                    navigate("/map")
                                }}
                                className="w-full p-2 text-base text-white_text dark:text-black_text border border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] rounded-md">
                                <i className="bi bi-globe-europe-africa"></i> Open the Map
                            </button>
                        </div>

                        <div className="input-link mb-4 w-full">
                            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">Linking</label>
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
                                className="w-full p-2 text-white_text dark:text-black_text border text-base border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] rounded-md"> Select
                                Documents to Link
                            </button>
                        </div>

                        {/* Save button */}
                        <button
                            className="bg-primary_color_dark w-full font-bold text-lg text-white_text py-2 px-4 rounded-lg mt-4"
                            onClick={handleConfirm}>
                            Confirm
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

export {Document};
