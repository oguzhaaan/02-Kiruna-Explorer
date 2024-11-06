import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "./document.css";
import Alert from "./Alert";
import API from "../API/API.mjs";
import { SingleDocument } from "./SingleDocument.jsx";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import DocumentClass from "../classes/Document.mjs";

function Document(props) {

    console.log("Connections:\n");
    console.log(props.connections);

    useEffect(() => {
        props.setNavShow(true);
    }, []);

    //className={`w-full px-3 text-xl py-2 text-white bg-input_color rounded-[40px] ${errors.scale ? 'border-red-500 border-1' : ''}`}>


    const customDropdownStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#d9d9d93f',     // Sfondo del campo
            borderRadius: '40px',             // Bordo arrotondato come richiesto
            borderColor: 'transparent',        // Bordo attivo se selezionato
            padding: '0px 5px',               // Padding interno per centrare il testo
            boxShadow: 'none',                // Rimozione ombra
            minHeight: '48px',                // Altezza minima
            cursor: 'pointer',
            fontSize: '20px',

        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',                   // Testo bianco per leggibilità
            fontSize: '16px',                 // Testo uniforme e visibile
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'white',                   // Placeholder bianco
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
            color: 'white',                   // Testo bianco
            padding: '5px 15px',             // Spaziatura interna
            cursor: 'pointer',
            fontSize: '19px',                 // Aumenta la dimensione del testo delle opzioni
            '&:hover': {
                backgroundColor: '#1e90ff',   // Colore blu al passaggio del mouse
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            borderRadius: '40px',              // Bordi arrotondati per il tag
            padding: '10px 10px',               // Padding per rendere i tag più "pillole"
            margin: '10px 5px',
        }),
    };

    const stakeholderOptions = [
        { value: "lkab", label: "LKAB" },
        { value: "municipality", label: "Municipality" },
        { value: "regional authority", label: "Regional authority" },
        { value: "architecture firms", label: "Architecture firms" },
        { value: "citizens", label: "Citizens" },
        { value: "others", label: "Others" },
    ];

    const popularLanguages = [
        { code: "en", name: "English" },
        { code: "sv", name: "Swedish" },
        { code: "se", name: "Northern Sami" },
        { code: "fi", name: "Finnish" },
        { code: "es", name: "Spanish" },
        { code: "zh", name: "Chinese" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "ja", name: "Japanese" },
        { code: "ru", name: "Russian" },
        { code: "pt", name: "Portuguese" },
        { code: "ar", name: "Arabic" },
        { code: "it", name: "Italian" },
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
                const { title, ...remainingErrors } = prevErrors;
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
                const { stakeholder, ...remainingErrors } = prevErrors;
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
                const { scale, ...remainingErrors } = prevErrors;
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
                const { planNumber, ...remainingErrors } = prevErrors;
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
                const { date, ...remainingErrors } = prevErrors;
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
                const { type, ...remainingErrors } = prevErrors;
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
                const { description, ...remainingErrors } = prevErrors;
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
            area: props.newAreaId,
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
        <>
            <div className="bg-background_color min-h-screen flex justify-center">
                <SingleDocument setNavShow={props.setNavShow} setMode={props.setMode} setoriginalDocId={props.setoriginalDocId}></SingleDocument>
                <Alert message={alertMessage[0]} type={alertMessage[1]}
                    clearMessage={() => setAlertMessage(['', ''])}></Alert>
                <div className="flex items-center justify-between w-full h-16">

                    <div className="flex items-center gap-3 mr-3 ml-20 mt-4">
                        <div className="z-[0] relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Search"
                                className="bg-search_color w-60 py-2 pl-10 pr-4 text-black rounded-[50px] focus:outline-none placeholder-black"
                            />
                        </div>

                        <button className="text-white text-2xl">
                            <i className="bi bi-sort-down-alt"></i>
                        </button>
                    </div>

                    <button onClick={toggleModal}
                        className="bg-[#2E6A8E] text-white grid justify-items-end py-2 px-4 mx-3 rounded-[77px] mt-4">
                        <span><i className="bi bi-file-earmark-plus"></i>  Add document</span>
                    </button>
                </div>
                <div>
                <button
                    className="bg-[#2E6A8E] text-white grid justify-items-end py-2 px-5 mb-20 mx-3 rounded-[77px] mt-4"
                    onClick={() => {
                        navigate("/documents/4")
                    }}>
                    document
                </button>
                </div>
            </div>

            {props.isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit">

                    <div
                        className="bg-box_color backdrop-blur-2xl drop-shadow-xl  w-1/3 p-6 h-2/3 overflow-y-auto rounded-lg flex flex-col items-center relative scrollbar-thin scrollbar-webkit">
                        <h2 className="text-white text-3xl font-bold ">Add New Document</h2>
                        <button onClick={toggleModal}
                            className="absolute top-5 text-white text-xl right-4 hover:text-gray-600">
                            <i className="bi bi-x-lg"></i>
                        </button>

                        <div className="input-title mb-4 w-full">
                            <label className="text-white w-full ml-2 mb-1 text-xl text-left">Title*</label>
                            <input
                                type="text"
                                placeholder="Title"
                                value={props.newDocument.title}
                                onChange={handleTitle}
                                className={`w-full px-3 text-xl py-2 text-white placeholder:text-placeholder_color bg-input_color rounded-[40px] ${errors.title ? 'border-red-500 border-1' : ''}`}
                            />
                        </div>

                        <div className="input-stakeholder mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Stakeholders*</label>
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
                                className="select"
                            />
                        </div>


                        <div className="input-scale mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Scale*</label>
                            <select
                                id="document-type"
                                value={props.newDocument.scale}
                                onChange={handleScale}
                                className={`w-full px-3 text-xl py-2 text-white bg-input_color rounded-[40px] ${errors.scale ? 'border-red-500 border-1' : ''}`}>
                                <option value="none">None</option>
                                <option value="text">Text</option>
                                <option value="concept">Concept</option>
                                <option value="plan">Plan</option>
                                <option value="blueprints">Blueprints/effects</option>
                            </select>
                        </div>

                        {props.newDocument.scale === 'plan' &&
                            <div className="input-plan mb-4 w-full">
                                <label className="text-white mb-1 text-xl w-full ml-2 text-left">Enter the scale
                                    1:n</label>
                                <input
                                    id="number-input"
                                    type="number"
                                    value={props.newDocument.planNumber}
                                    placeholder="n"
                                    onChange={handlePlanNumber}
                                    className={`w-full text-xl px-3 py-2 text-white bg-input_color rounded-[40px] ${errors.planNumber ? 'border-red-500 border-1' : ''}`}>
                                </input>
                            </div>}

                        <div className="input-date mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Issuance date*</label>
                            <input
                                id="document-date"
                                type="date"
                                value={props.newDocument.date}
                                onChange={handleDate}
                                className={`w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px]  ${errors.date ? 'border-red-500 border-1' : ''}`}>
                            </input>
                        </div>

                        <div className="input-type mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Type*</label>
                            <select
                                id="document-type"
                                value={props.newDocument.type}
                                onChange={handleType}
                                className={`w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px] ${errors.type ? 'border-red-500 border-1' : ''}`}>
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
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Language</label>
                            <select
                                id="document-language"
                                value={props.newDocument.language}
                                onChange={handleLanguage}
                                className="w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color  rounded-[40px]">
                                <option value="">None</option>
                                {popularLanguages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="input-number mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Pages</label>
                            <input
                                id="number-input"
                                type="number"
                                value={props.newDocument.pages}
                                placeholder="Select a number"
                                onChange={handleNumber}
                                className="w-full text-xl px-3 py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px]">
                            </input>
                        </div>

                        <div className="input-description mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Description*</label>
                            <textarea
                                placeholder="Description"
                                value={props.newDocument.description}
                                onChange={handleDescription}
                                className={`w-full p-2 px-3 py-2 text-xl text-white border-gray-300 placeholder:text-placeholder_color bg-input_color ${errors.description ? 'border-red-500 border-1' : ''}`}
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="input-map mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Georeference</label>
                            <button
                                onClick={() => {
                                    navigate("/map")
                                }}
                                className="w-full p-2 text-xl text-black border border-gray-300 focus:outline-none bg-[#D9D9D9] rounded-[40px]">
                                <i className="bi bi-globe-europe-africa"></i> Open the Map
                            </button>
                        </div>

                        <div className="input-link mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Linking</label>
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
                                className="w-full p-2 text-black border text-xl border-gray-300 focus:outline-none bg-[#D9D9D9] rounded-[40px]"> Select
                                Documents to Link
                            </button>
                        </div>

                        {/* Save button */}
                        <button
                            className="bg-[#1A5F88] w-full font-bold text-[28px]  text-white py-2 px-4 rounded-lg mt-4"
                            onClick={handleConfirm}>
                            Confirm
                        </button>

                    </div>
                </div>
            )}

        </>
    );
}

export { Document };
