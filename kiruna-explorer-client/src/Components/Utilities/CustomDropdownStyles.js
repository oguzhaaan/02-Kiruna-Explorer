// --- Styles ---
const customDropdownStyles = (isDarkMode) => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#d9d9d93f" : "#FFFFFFE2", // Sfondo del campo
    borderRadius: "0.375rem", // Bordo arrotondato
    borderColor: "transparent", // Bordo trasparente
    padding: "0px 5px", // Padding per centrare il testo
    boxShadow: "none", // Rimuove l'ombra
    cursor: "pointer",
    fontSize: "1rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "white", // Testo bianco per leggibilità
    fontSize: "1rem", // Testo uniforme e visibile
  }),
  placeholder: (provided) => ({
    ...provided,
    color: isDarkMode ? "white" : "black",
  }),
  dropdownIndicator: () => ({
    display: "none", // Rimuove la freccia predefinita
  }),
  indicatorSeparator: () => ({
    display: "none", // Rimuove la linea separatrice
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#2b2b2b" : "#FFFFFF", // Sfondo del menu (bianco in modalità chiara)
    borderRadius: "8px", // Bordo arrotondato del menu
    overflow: "hidden", // Rimuove eventuali scroll imprevisti
    border: "0px solid white",
  }),
  menuList: (provided) => ({
    ...provided,
    padding: "0", // Rimuove padding extra
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? isDarkMode
        ? "#373737a6" // Sfondo opzione selezionata in modalità scura
        : "#d3d3d3" // Sfondo opzione selezionata in modalità chiara
      : isDarkMode
      ? "#373737a6" // Sfondo opzione non selezionata in modalità scura
      : "#FFFFFF", // Sfondo opzione non selezionata in modalità chiara
    cursor: "pointer",
    fontSize: "0.9rem", // Aumenta la dimensione del testo delle opzioni
    "&:hover": {
      backgroundColor: "#1e90ff", // Colore blu al passaggio del mouse
    },
    color: isDarkMode ? "#F4F4F4" : "#0e0e0e", // Colore del testo
  }),
  multiValue: (provided) => ({
    ...provided,
    marginLeft: "-10px",
    marginRight: "15px",
  }),
});
export default customDropdownStyles;
