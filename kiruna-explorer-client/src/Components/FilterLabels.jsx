import { useTheme } from "../contexts/ThemeContext";
import whiteCloseIcon from "../assets/close-icon-white.svg";
import blackCloseIcon from "../assets/close-icon-black.svg";
import redCloseIcon from "../assets/close-icon-red.svg";

function FilterLabels({ filterValues, setFilterValues, setNodeStates }) {
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
    setNodeStates && setNodeStates({})
  };
  return (
    <div className="flex flex-row ml-0 justify-start text-black_text dark:text-white_text rounded-lg gap-2 pt-3">
      {filterValues.type && (
        <div
          className={`flex flex-row gap-1 items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md cursor-default`}
        >
          Type
          <div className="mx-1 px-1 border-2 border-blue-400 dark:border-opacity-30 rounded-lg">
            {filterValues.type}
          </div>
          <img
            src={isDarkMode ? whiteCloseIcon : blackCloseIcon}
            className="w-4 cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.src = redCloseIcon)}
            onMouseLeave={(e) => (e.currentTarget.src = isDarkMode ? whiteCloseIcon : blackCloseIcon)}
            onClick={() => handleRemoveFilter("type")}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleRemoveFilter("type");
              }
            }}
            alt="remove"
          />
        </div>
      )}

      {filterValues.stakeholders.length > 0 && (
        <div
          className={`flex flex-row gap-1 items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md cursor-default`}
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
                className="w-3 ml-1 cursor-pointer"
                onMouseEnter={(e) => (e.currentTarget.src = redCloseIcon)}
                onMouseLeave={(e) => (e.currentTarget.src = isDarkMode ? whiteCloseIcon : blackCloseIcon)}
                onClick={() => handleRemoveFilter("stakeholders", stakeholder)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    handleRemoveFilter("stakeholders", stakeholder);
                  }
                }}
                alt="remove"
              />
            </div>
          ))}
        </div>
      )}
      {filterValues.startDate && filterValues.endDate && filterValues.startDate === filterValues.endDate && (
        <div
          className={`flex flex-row gap-1 items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md cursor-default`}
        >
          Issuance Date
          <div className="mx-1 px-1 border-2 border-blue-400 dark:border-opacity-30 rounded-lg">
            {filterValues.startDate}
          </div>
          <img
            src={isDarkMode ? whiteCloseIcon : blackCloseIcon}
            className="w-4 cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.src = redCloseIcon)}
            onMouseLeave={(e) => (e.currentTarget.src = isDarkMode ? whiteCloseIcon : blackCloseIcon)}
            onClick={() => handleRemoveFilter("date")}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleRemoveFilter("date");
              }
            }}
            alt="remove"
          />
        </div>
      )}
      {filterValues.startDate && filterValues.endDate && filterValues.startDate !== filterValues.endDate && (
        <div
          className={`flex flex-row gap-1 items-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md cursor-default`}
        >
          Issuance Date
          <div className="mx-1 px-1 border-2 border-blue-400 dark:border-opacity-30 rounded-lg">
            from {filterValues.startDate} to {filterValues.endDate}
          </div>
          <img
            src={isDarkMode ? whiteCloseIcon : blackCloseIcon}
            className="w-4 cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.src = redCloseIcon)}
            onMouseLeave={(e) => (e.currentTarget.src = isDarkMode ? whiteCloseIcon : blackCloseIcon)}
            onClick={() => handleRemoveFilter("date")}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleRemoveFilter("date")
              }
            }}
            alt="remove"
          />
        </div>
      )}
    </div>
  );
}

export default FilterLabels;
