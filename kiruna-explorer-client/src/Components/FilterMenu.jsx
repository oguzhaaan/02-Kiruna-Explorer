import { useState } from "react";
import Select from "react-select";
import customDropdownStyles from "./Utilities/CustomDropdownStyles";
import { stakeholderOptions } from "./Utilities/Data";
import { useTheme } from "../contexts/ThemeContext";

function FilterMenu({ filterValues, setFilterValues, toggleFilterMenu }) {
  const { isDarkMode } = useTheme();
  const [isFilterDateRange, setIsFilterDateRange] = useState(
    filterValues.startDate !== "" &&
      filterValues.endDate !== "" &&
      filterValues.startDate !== filterValues.endDate
  );
  // Temporary state for inputs
  const [tempFilterValues, setTempFilterValues] = useState({ ...filterValues });

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
    setFilterValues(clearedValues);
    toggleFilterMenu();
  };

  const handleApply = () => {
    setFilterValues(tempFilterValues);
    toggleFilterMenu();
  };

  return (
    <div
      className="relative flex items-start justify-center"
      onClick={toggleFilterMenu}
    >
      <div
        className={`bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-lg
                    flex flex-col relative w-full sm:w-80 h-auto p-3`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Type */}
        <div className="input-type mb-1 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Type:
          </label>
          <select
            id="filter-type"
            value={tempFilterValues.type}
            onChange={(e) => handleTempChange("type", e.target.value)}
            className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md focus:outline-none dark:[&>option]:bg-[#333333]`}
          >
            <option value="none">None</option>
            <option value="Design">Design</option>
            <option value="Informative">Informative</option>
            <option value="Prescriptive">Prescriptive</option>
            <option value="Technical">Technical</option>
            <option value="Agreement">Agreement</option>
            <option value="Conflict">Conflict</option>
            <option value="Consultation">Consultation</option>
            <option value="Material Effects">Material Effects</option>
          </select>
        </div>
        {/* Stakeholders */}
        <div className="input-stakeholder mb-1 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Stakeholders:
          </label>
          <Select
            isMulti
            options={stakeholderOptions}
            value={tempFilterValues.stakeholders}
            onChange={(e) => handleTempChange("stakeholders", e)}
            styles={customDropdownStyles(isDarkMode)}
            placeholder="None"
            isClearable={false}
            isSearchable={false}
            className="select text-black_text"
          />
        </div>
        {/* Issuance Date */}
        {!isFilterDateRange && (
          <div className="input-date mb-1 w-full">
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
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${
                  isDarkMode ? "dark-mode" : "light-mode"
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
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${
                isDarkMode ? "dark-mode" : "light-mode"
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
              className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md ${
                isDarkMode ? "dark-mode" : "light-mode"
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
        <div className="flex justify-center mt-8 w-full space-x-5">
          <button
            className={`bg-[#FFFFFFcc] dark:bg-customGray hover:bg-[#FFFFFFff] dark:hover:bg-[#938888] opacity-60
                        w-5/12 h-12
                        transition text-black rounded-xl text-xl`}
            onClick={clearFilters}
          >
            Clear
          </button>
          <button
            className={`bg-primary_color_light dark:bg-customBlue hover:bg-blue-300 dark:hover:bg-[#317199]
                        w-5/12 h-12
                        transition text-black_text dark:text-white_text rounded-xl text-xl`}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterMenu;
