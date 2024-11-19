import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getStakeholderColor } from "./Utilities/StakeholdersColors";
import { getIcon } from "./Utilities/DocumentIcons";
import API from "../API/API.mjs";
import PropTypes from "prop-types";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { formatString } from "./Utilities/StringUtils.js";
import FilterMenu from "./FilterMenu.jsx";
import FilterLabels from "./FilterLabels.jsx";
import { useDocuments } from "../hooks/useDocuments.mjs";

const LinkDocuments = ({
  originalDocId,
  mode,
  setConnectionsInForm,
  setOriginalDocId,
}) => {
  const navigate = useNavigate();

  const { isDarkMode } = useTheme();

  // --- Search ---
  const [searchQuery, setSearchQuery] = useState(""); // User's input
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
  // --- Filter ---
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen((prevState) => !prevState);
  };
  const [filterValues, setFilterValues] = useState({
    type: "",
    stakeholders: [],
    startDate: "",
    endDate: "",
  });
  // --- Update Documents List ---
  const {
    documents,
    loading,
    error,
    fetchAllDocuments,
    fetchFilteredDocuments,
  } = useDocuments();
  // Fetch all documents on mount
  useEffect(() => {
    fetchAllDocuments();
  }, []);
  // Add delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery); // Update debounced query after delay
    }, 500); // Wait 500ms

    return () => {
      clearTimeout(handler); // Clear timeout if searchQuery changes before 500ms
    };
  }, [searchQuery]);
  useEffect(() => {
    // Merge searchQuery into filterValues
    fetchFilteredDocuments({ ...filterValues, title: debouncedQuery });
  }, [filterValues, debouncedQuery]);
  //-------

  const [availableDocuments, setAvailableDocuments] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Default connection options for all documents
  const defaultConnectionOptions = [
    "direct_consequence",
    "collateral_consequence",
    "prevision",
    "update",
  ];

  // State to hold the connection types for each document
  const [links, setLinks] = useState({});

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const linkedDocument = await API.getDocuemntLinks(originalDocId);
        const allDocuments = await API.getAllDocuments();

        // Filter out the document with the same ID as originalDocId
        const availableDocuments = allDocuments.filter(
          (doc) => doc.id !== originalDocId
        );

        let tempLinks = {};

        if (mode === "save") {
          // Set the links only if linkedDocument exists
          if (linkedDocument) {
            // Initialize tempLinks with empty arrays
            availableDocuments.forEach((doc) => {
              tempLinks[doc.id] = [];
            });

            // Populate tempLinks with connection types
            linkedDocument.forEach((link) => {
              const { id, connection } = link;
              if (!tempLinks[id]) {
                tempLinks[id] = [];
              }
              tempLinks[id].push(connection);
            });
          } else {
            // If linkedDocument doesn't exist, initialize tempLinks with empty arrays
            availableDocuments.forEach((doc) => {
              tempLinks[doc.id] = [];
            });
          }

          // Update the links state here
          setLinks(tempLinks);
        } else {
          // If not in "save" mode, initialize tempLinks with empty arrays
          availableDocuments.forEach((doc) => {
            tempLinks[doc.id] = [];
          });
          setLinks(tempLinks);
        }

      } catch (error) {
        console.error("Error in getAllDocuments function:", error.message);
        throw new Error(
          "Unable to get the documents. Please check your connection and try again."
        );
      }
    };

    fetchDocuments();
  }, [mode]); // Only run effect when mode changes

  const [selectedDocuments, setSelectedDocuments] = useState([]);
  // Syncing `selectedDocuments` with `links`
  useEffect(() => {
    // Check if links are available and update `selectedDocuments`
    const updatedSelectedDocuments = documents
      .filter((doc) => doc.id !== originalDocId)
      .filter((doc) => links[doc.id] && links[doc.id].length > 0);
    setSelectedDocuments(updatedSelectedDocuments);
  }, [links]);

  const handleConnectionChange = (docId, value) => {
    setLinks((prevLinks) => {
      const currentConnections = prevLinks[docId] || [];
      const newLinks = currentConnections.includes(value)
        ? currentConnections.filter((conn) => conn !== value)
        : [...currentConnections, value];

      if (newLinks.length > 0) {
        // Add document to selectedDocuments if not already there
        if (!selectedDocuments.some((doc) => doc.id === docId)) {
          const selectedDoc = documents.find((doc) => doc.id === docId);
          setSelectedDocuments((prev) => [...prev, selectedDoc]);
        }
      } else {
        // Remove from selectedDocuments if no connections are left
        setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      }

      return {
        ...prevLinks,
        [docId]: newLinks,
      };
    });
  };

  // Generate link array based on user selections
  const generateLinkArray = () => {
    return Object.entries(links).reduce((acc, [docId, connectionTypes]) => {
      connectionTypes.forEach((connectionType) => {
        if (connectionType !== "None") {
          const linkObject =
            mode === "return"
              ? {
                  selectedDocId: docId,
                  connectionType,
                  date: dayjs().format("YYYY/MM/DD"),
                }
              : {
                  originalDocId,
                  selectedDocId: docId,
                  connectionType,
                  date: dayjs().format("YYYY/MM/DD"),
                };
          acc.push(linkObject);
        }
      });
      return acc;
    }, []);
  };

  // Show modal when "Done" is clicked
  const handleDoneClick = () => {
    setIsModalVisible(true);
  };

  // Confirm and log link array when modal confirmation is clicked
  const handleConfirm = async () => {
    const linkArray = generateLinkArray();

    if (mode === "return") {
      // In "return" mode, call the callback function with connectionArray
      setConnectionsInForm(linkArray);
      navigate(-1);
    } else if (mode === "save") {
      console.log(linkArray);
      // In "save" mode, make an API call to save the connections
      try {
        //console.log(link)
        if (linkArray.length == 0) {
          await API.deleteAll(originalDocId);
        } else {
          await API.addLinks(linkArray);
        }
        setOriginalDocId(-1);
        navigate(-1);
      } catch (error) {
        console.error("Error in adding connection:", error.message);
        throw new Error(
          "Unable to add the connection. Please check your connection and try again."
        );
      }
    }

    setIsModalVisible(false); // Hide modal after confirmation
  };

  // Close modal without saving changes
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getFilteredOptions = (docId) => {
    const currentConnections = links[docId] || [];
    return defaultConnectionOptions.filter(
      (option) => !currentConnections.includes(option)
    );
  };

  return (
    <div
      className={`${
        isDarkMode ? "dark" : "light"
      } min-h-screen background_color_light dark:bg-background_color px-3 text-black_text dark:text-white_text`}
    >
      {/* Navigation Bar */}
      <div className="flex items-center justify-between w-full h-16 mb-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => {
              setLinks(documents.map(() => "None")); // Reset connections
              setSearchQuery(""); // Reset search query
              navigate(-1); // Navigate back
            }}
            className="text-black_text dark:text-white_text text-base right-4 hover:text-gray-600"
          >
            <i className="bi bi-arrow-left text-2xl"></i>
          </button>

          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black_text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color w-60 py-2 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            {/* Filter Button */}
            <button
              className="text-black_text dark:text-white_text text-2xl"
              onClick={toggleFilterMenu}
            >
              <i className="bi bi-sort-down-alt"></i>
            </button>

            {/* Conditional Filter Menu */}
            {isFilterMenuOpen && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <FilterMenu
                  filterValues={filterValues}
                  setFilterValues={setFilterValues}
                  toggleFilterMenu={toggleFilterMenu}
                />
              </div>
            )}
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={handleDoneClick}
          className="bg-primary_color_light dark:bg-primary_color_dark hover:bg-[#2E6A8E66] transition text-black_text dark:text-white_text py-2 px-4 rounded-md"
        >
          <span>
            <i className="bi bi-file-earmark-plus"></i> Done
          </span>
        </button>
      </div>
      {/* Filter Labels */}
      <FilterLabels
        filterValues={filterValues}
        setFilterValues={setFilterValues}
      />

      <div className="flex flex-row gap-3">
        {/* Document List */}
        <div className="space-y-3 w-7/12">
          {documents
            .filter(
              (doc) =>
                !selectedDocuments.some(
                  (selectedDoc) => selectedDoc.id === doc.id
                )
            )
            .filter((doc) => links[doc.id] && links[doc.id].length === 0)
            .map((doc) => (
              <DocumentItem
                key={doc.id}
                title={doc.title}
                type={doc.type}
                date={doc.date}
                stakeholders={doc.stakeholders}
                connectionOptions={defaultConnectionOptions}
                selectedOption={
                  Array.isArray(links[doc.id]) ? links[doc.id] : []
                }
                onConnectionChange={(value) =>
                  handleConnectionChange(doc.id, value)
                }
                isDarkMode={isDarkMode}
              />
            ))}
        </div>

        <div className="px-3 py-3 space-y-3 w-5/12 rounded-md bg-gray-100 dark:bg-[#0e2430]">
          <p className="m-0 p-0 text-black_text dark:text-white_text text-xl font-normal">
            Connected Documents
          </p>
          {selectedDocuments
            .filter((doc) => links[doc.id] && links[doc.id].length > 0)
            .map((doc) => (
              <SelectedDocument
                docId={doc.id}
                key={doc.id}
                title={doc.title}
                type={doc.type}
                date={doc.date}
                stakeholders={doc.stakeholders}
                connectionOptions={defaultConnectionOptions}
                selectedOption={
                  Array.isArray(links[doc.id]) ? links[doc.id] : []
                }
                onConnectionChange={(value) =>
                  handleConnectionChange(doc.id, value)
                }
                getFilteredOptions={getFilteredOptions}
                isDarkMode={isDarkMode}
              />
            ))}
        </div>
      </div>
      {/* Confirmation Modal */}
      {isModalVisible && (
        <ConfirmationModal onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
};

const DocumentItem = ({
  title,
  type,
  date,
  stakeholders = [],
  connectionOptions = [],
  selectedOption = [],
  onConnectionChange,
  isDarkMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div
      className={`flex flex-wrap rounded-xl bg-document_item_radient_grey_light dark:bg-document_item_radient_grey p-3`}
    >
      {/* Connection Section */}
      <div className="flex flex-col w-3/12">
        <label>Connections:</label>
        {selectedOption.length > 0
          ? selectedOption.map((option, idx) => (
              <div key={idx} className="flex items-center">
                <span className="flex flex-row gap-2 rounded-lg px-3 py-1 bg-primary_color_light dark:bg-customPill text-black_text dark:text-white_text mr-2 mt-1">
                  {formatString(option)}
                  <button
                    className="text-my_red"
                    onClick={() => onConnectionChange(option)}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </span>
              </div>
            ))
          : null}
        {connectionOptions && (
          <div className="mt-3 gap-2 align-items-center relative">
            <button
              className="flex flex-row align-items-center drop-shadow-lg bg-[#FFFFFFaa] dark:bg-customGray3_30 text-black_text dark:text-white_text rounded-lg gap-2 px-2 py-1"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="bi bi-plus-circle text-base"></i>
              Add Connection
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-2 bg-[#FFFFFF60] dark:bg-customGray3_30 backdrop-blur-xl text-text_white rounded-xl drop-shadow-2xl z-10">
                {connectionOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer`}
                    onClick={() => {
                      onConnectionChange(option);
                      setDropdownOpen(false);
                    }}
                  >
                    {formatString(option)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Title and Type */}
      <div className="w-5/12 flex flex-row gap-3">
        {/* Vertical Line */}
        <div className="w-0.5 bg-white opacity-10"></div>

        <div className="w-[90%]">
          <div className="text-base mb-3 font-normal line-clamp-2">
            {formatString(title)}
          </div>
          <div className="text-sm font-light flex items-center">
            <img
              src={getIcon({ type: type }, { darkMode: isDarkMode })}
              className="w-8 mr-2"
              alt="type_icon"
            />
            {formatString(type)}
          </div>
        </div>
      </div>

      <div className="flex flex-col w-4/12 gap-2 justify-content-between align-items-end">
        {/* Date */}
        <div className="text-sm top-3 right-5 text-gray-400">{date}</div>

        {/* Stakeholders */}
        <div className="flex flex-wrap justify-content-end gap-2 bottom-4 right-5">
          {stakeholders &&
            stakeholders.map((stakeholder, idx) => (
              <span
                key={idx}
                className={`rounded-2xl px-3 py-1 text-sm text-white_text ${getStakeholderColor(
                  { stakeholder }
                )}`}
              >
                {formatString(stakeholder)}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

const SelectedDocument = ({
  docId,
  title,
  type,
  date,
  stakeholders,
  connectionOptions = [],
  selectedOption = [], // Default to an empty array if not provided
  onConnectionChange,
  getFilteredOptions,
  isDarkMode,
}) => {
  const filteredOptions = getFilteredOptions(docId);

  const [actualOption, setActualOption] = useState("None");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (filteredOptions && filteredOptions.length > 0) {
      setActualOption(filteredOptions[0]);
    }
  }, [filteredOptions]);

  return (
    <div
      className={`flex flex-row rounded-xl bg-document_item_radient_blue_light dark:bg-document_item_radient_blue p-3 gap-3`}
    >
      <div className="flex flex-col w-1/2 self-center">
        <label>Connections:</label>
        {selectedOption.map((option, idx) => (
          <div key={idx} className="flex items-center">
            <span className="flex flex-row align-items-center gap-2 rounded-md px-3 py-1 bg-customPill_light dark:bg-customPill text-black_text dark:text-white_text mr-2 mt-1">
              {formatString(option)}
              <button
                className="text-my_red text-xl"
                onClick={() => onConnectionChange(option)}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </span>
          </div>
        ))}
        {filteredOptions && filteredOptions.length > 0 && (
          <div className="mt-3 flex flex-row gap-2 align-items-center relative">
            <button
              className="flex flex-row align-items-center drop-shadow-lg bg-[#FFFFFFaa] dark:bg-customBlue text-black_text dark:text-white_text rounded-md gap-2 px-2 py-1"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="bi bi-plus-circle text-base"></i>
              Add Connection
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-2 bg-customGray3_30 backdrop-blur-xl text-black_text dark:text-white_text rounded-md drop-shadow-2xl z-10">
                {filteredOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer`}
                    onClick={() => {
                      onConnectionChange(option);
                      setDropdownOpen(false);
                    }}
                  >
                    {formatString(option)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-0.5 bg-white opacity-10"></div>
      <div className="mx-4 flex-col">
        <div className="text-base mb-3 font-normal line-clamp-2">
          {formatString(title)}
        </div>
        <div className="text-sm font-light flex items-center">
          <img
            src={getIcon({ type: type }, { darkMode: isDarkMode })}
            className="w-8 mr-2"
            alt="type_icon"
          />
          {formatString(type)}
        </div>
      </div>
    </div>
  );
};

SelectedDocument.propTypes = {
  docId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  date: PropTypes.string,
  stakeholders: PropTypes.arrayOf(PropTypes.string),
  connectionOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedOption: PropTypes.arrayOf(PropTypes.string),
  onConnectionChange: PropTypes.func.isRequired,
  getFilteredOptions: PropTypes.func.isRequired,
};

// Modal component for confirmation
const ConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="flex flex-col justify-items-center align-items-center bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-xl text-black_text dark:text-white_text font-sans p-6">
        <div className="text-xl font-bold">Edit connections?</div>
        <div className="flex justify-center space-x-3 mt-16">
          <button
            onClick={onCancel}
            className="bg-[#FFFFFFcc] dark:bg-customGray hover:bg-[#FFFFFFff] dark:hover:bg-[#938888] transition text-black w-40 h-16 opacity-60 px-4 py-2 rounded-xl text-xl"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className="bg-primary_color_light dark:bg-customBlue hover:bg-blue-300 dark:hover:bg-[#317199] transition text-black_text dark:text-white_text w-40 h-16 px-4 py-2 rounded-xl text-xl"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkDocuments;
