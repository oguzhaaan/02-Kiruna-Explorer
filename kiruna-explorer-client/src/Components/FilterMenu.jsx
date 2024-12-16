import { useState, useEffect } from "react";
import Select from "react-select";
import customDropdownStyles from "./Utilities/CustomDropdownStyles";
import { useTheme } from "../contexts/ThemeContext";
import API from "../API/API.mjs";

function FilterMenu({ filterValues, setFilterValues, homePage, setCurrentFilteredDoc, setFilteredDocs, setNodeStates }) {
  const { isDarkMode } = useTheme();
  const [isFilterDateRange, setIsFilterDateRange] = useState(
    filterValues.startDate !== "" &&
    filterValues.endDate !== "" &&
    filterValues.startDate !== filterValues.endDate
  );
  // Temporary state for inputs
  const [tempFilterValues, setTempFilterValues] = useState({ ...filterValues });

  const [stakeholders, setStakeholders] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    const inizialization = async () => {
      try {
        const types = await API.getAllTypes();
        setDocumentTypes(types);
        const stakeholders = await API.getAllStakeholders();
        setStakeholders(stakeholders);
      } catch (err) {
        console.log(err.message);
      }
    };
    inizialization();

  }, [])


  const toggleFilterDateRange = () => {
    if (isFilterDateRange) {
      handleTempChange("endDate", tempFilterValues.startDate);
    }

    // Toggle the state
    setIsFilterDateRange(!isFilterDateRange);
  };

  const handleTempChange = (key, value) => {
    setTempFilterValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    const clearedValues = {
      type: "",
      stakeholders: [],
      startDate: "",
      endDate: "",
    };
    setTempFilterValues(clearedValues);
    setFilterValues(clearedValues);
    setCurrentFilteredDoc && setCurrentFilteredDoc(null)
    setFilteredDocs && setFilteredDocs(null)
    setFilteredDocs && setNodeStates({})
  };

  const handleApply = () => {
    setFilterValues(tempFilterValues);
  };

  return (
    <div
      className={`${homePage? "bg-[#ffffff55] dark:bg-box_color" : "bg-box_white_color dark:bg-box_color backdrop-blur-2xl shadow-md"} rounded-lg
                    flex flex-col relative w-full h-auto p-3`}
    >
      <div className="flex flex-row mb-5">
        <div className="text-black_text dark:text-white_text text-3xl">
          <i className="bi bi-sort-down-alt w-10 " />
        </div>
        <label className="text-black_text dark:text-white_text mb-1 text-3xl w-full ml-2 text-left">
          Filters
        </label>
      </div>

      {/* Type */}
      <div className="input-type mb-3 w-full">
        <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
          Type:
        </label>
        <select
          id="filter-type"
          value={tempFilterValues.type}
          onChange={(e) => handleTempChange("type", e.target.value)}
          className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md focus:outline-none dark:[&>option]:bg-[#333333]`}
        >
          <option value="">None</option>
          {documentTypes
            .filter((type) => type.name !== "Add a new one...") // Supponendo che l'id sia "add_new"
            .map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))
          }
        </select>
      </div>
      {/* Stakeholders */}
      <div className="input-stakeholder mb-3 w-full">
        <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
          Stakeholders:
        </label>
        <Select
          isMulti
          options={stakeholders
            .filter((stakeholder) => stakeholder.name !== "Add a new one...")
            .map((stakeholder) => ({
              value: stakeholder.id,
              label: stakeholder.name,
            }))
          }
          value={tempFilterValues.stakeholders}
          onChange={(e) => handleTempChange("stakeholders", e)}
          styles={customDropdownStyles(isDarkMode, true)}
          placeholder="None"
          isClearable={false}
          isSearchable={false}
          className="select text-black_text"
        />
      </div>
      {/* Issuance Date */}
      {!isFilterDateRange && (
        <div className="input-date mb-3 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Issuance Date:
          </label>
          <input
            id="filter-date"
            type="date"
            value={tempFilterValues.startDate}
            onChange={(e) => {
              handleTempChange("startDate", e.target.value);
              handleTempChange("endDate", e.target.value);
            }}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${isDarkMode ? "dark-mode" : "light-mode"
              }  focus:outline-none`}
          />
        </div>
      )}
      {/* Issuance Date Range */}
      {isFilterDateRange && (
        <div className="input-date mb-1 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Issuance Date From:
          </label>
          <input
            id="filter-date2"
            type="date"
            value={tempFilterValues.startDate}
            onChange={(e) => handleTempChange("startDate", e.target.value)}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${isDarkMode ? "dark-mode" : "light-mode"
              }  focus:outline-none`}
          />
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            To:
          </label>
          <input
            id="filter-date2"
            type="date"
            value={tempFilterValues.endDate}
            onChange={(e) => handleTempChange("endDate", e.target.value)}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${isDarkMode ? "dark-mode" : "light-mode"
              }  focus:outline-none`}
          />
        </div>
      )}
      {/* Date Range Checkbox */}
      <label className="mb-1 flex items-center text-base text-black_text dark:text-white_text ml-2">
        <input
          type="checkbox"
          checked={isFilterDateRange}
          onChange={toggleFilterDateRange}
          className="mr-2"
        />
        Select Range
      </label>
      {/* Filter Menu Buttons */}
      <div className="flex justify-between mt-8 w-full space-x-3">
        <button
          className={`bg-[#FFFFFFcc] dark:bg-customGray hover:bg-[#FFFFFFff] dark:hover:bg-[#938888] opacity-60
                        w-full h-12
                        transition text-black rounded-lg text-xl`}
          onClick={clearFilters}
        >
          Clear
        </button>
        <button
          className={`bg-primary_color_light dark:bg-customBlue hover:bg-blue-300 dark:hover:bg-[#317199]
                        w-full h-12
                        transition text-black_text dark:text-white_text rounded-lg text-xl`}
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default FilterMenu;
