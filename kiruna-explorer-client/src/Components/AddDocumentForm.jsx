import Select from "react-select";
import {
  popularLanguages,
} from "./Utilities/Data";
import customDropdownStyles from "./Utilities/CustomDropdownStyles";
import { useTheme } from "../contexts/ThemeContext";
import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentClass from "../classes/Document.mjs";
import { useNewDocument } from '../contexts/NewDocumentContext';

const AddDocumentForm = (props) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const {
    stakeholderOptions, setStakeholderOptions,
    //selectedOption, setSelectedOption,
    isAddingNewStakeholder, setIsAddingNewStakeholder,
    newStakeholderName, setNewStakeholderName,
    newStakeholders, setNewStakeholders,
    oldStakeholders, setOldStakeholders,
    typeOptions, setTypeOptions,
    isAddingNewType, setIsAddingNewType,
    newTypeName, setNewTypeName,
    selectedType, setSelectedType,
    oldTypes, setOldTypes,
  } = useNewDocument();

  /* const [stakeholderOptions, setStakeholderOptions] = useState([]);
   const [selectedOption, setSelectedOption] = useState("");
   const [isAddingNewStakeholder, setIsAddingNewStakeholder] = useState(false);
   const [newStakeholderName, setNewStakeholderName] = useState("");
   const [newStakeholders, setNewStakeholders] = useState([]);
   const [oldStakeholders, setOldStakeholders] = useState([]);
 
   const [typeOptions, setTypeOptions] = useState([]); // 'types' è la lista iniziale di tipi
   const [isAddingNewType, setIsAddingNewType] = useState(false);
   const [newTypeName, setNewTypeName] = useState("");
   const [selectedType, setSelectedType] = useState("");
   const [oldTypes, setOldTypes] = useState([]); */

  const [newDocument, setNewDocument] = [props.newDocument, props.setNewDocument];

  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const inizialization = async () => {
      try {
        console.log("Inizialization..");
        const types = await API.getAllTypes();
        setOldTypes(types);
        types.push({ id: types.length + 1, name: "Add a new one..." });
        setTypeOptions(types);
        const stakeholders = await API.getAllStakeholders();
        setOldStakeholders(stakeholders);
        stakeholders.push({ id: stakeholders.length + 1, name: "Add a new one..." });
        setStakeholderOptions(stakeholders);
        updateValues();

      } catch (err) {
        console.log(err.message);
        props.setAlertMessage([err.message, "error"]);
      }
    };
    inizialization();
    console.log(newDocument);
    updateValues();

  }, []);


  const updateValues = () => {
    // Aggiorna i tipi
    if (newDocument.newTypes && newDocument.newTypes.length > 0) {
      let newTypes = newDocument.newTypes.map((type, index) => ({
        id: type.id || typeOptions.length + index + 1, // Assegna un ID unico se non presente
        name: type.name
      }));

      setTypeOptions((prevOptions) => {
        let updatedOptions = [...prevOptions];
        newTypes.forEach((newType) => {
          // Aggiungi solo se il tipo non è già presente
          if (!updatedOptions.some((option) => option.name === newType.name)) {
            updatedOptions.push(newType);
          }
        });
        return updatedOptions;
      });
    }

    // Aggiorna gli stakeholder
    if (newDocument.newStakeholders && newDocument.newStakeholders.length > 0) {
      let newStakeholders = newDocument.newStakeholders.map((stakeholder, index) => ({
        id: stakeholder.id || stakeholderOptions.length + index + 1, // Assegna un ID unico se non presente
        name: stakeholder.label // Assumendo che l'etichetta sia la proprietà corretta
      }));

      setStakeholderOptions((prevOptions) => {
        let updatedOptions = [...prevOptions];
        newStakeholders.forEach((newStakeholder) => {
          // Aggiungi solo se lo stakeholder non è già presente
          if (!updatedOptions.some((option) => option.name === newStakeholder.name)) {
            updatedOptions.push(newStakeholder);
          }
        });
        return updatedOptions;
      });
    }
  };

  const handleTypeChange = (selectedType) => {
    const typeName = selectedType.target.value;

    if (typeName === "Add a new one...") {
      setIsAddingNewType(true);
    } else {
      setSelectedType(typeName);
      // Trova l'ID del tipo selezionato
      const typeId = getTypeIdByName(typeName, typeOptions);
      setNewDocument((prevDoc) => ({
        ...prevDoc,
        typeId: typeId || "", // Usa l'ID del tipo selezionato
        typeName: typeName || ""
      }));
    }
  };

  function getTypeIdByName(typeName, documents) {
    // Cerca il tipo nell'array e restituisce l'ID
    const type = documents.find((type) => type.name === typeName);
    return type ? type.id : null; // Restituisce null se il tipo non è trovato
  }

  const handleNewTypeSubmit = () => {
    if (newTypeName.trim() !== "") {
      const newType = {
        id: typeOptions.length + 1, // Genera un ID univoco
        name: newTypeName,
      };

      // Aggiungi il nuovo tipo alla lista delle opzioni
      setTypeOptions((prevOptions) => {
        const updatedOptions = [
          ...prevOptions,
          { id: newType.id, name: newType.name },
        ];
        return updatedOptions;
      });

      console.log(newTypeName);

      // Aggiorna il documento con il nuovo tipo selezionato (impostando il typeId)
      setNewDocument((prevDoc) => ({
        ...prevDoc,
        typeId: newType.id, // Imposta direttamente l'ID del nuovo tipo
        typeName: newTypeName,
        newTypes: [...prevDoc.newTypes, newType] // Aggiungi il nuovo tipo a newTypes
      }));

      // Imposta l'opzione selezionata
      setSelectedType(newTypeName);
    }
    setIsAddingNewType(false);
    setNewTypeName("");
  };

  const handleSelectChange = (selectedValues) => {
    if (selectedValues[selectedValues.length - 1]?.label === "Add a new one...") {
      setIsAddingNewStakeholder(true);
    } else {
      // Imposta il valore selezionato e aggiorna i campi come necessario
      //setSelectedOption(selectedValues[selectedValues.length - 1]?.label || "");
      handleFieldChange("stakeholders", selectedValues || []);
    }
  }

  const getLastStakeholderId = (stakeholders) => {
    return stakeholders[stakeholders.length - 1].id;
  }

  const handleNewStakeholderSubmit = () => {
    setIsValid(true);
    if (newStakeholderName.trim() !== "") {
      const newStakeholder = {
        id: getLastStakeholderId(stakeholderOptions) + 1,
        name: newStakeholderName,
      };

      const newUpdatedStakeholders = [
        ...newDocument.newStakeholders,
        { value: newStakeholder.id, label: newStakeholder.name },
      ];

      // Aggiungi il nuovo stakeholder alla lista delle opzioni  WE WANT TO ADD THE STAKEHOLDER IN THE LIST IMMEDIATLY??
      setStakeholderOptions((prevOptions) => [
        ...prevOptions,
        { id: newStakeholder.id, name: newStakeholder.name },
      ]);

      // Aggiungi il nuovo stakeholder al documento
      const updatedStakeholders = [
        ...newDocument.stakeholders,
        { value: newStakeholder.id, label: newStakeholder.name },
      ];
      setNewDocument((prevDoc) => ({
        ...prevDoc,
        stakeholders: updatedStakeholders,
        newStakeholders: newUpdatedStakeholders
      }));

      //setSelectedOption(newStakeholderName);
      /* setNewStakeholders((prev) => [
         ...prev, // Spread dell'array precedente
         newStakeholderName // Nuovo elemento aggiunto alla fine
       ]);*/
    }
    setIsAddingNewStakeholder(false);
    setNewStakeholderName("");
  };


  const moveAddNewOptionToEnd = (options) => {

    // Trova l'opzione "Add a new one..."
    const addNewOption = options.find(option => option.name === "Add a new one...");
    if (!addNewOption) return options; // Se non esiste, ritorna l'elenco invariato

    // Rimuovi l'opzione "Add a new one..." dalla lista
    const optionsWithoutAddNew = options.filter(option => option.name !== "Add a new one...");

    // Aggiungi l'opzione "Add a new one..." alla fine
    return [...optionsWithoutAddNew, addNewOption];

  };


  const moveAddNewOptionToEndType = (options) => {
    const addNewOptionName = "Add a new one...";
    const addNewOption = options.find(option => option.name === addNewOptionName);
    const newOptionName = newDocument.typeName;

    // Controlla se `newDocument.typeName` è valido e non vuoto
    if (newOptionName && newOptionName.trim() !== "") {
      const isNewTypeIncluded = options.some(option => option.name === newOptionName);

      // Aggiungi `newDocument.typeName` se non è già presente
      if (!isNewTypeIncluded) {
        options = [...options, { id: options.length + 1, name: newOptionName }];
      }
    }

    // Rimuovi l'opzione "Add a new one..." dalla lista, se esiste
    const optionsWithoutAddNew = options.filter(option => option.name !== addNewOptionName);

    // Aggiungi "Add a new one..." alla fine
    const updatedOptions = addNewOption
      ? [...optionsWithoutAddNew, addNewOption]
      : optionsWithoutAddNew;

    // Aggiorna lo stato di `typeOptions`
    //setTypeOptions(updatedOptions);

    return updatedOptions;
  };



  const handleFieldChange = (field, value) => {
    setIsValid(true);
    setNewDocument((prevDoc) => {
      const updatedDoc = { ...prevDoc, [field]: value };

      if (["year", "month", "day"].includes(field)) {
        const { year, month, day } = updatedDoc;
        updatedDoc.date = year || "";
        if (year && month) updatedDoc.date = `${year}-${month}`;
        if (year && month && day) updatedDoc.date = `${year}-${month}-${day}`;
      }

      return updatedDoc;
    });

    if (value && value !== "none") {
      setErrors((prevErrors) => {
        const { [field]: removedError, ...remainingErrors } = prevErrors;
        return remainingErrors;
      });
    }
  };

  // --- Errors ---
  const [errors, setErrors] = useState({});
  const validateFields = () => {
    const validateDate = (date) => {
      if (!date) return false; // No date is invalid
      const parts = date.split("-");
      if (parts.length === 1 && parts[0].length === 4) return true; // yyyy
      if (
        parts.length === 2 &&
        parts[0].length === 4 &&
        parts[1].length > 0 &&
        parts[1].length <= 2
      )
        return true; // yyyy-mm
      if (
        parts.length === 3 &&
        parts[0].length === 4 &&
        parts[1].length > 0 &&
        parts[1].length <= 2 &&
        parts[2].length > 0 &&
        parts[2].length <= 2
      )
        return true; // yyyy-mm-dd
      return false; // Invalid format
    };

    const newErrors = {
      ...(newDocument.title ? {} : { title: "Title is required" }),
      ...(newDocument.stakeholders?.length > 0
        ? {}
        : { stakeholder: "At least one stakeholder is required" }),
      ...(newDocument.scale && newDocument.scale !== "none"
        ? {}
        : { scale: "Scale is required" }),
      ...(newDocument.scale === "plan" && !newDocument.planNumber
        ? { planNumber: "Plan Number is required for scale 'plan'" }
        : {}),
      ...(newDocument.date
        ? validateDate(newDocument.date)
          ? {}
          : { date: "Invalid date format. Use yyyy, yyyy-mm, or yyyy-mm-dd." }
        : { date: "Date is required" }),
      ...(newDocument.typeId ? {} : { type: "Type is required" }),
      ...(newDocument.description
        ? {}
        : { description: "Description is required" }),
    };
    setIsValid(newDocument.stakeholders?.length > 0);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  // --- Submit Form ---
  const handleConfirm = async () => {
    console.log(newDocument);


    const isValid = validateFields();
    if (!isValid) {
      // Se ci sono errori, esci dalla funzione e non eseguire nulla
      console.log("Form validation failed. Please fix the errors before submitting.");
      return;
    }

    let area_id;
    if (props.newAreaId && props.newAreaId.geoJson) {
      area_id = await API.addArea(props.newAreaId.geoJson)
    }
    else if (props.newAreaId) {
      area_id = props.newAreaId
    }
    // Refresh the list of the documents

    //CAMPI OPZIONALI: PAGE + LANGUAGE + GIORNO DELLA DATA(?) + COORDINATES
    //CAMPI OBBLIGATORI: TITLE + STAKEHOLDER + SCALE(PLANE NUMBER IN CASE) + DATE + DESCRIPTION + TYPE
      try {
        newDocument.typeId = await API.addType(newDocument.typeName);
      } catch (error) {
        console.log(error);
        props.setAlertMessage([error.message, "error"]);
        return;
      }
    

    console.log(newDocument.typeId);

    let stakeholdersId = [];
    let newStakeholderNames = newDocument.newStakeholders.map((e) => e.label); //tutti quelli creati anche non più selezionati
    let stakeholdersToCreate = newDocument.stakeholders.filter((e) => newStakeholderNames.some((name) => e.label.includes(name))).map((e) => e.label);
    console.log(stakeholdersToCreate);
    if (newStakeholderNames.length != 0) {
      try {
        stakeholdersId = await API.addNewStakeholders(newStakeholderNames);
        console.log(stakeholdersId);
      } catch (error) {
        console.log(error);
        props.setAlertMessage([error.message, "error"]);
        return;
      }
    }

    const stakeholdersName = newDocument.stakeholders.map((s) => s.label);

    props.setNewDocument(newDocument);
    const documentData = {
      title: newDocument.title,
      scale: newDocument.scale,
      planNumber: newDocument.planNumber, // Optional
      date: newDocument.date
        ? newDocument.date
          .split("-")
          .map((part, index) => (index === 0 ? part : part.padStart(2, "0")))
          .join("-")
        : "",
      typeId: newDocument.typeId,
      language: newDocument.language || null, // Set to null if not provided
      pageNumber: newDocument.pages || null, // Set to null if not provided
      description: newDocument.description, // Mandatory
      links: props.connections.length > 0 ? props.connections : null,
    };

    if (area_id) {
      documentData.areaId = area_id;
    }

    console.log(stakeholdersName);
    try {
      let documentId = await API.addDocument(documentData);
      props.setAlertMessage(["Document added successfully!", "success"]);
      props.setnewAreaId(null);
      props.setConnections([]);
      closeForm();
      await API.addStakeholdersToDocument(documentId.lastId, stakeholdersName);
    } catch (error) {
      console.log(error);
      props.setAlertMessage([error.message, "error"]);
    }
  };

  useEffect(() => {
    props.setNavShow(true);
  }, []);

  const closeForm = () => {
    props.toggleModal();
    clearErrors();
    resetForm();
  };

  const resetForm = () => {
    setNewDocument(new DocumentClass());
  };

  const calculateDaysInMonth = (year, month) => {
    if (month === 2) {
      // February: Check for leap year
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    }
    // Months with 31 days
    if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
      return 31;
    }
    // Months with 30 days
    if ([4, 6, 9, 11].includes(month)) {
      return 30;
    }
    return 31; // Default to 31 days
  };

  return (
    <div
      className={`${isDarkMode ? "dark-select" : "light-select"
        } py-4 fixed inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit z-[1040]`}
      onClick={closeForm}
      onKeyUp={(e) => {
        if (e.key === 'Enter') {
          closeForm();
        }
      }}
    >
      <div
        className="bg-box_white_color dark:bg-box_color backdrop-blur-2xl shadow-xl w-1/2 px-10 py-10 h-full overflow-y-auto rounded-lg flex flex-col relative scrollbar-thin scrollbar-webkit"
        onClick={(e) => e.stopPropagation()}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
      >
        <h2 className="text-black_text mb-4 dark:text-white_text text-2xl  ">
          Add New Document
        </h2>
        {/* Close Button */}
        <button
          onClick={closeForm}
          className="absolute top-5 text-black_text dark:text-white_text right-4 hover:text-gray-600"
        >
          <i className="bi bi-x-lg text-2xl"></i>
        </button>
        {/* Title */}
        <div className="input-title mb-4 w-full">
          <label className="text-black_text dark:text-white_text w-full ml-2 mb-1 text-base text-left">
            Title<span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Title"
            value={newDocument.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.title
              ? "border-red-500 border-1"
              : "focus:border-blue-400 border-1 border-transparent"
              } focus:outline-none`}
          />
        </div>
        {/* Stakeholders */}
        {isAddingNewStakeholder ? (
          <div className="input-title mb-4 w-full">
            <label className="text-black_text dark:text-white_text w-full ml-2 mb-1 text-base text-left">
              Add a new Stakeholder<span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Stakeholder"
                value={newStakeholderName}
                onChange={(e) => setNewStakeholderName(e.target.value)}
                className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.stakeholder
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
                  } focus:outline-none`}
              />{newStakeholderName ? (<button
                type="button"
                onClick={handleNewStakeholderSubmit}
                className="absolute top-2 right-4 text-gray-500 dark:text-white_text hover:text-blue-500"
              >
                <i className="bi bi-plus-lg"></i>
              </button>) : (
                <button
                  type="button"
                  onClick={() => setIsAddingNewStakeholder(false)}
                  className="absolute top-2 right-4 text-gray-500 dark:text-white_text hover:text-blue-500"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="input-stakeholder mb-4 w-full">
            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
              Stakeholders<span className="text-red-400">*</span>
            </label>
            <Select
              isMulti
              options={moveAddNewOptionToEnd(stakeholderOptions).map((stakeholder) => ({
                value: stakeholder.id,
                label: stakeholder.name,
              }))}
              value={newDocument.stakeholders}
              onChange={handleSelectChange}
              styles={customDropdownStyles(isDarkMode, isValid)}
              placeholder="None"
              isClearable={false}
              isSearchable={false}
              className="select w-full text-black_text"
            />
          </div>)}
        {/* Scale */}
        <div className="input-scale mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Scale<span className="text-red-400">*</span>
          </label>
          <select
            id="document-type"
            value={newDocument.scale}
            onChange={(e) => handleFieldChange("scale", e.target.value)}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.scale
              ? "border-red-500 border-1"
              : "focus:border-blue-400 border-1 border-transparent"
              } focus:outline-none`}
          >
            <option value="none">None</option>
            <option value="text">Text</option>
            <option value="concept">Concept</option>
            <option value="plan">Plan</option>
            <option value="blueprints">Blueprints/effects</option>
          </select>
        </div>

        {newDocument.scale === "plan" && (
          <div className="input-plan mb-4 w-full">
            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
              Enter the scale 1:n
            </label>
            <input
              id="number-input"
              type="number"
              value={newDocument.planNumber}
              placeholder="n"
              onChange={(e) => handleFieldChange("planNumber", e.target.value)}
              className={`w-full text-base px-3 py-2 text-text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.planNumber
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
                } focus:outline-none`}
            ></input>
          </div>
        )}
        {/* Date */}
        <div className="input-type mb-4 w-full">
          {/* Label for the date */}
          <label
            htmlFor="issuance-date"
            className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left"
          >
            Issuance date<span className="text-red-400">*</span>
          </label>
          {/* Date Dropdowns */}
          <div className="flex flex-row space-x-4 items-center">
            {/* Year Dropdown */}
            <select
              id="document-date-year"
              value={newDocument.date?.split("-")[0] || ""}
              onChange={(e) => handleFieldChange("year", e.target.value)}
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${isDarkMode ? "dark-mode" : "light-mode"
                } ${errors.date
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
                } focus:outline-none`}
            >
              <option value="" disabled>
                Year
              </option>
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>

            {/* Month Dropdown */}
            <select
              id="document-date-month"
              value={newDocument.date?.split("-")[1] || ""}
              disabled={!Boolean(newDocument.date?.split("-")[0])} // Check if year is seleceted
              onChange={(e) => handleFieldChange("month", e.target.value)}
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md disabled:opacity-30 ${isDarkMode ? "dark-mode" : "light-mode"
                } ${errors.date
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
                } focus:outline-none`}
            >
              <option value="">
                Month
              </option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            {/* Day Dropdown */}
            <select
              value={newDocument.date?.split("-")[2] || ""}
              onChange={(e) => handleFieldChange("day", e.target.value)}
              id="document-date-day"
              disabled={!Boolean(newDocument.date?.split("-")[1])} // Check if month is seleceted
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md disabled:opacity-30 ${isDarkMode ? "dark-mode" : "light-mode"
                } ${errors.date
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
                } focus:outline-none`}
            >
              <option value="">
                Day
              </option>
              {Array.from(
                {
                  length: calculateDaysInMonth(
                    parseInt(newDocument.date?.split("-")[0]), // year
                    parseInt(newDocument.date?.split("-")[1]) // month
                  ),
                },
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Old Date */}
        {/* <div className="input-date mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Issuance date<span className="text-red-400">*</span>
          </label>
          <input
            id="document-date"
            type="date"
            value={props.newDocument.date}
            onChange={(e) => handleFieldChange("date", e.target.value)}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${
              isDarkMode ? "dark-mode" : "light-mode"
            } ${
              errors.date
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
            } focus:outline-none`}
          />
        </div> */}
        {/* Type */}
        <div className="input-type mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Type<span className="text-red-400">*</span>
          </label>
          {isAddingNewType ? (
            <div className="relative">
              <input
                type="text"
                placeholder="Type"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.type
                  ? "border-red-500 border-1"
                  : "focus:border-blue-400 border-1 border-transparent"
                  } focus:outline-none`}
              />
              {newTypeName ? (
                <button
                  type="button"
                  onClick={handleNewTypeSubmit}
                  className="absolute top-2 right-4 text-gray-500 dark:text-white_text hover:text-blue-500"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingNewType(false)}
                  className="absolute top-2 right-4 text-gray-500 dark:text-white_text hover:text-blue-500"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          ) : (
            <select
              id="document-type"
              value={newDocument.typeName}
              onChange={handleTypeChange}
              className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md ${errors.type
                ? "border-red-500 border-1"
                : "focus:border-blue-400 border-1 border-transparent"
                } focus:outline-none`}
            >
              <option value="none">None</option>
              {
                moveAddNewOptionToEndType(typeOptions).map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
            </select>
          )}
        </div>
        {/* Language */}
        <div className="input-language mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Language
          </label>
          <select
            id="document-language"
            value={newDocument.language}
            onChange={(e) => handleFieldChange("language", e.target.value)}
            className="w-full px-3 text-base py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md focus:border-blue-400 border-1 border-transparent focus:outline-none"
          >
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
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Pages
          </label>
          <input
            id="number-input"
            type="number"
            value={newDocument.pages}
            placeholder="Select a number"
            onChange={(e) => handleFieldChange("pages", e.target.value)}
            className="w-full text-base px-3 py-2 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md focus:border-blue-400 border-1 border-transparent :outline-none"
          ></input>
        </div>
        {/* Description */}
        <div className="input-description mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Description<span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="Description"
            value={newDocument.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className={`w-full p-2 px-3 py-2 text-base text-text-black_text dark:text-white_text border-gray-300 placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark  ${errors.description
              ? "border-red-500 border-1"
              : "focus:border-blue-400 border-1 border-transparent"
              } focus:outline-none`}
            rows="4"
          ></textarea>
        </div>
        {/* Georeference */}
        <div className="input-map mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Georeference
          </label>
          {props.newAreaId && (
            <label className="text-black_text dark:text-white_text text-base w-full text-left py-1">
              <i className="bi bi-check-lg align-middle text-green-400"></i> You
              selected{" "}
              {props.newAreaId === 1 ? "Municipality Area" : `a Georeference`}
            </label>
          )}
          <button
            onClick={() => {
              navigate("/map");
            }}
            className="w-full p-2 text-white_text dark:text-black_text text-base border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] hover:bg-[#000000] dark:hover:bg-customGray1 :transition rounded-md"
          >
            <i className="bi bi-globe-europe-africa"></i> Open the Map
          </button>
        </div>
        {/* Linking */}
        <div className="input-link mb-4 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Linking
          </label>
          {props.connections && props.connections.length > 0 && (
            <p className="m-0 px-2 py-1 text-gray-500">
              {props.connections.length + " connections selected"}
            </p>
          )}
          <button
            onClick={() => {
              props.setNavShow(false);
              props.setMode("return");
              navigate("/linkDocuments");
            }}
            className="w-full p-2 text-white_text dark:text-black_text text-base border-gray-300 focus:outline-none bg-customGray1 dark:bg-[#D9D9D9] hover:bg-[#000000] dark:hover:bg-customGray1 :transition rounded-md"
          >
            {" "}
            Select Documents to Link
          </button>
        </div>
        {/* Save Button */}
        <button
          className="bg-primary_color_light dark:bg-primary_color_dark w-full hover:bg-[#2E6A8E66] transition  text-lg dark:text-white_text text-black_text py-2 px-4 rounded-lg mt-4"
          onClick={handleConfirm}
        >
          Confirm
        </button>
      </div>
    </div >
  );
};

export default AddDocumentForm;
