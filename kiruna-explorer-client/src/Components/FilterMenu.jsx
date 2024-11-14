import { useState } from "react";
import Select from "react-select";
import customDropdownStyles from "./Utilities/CustomDropdownStyles";
import { stakeholderOptions } from "./Utilities/Data";
import { useTheme } from "../contexts/ThemeContext";


function FilterMenu({ onApply, onClear, toggleFilterMenu }) {
  const { isDarkMode } = useTheme();
  const [filterValues, setFilterValues] = useState({
    type: "",
    stakeholders: [],
    startDate: "",
    endDate: "",
  });

  const [isRange, setIsRange] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilterValues({ type: "", stakeholders: [], startDate: "", endDate: "" });
    setIsRange(false);
    onClear();
  };
  return (
    <div
      className="fixed inset-0 flex items-start top-14 justify-center"
      onClick={toggleFilterMenu}
    >
      <div
        className={`bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-lg
                    flex flex-col relative w-96 h-auto p-3`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Type */}
        <div className="input-type mb-1 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Type:
          </label>
          <select
            id="filter-type"
            value={filterValues.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className={`w-full px-3 text-base py-2 text-black_text dark:text-white_text bg-input_color_light dark:bg-input_color_dark rounded-md focus:outline-none`}
          >
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
        {/* Stakeholders */}
        <div className="input-stakeholder mb-1 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            Stakeholders:
          </label>
          <Select
            isMulti
            options={stakeholderOptions}
            value={filterValues.stakeholders}
            onChange={(e) => handleFilterChange("stakeholders", e)}
            styles={customDropdownStyles(isDarkMode)}
            placeholder="None"
            isClearable={false}
            isSearchable={false}
            className="select text-black_text"
          />
        </div>
        {/* Issuance Date Range */}
        <div className="input-date mb-1 w-full">
          <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
            {isRange ? "Issuance Date from:" : "Issuance Date:"}
          </label>
          <input
            id="filter-date"
            type="date"
            value={filterValues.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className={`w-full px-3 text-base py-2 text-text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-md  focus:outline-none`}
          />
        </div>
        {isRange && (
          <div className="input-date mb-1 w-full">
            <label className="text-black_text dark:text-white_text mb-1 text-base w-full ml-2 text-left">
              To:
            </label>
            <input
              id="filter-date2"
              type="date"
              value={filterValues.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
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
            checked={isRange}
            onChange={() => setIsRange(!isRange)}
            className="mr-2"
          />
          Select Range
        </label>
        {/* Filter Menu Buttons */}
        <div className="flex justify-center mt-14 w-full space-x-5">
          <button
            className={`bg-[#FFFFFFcc] dark:bg-customGray hover:bg-[#FFFFFFff] dark:hover:bg-[#938888] opacity-60
                        w-1/2 h-14
                        transition text-black rounded-xl text-xl`}
            onClick={clearFilters}
          >
            Clear
          </button>
          <button
            className={`bg-primary_color_light dark:bg-customBlue hover:bg-blue-300 dark:hover:bg-[#317199]
                        w-1/2 h-14
                        transition text-black_text dark:text-white_text rounded-xl text-xl`}
            onClick={()=>onApply(filterValues)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterMenu;
