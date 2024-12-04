import { useNavigate } from "react-router-dom";
import { getIcon } from "./Utilities/DocumentIcons";
import { getStakeholderColor } from "./Utilities/StakeholdersColors";

const DocumentItem = ({
    documentId,
    title,
    type,
    date,
    stakeholders = [],
    isDarkMode,
  }) => {
    const navigate = useNavigate();
    return (
      <div className={isDarkMode ? "dark" : "light"}>
        <div
          className={`flex flex-wrap shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] rounded-xl bg-[#ffffffdd] dark:bg-document_item_radient_grey p-3 cursor-pointer `}
          onClick={() => {
            navigate(/documents/ + documentId);
          }}
        >
          <div className="grid grid-cols-4 w-full gap-4 text-black_text dark:text-white_text">
            {/* Document Title*/}
            <div className="col-span-3 text-xl font-normal">{title}</div>
            {/* Date */}
            <div className="flex justify-end text-sm text-gray-400 ">{date}</div>
            {/* Document Type */}
            <div className="flex flex-row items-center text-base font-light">
              <img
                src={getIcon(
                  { type: type.toLowerCase() },
                  { darkMode: isDarkMode }
                )}
                className="w-8 mr-2"
                alt="type_icon"
              />
              {type}
            </div>
  
            {/* Stakeholders */}
            <div className="col-span-3 flex flex-wrap justify-end gap-2 text-white_text">
              {stakeholders &&
                stakeholders.length > 0 &&
                stakeholders.map((stakeholder) => (
                  <span
                    key={stakeholder.id} // Use the stakeholder id for key to avoid index as key.
                    className={`rounded-2xl w-fit px-3 py-1 text-sm ${getStakeholderColor(
                      { stakeholder: stakeholder.name.toLowerCase() }
                    )}`}
                  >
                    {stakeholder.name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default DocumentItem;