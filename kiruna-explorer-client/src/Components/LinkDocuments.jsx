import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getStakeholderColor } from "./Utilities/StakeholdersColors";
import { getIcon } from "./Utilities/DocumentIcons";
import API from "../API/API.mjs";
import PropTypes from 'prop-types';

function formatString(input) {
  return input
    .replace(/_/g, " ") // Replace underscores with spaces
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string
}

const LinkDocuments = ({ originalDocId, mode, setConnectionsInForm, setOriginalDocId }) => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [documents, setDocuments] = useState([]);

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
        let tempLinks = {};

        const allDocuments = await API.getAllDocuments();
        // Filter out the document with the same ID as originalDocId
        const mergedDocuments = allDocuments.filter(doc => {
          console.log("doc id: " + doc.id + ", original: " + originalDocId);
          // Verifica se il documento NON è presente in linkedDocument
          return doc.id != originalDocId
        });
        console.log(mergedDocuments);

        if (mode === "save") {

          setLinks(() => {

            if (linkedDocument) {
              mergedDocuments.forEach((doc) => {
                tempLinks[doc.id] = [];
              });
              linkedDocument.reduce((acc, link) => {
                const docId = link.id;
                const connectionType = link.connection;
                if (!tempLinks[docId]) {
                  tempLinks[docId] = [];
                }
                tempLinks[docId].push(connectionType);
                return tempLinks;
              }, {})
              return tempLinks
            } else {
              mergedDocuments.forEach((doc) => {
                tempLinks[doc.id] = [];
              });
              return tempLinks
            }
          }
          )
        }
        else {
          mergedDocuments.forEach((doc) => {
            tempLinks[doc.id] = [];
          });
          setLinks(tempLinks);
        }
        setDocuments(mergedDocuments);
      } catch (error) {
        console.error("Error in getAllDocuments function:", error.message);
        throw new Error(
          "Unable to get the documents. Please check your connection and try again."
        );
      }
    };

    fetchDocuments();
  }, [mode]);

  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState("");

  const handleConnectionChange = (docId, value) => {
    setLinks(prevLinks => {
      const currentConnections = prevLinks[docId] || [];
      if (currentConnections.includes(value)) {
        // Remove the connection if it already exists
        return {
          ...prevLinks,
          [docId]: currentConnections.filter(conn => conn !== value)
        };
      } else {
        // Add the new connection
        return {
          ...prevLinks,
          [docId]: [...currentConnections, value]
        };
      }
    });
  };

  // Generate link array based on user selections
  const generateLinkArray = () => {
    return Object.entries(links).reduce((acc, [docId, connectionTypes]) => {
      connectionTypes.forEach(connectionType => {
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

  // Filter documents based on the search query and connection status
  const filteredDocuments = documents.filter(doc => {
    return (
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
        }
        else {
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
    return defaultConnectionOptions.filter(option => !currentConnections.includes(option));
  };

  return (
    <div className="min-h-screen bg-background_color p-3 text-white">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between w-full h-14 mb-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => {
              setLinks(documents.map(() => "None")); // Reset connections
              setSearchQuery(""); // Reset search query
              navigate(-1); // Navigate back
            }}
            className="text-white text-xl right-4 hover:text-gray-600"
          >
            <i className="bi bi-arrow-left text-4xl"></i>
          </button>

          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="bi bi-search text-background_color"></i>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="bg-search_color w-60 py-2 pl-10 pr-4 text-black rounded-full focus:outline-none placeholder-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Button */}
          <button className="text-white text-4xl">
            <i className="bi bi-sort-down-alt"></i>
          </button>
        </div>

        {/* Done Button */}
        <button
          onClick={handleDoneClick}
          className="bg-[#2E6A8E] text-white py-2 px-4 rounded-full"
        >
          <span>
            <i className="bi bi-file-earmark-plus"></i> Done
          </span>
        </button>
      </div>

      <div className="flex flex-row gap-3">
        {/* Document List */}
        <div className="space-y-3 w-7/12">
          {documents && filteredDocuments.filter((doc) => links[doc.id] && links[doc.id].length === 0).map((doc) => (
            <DocumentItem
              key={doc.id}
              title={doc.title}
              type={doc.type}
              date={doc.date}
              stakeholders={doc.stakeholders}
              connectionOptions={defaultConnectionOptions}
              selectedOption={Array.isArray(links[doc.id]) ? links[doc.id] : []}
              onConnectionChange={(value) => handleConnectionChange(doc.id, value)}
            />
          ))}
        </div>

        <div className="px-3 py-3 space-y-3 w-5/12 rounded-2xl bg-[#0e2430]">
          <p className="m-0 p-0 text-white_text text-2xl font-bold">Connected Documents</p>
          {documents && filteredDocuments.filter((doc) => links[doc.id] && links[doc.id].length > 0).map((doc) => (
            <SelectedDocument
              docId={doc.id}
              key={doc.id}
              title={doc.title}
              type={doc.type}
              date={doc.date}
              stakeholders={doc.stakeholders}
              connectionOptions={defaultConnectionOptions}
              selectedOption={Array.isArray(links[doc.id]) ? links[doc.id] : []}
              onConnectionChange={(value) => handleConnectionChange(doc.id, value)}
              getFilteredOptions={getFilteredOptions}
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
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div
      className={`flex flex-row rounded-3xl bg-document_item_radient_grey p-3 relative`}
    >
      {/* Connection Section */}
      <div className="flex flex-col self-center">
        <label>Connections:</label>
        {selectedOption.length > 0 ? selectedOption.map((option, idx) => (
          <div key={idx} className="flex items-center">
            <span className="flex flex-row gap-2 rounded-full px-3 py-1 bg-customPill text-white mr-2 mt-1">
              {formatString(option)}
              <button
                className="text-my_red"
                onClick={() => onConnectionChange(option)}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </span>
          </div>
        )) : null}
        {connectionOptions &&
          <div className="mt-3 flex flex-row gap-2 align-items-center relative">
            <button
              className="flex flex-row align-items-center bg-customGray3_30 text-white rounded-full gap-2 px-2 py-1"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="bi bi-plus-circle-fill text-xl"></i>
              Add Connection
            </button>
            {dropdownOpen && (
              <div
                className="absolute top-full mt-2 bg-customGray3_30 backdrop-blur-xl text-text_white rounded-xl drop-shadow-2xl z-10">
                {connectionOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 hover:bg-gray-800 rounded-xl cursor-pointer`}
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
          </div>}
      </div>

      {/* Vertical Line */}
      <div className="w-0.5 bg-white opacity-10 ms-4 me-2"></div>

      {/* Document Title and Type */}
      <div className="mx-4 flex-col">
        <div className="text-xl mb-3 font-normal">{formatString(title)}</div>
        <div className="text-lg font-light flex items-center">
          <img src={getIcon({ type })} className="w-8 mr-2" alt="type_icon" />
          {formatString(type)}
        </div>
      </div>

      {/* Date */}
      <div className="absolute top-3 right-5 text-gray-400">{date}</div>

      {/* Stakeholders */}
      <div className="flex space-x-2 absolute bottom-4 right-5">
        {stakeholders && stakeholders.map((stakeholder, idx) => (
          <span
            key={idx}
            className={`rounded-full px-3 py-1 text-sm text-white ${getStakeholderColor(
              { stakeholder }
            )}`}
          >
            {formatString(stakeholder)}
          </span>
        ))}
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
    <div className={`flex flex-row rounded-3xl bg-document_item_radient_blue p-3 gap-3`}>
      <div className="flex flex-col w-1/2 self-center">
        <label>Connections:</label>
        {selectedOption.map((option, idx) => (
          <div key={idx} className="flex items-center">
            <span className="flex flex-row align-items-center gap-2 rounded-full px-3 py-1 bg-customPill text-white mr-2 mt-1">
              {formatString(option)}
              <button
                className="text-my_red text-2xl"
                onClick={() => onConnectionChange(option)}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </span>
          </div>
        ))}
        {filteredOptions && filteredOptions.length > 0 &&
          <div className="mt-3 flex flex-row gap-2 align-items-center relative">
            <button
              className="flex flex-row align-items-center bg-customBlue text-white rounded-full gap-2 px-2 py-1"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="bi bi-plus-circle-fill text-xl"></i>
              Add Connection
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-2 bg-customGray3_30 backdrop-blur-xl text-text_white rounded-xl drop-shadow-2xl z-10">
                {filteredOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 hover:bg-gray-800 rounded-xl cursor-pointer`}
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
          </div>}
      </div>
      <div className="w-0.5 bg-white opacity-10"></div>
      <div className="mx-4 flex-col">
        <div className="text-xl mb-3 font-normal">{formatString(title)}</div>
        <div className="text-lg font-light flex items-center">
          <img src={getIcon({ type })} className="w-8 mr-2" alt="type_icon" />
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
      <div
        className="flex flex-col justify-items-center align-items-center bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-3xl text-white font-sans p-6">
        <div className="text-2xl font-bold">Edit connections?</div>
        <div className="flex justify-center space-x-3 mt-16">
          <button
            onClick={onCancel}
            className="bg-customGray text-black w-40 h-16 opacity-60 px-4 py-2 rounded-full text-2xl"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className="bg-customBlue  text-white w-40 h-16 px-4 py-2 rounded-full text-2xl"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkDocuments;
