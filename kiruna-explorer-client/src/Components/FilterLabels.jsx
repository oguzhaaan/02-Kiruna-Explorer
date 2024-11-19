import { useTheme } from "../contexts/ThemeContext";
import whiteCloseIcon from "../assets/close-icon-white.svg";
import blackCloseIcon from "../assets/close-icon-black.svg";

function FilterLabels({ filterValues, setFilterValues }) {
  const { isDarkMode } = useTheme();
  const handleRemoveFilter = (key, value) => {
    setFilterValues((prevFilters) => {
      if (key === "stakeholders") {
        return {
          ...prevFilters,
          stakeholders: prevFilters.stakeholders.filter((s) => s !== value),
        };
      }
      if (key === "date") {
        return { ...prevFilters, startDate: "", endDate: "" };
      }
      return { ...prevFilters, [key]: "" };
    });
  };
  return (
    <div className="flex flex-row ml-0 justify-start text-black_text dark:text-white_text rounded-lg gap-2 px-2 py-1">
      {filterValues.type && (
        <div
          className={`flex flex-row items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md cursor-pointer`}
        >
          Type
          <div className="mx-1 px-1 border-2 border-blue-400 dark:border-opacity-30 rounded-lg">
            {filterValues.type}
          </div>
          <img
            src={isDarkMode ? whiteCloseIcon : blackCloseIcon}
            className="w-4"
            onClick={() => handleRemoveFilter("type")}
            alt=""
          />
        </div>
      )}

      {filterValues.stakeholders.length > 0 && (
        <div
          className={`flex flex-row items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-400 rounded-md cursor-pointer`}
        >
          Stakeholders
          {filterValues.stakeholders.map((stakeholder, idx) => (
            <div
              className="flex items-center mx-1 px-1 border-2 border-blue-400 dark:border-opacity-30 rounded-lg"
              key={stakeholder.value}
            >
              <span>{stakeholder.label}</span>
              <img
                src={isDarkMode ? whiteCloseIcon : blackCloseIcon}
                className="w-2 ml-1 cursor-pointer"
                onClick={() => handleRemoveFilter("stakeholders", stakeholder)}
                alt="remove"
              />
            </div>
          ))}
        </div>
      )}
      { filterValues.startDate && filterValues.endDate && filterValues.startDate === filterValues.endDate && (
        <div
          className={`flex flex-row items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-400 rounded-md cursor-pointer`}
        >
          Issuance Date:
          <div className="mx-1 px-1 border-2 border-blue-400 dark:border-opacity-30 rounded-lg">
            {filterValues.startDate}
          </div>
          <img
            src={isDarkMode ? whiteCloseIcon : blackCloseIcon}
            className="w-4"
            onClick={() => handleRemoveFilter("date")}
            alt="remove"
          />
        </div>
      )}
      {filterValues.startDate && filterValues.endDate && filterValues.startDate !== filterValues.endDate &&(
        <div
          className={`flex flex-row items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-400 rounded-md cursor-pointer`}
        >
          Issuance Date:
          <div className="mx-1 px-1 border-2 border-blue-400 dark:border-opacity-30 rounded-lg">
            from {filterValues.startDate} to {filterValues.endDate}
          </div>
          <img
            src={isDarkMode ? whiteCloseIcon : blackCloseIcon}
            className="w-4"
            onClick={() => handleRemoveFilter("date")}
            alt="remove"
          />
        </div>
      )}
    </div>
  );
}

export default FilterLabels;
