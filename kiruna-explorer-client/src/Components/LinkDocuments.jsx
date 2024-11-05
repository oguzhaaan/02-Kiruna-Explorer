import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getStakeholderColor } from "./Utilities/StakeholdersColors";
import { getIcon } from "./Utilities/DocumentIcons";

const LinkDocuments = ({
  originalDocId,
  mode = "return",
  setConnectionsInForm,
}) => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Default connection options for all documents
  const defaultConnectionOptions = [
    "None",
    "Projection",
    "Analysis",
    "Implementation",
  ];

  // Sample documents array with test data
  const documents = [
    {
      id: 2,
      title: 'Compilation of responses "So what the people of Kiruna think?',
      type: "agreement",
      date: "12/2024",
      stakeholders: ["municipality", "citizens"],
    },
    {
      id: 3,
      title: "Environmental Impact Study",
      type: "material effect",
      date: "11/2024",
      stakeholders: ["lkab", "regional authority"],
    },
    {
      id: 4,
      title: "City Development Plan",
      type: "informative",
      date: "10/2024",
      stakeholders: ["architecture firms", "others"],
    },
  ];

  // State to hold the connection types for each document
  const [connections, setConnections] = useState(documents.map(() => "None"));
  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState("");

  const handleConnectionChange = (index, value) => {
    const newConnections = [...connections];
    newConnections[index] = value;
    setConnections(newConnections);
  };

  // Generate connection array based on user selections
  const generateConnectionArray = () => {
    return documents.reduce((acc, doc, index) => {
      const connectionType = connections[index];
      if (connectionType !== "None") {
        const connectionObject =
          mode === "return"
            ? {
                selectedDocId: doc.id,
                connectionType,
                date: dayjs().format("YYYY-MM-DD"),
              }
            : {
                originalDocId,
                selectedDocId: doc.id,
                connectionType,
                date: dayjs().format("YYYY-MM-DD"),
              };
        acc.push(connectionObject);
      }
      return acc;
    }, []);
  };

  // Filter documents based on the search query and connection status
  const filteredDocuments = documents.filter((doc, index) => {
    const connectionType = connections[index];
    return (
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connectionType !== "None"
    );
  });

  // Show modal when "Done" is clicked
  const handleDoneClick = () => {
    setIsModalVisible(true);
  };

  // Confirm and log connection array when modal confirmation is clicked
  const handleConfirm = () => {
    const connectionArray = generateConnectionArray();

    if (mode === "return") {
      // In "return" mode, call the callback function with connectionArray
      if (setConnectionsInForm) {
        setConnectionsInForm(connectionArray);
      }
    } else if (mode === "save") {
      //
      // In "save" mode, make an API call to save the connections
    }

    console.log(connectionArray);
    setIsModalVisible(false); // Hide modal after confirmation
  };

  // Close modal without saving changes
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="min-h-screen bg-black p-5 text-white">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between w-full h-16 mb-5">
        <div className="flex items-center gap-3 mr-3 ml-2 mt-4">
          {/* Back Button */}
          <button
            onClick={() => {
              setConnections(documents.map(() => "None")); // Reset connections
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
              <i className="bi bi-search"></i>
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
          className="bg-[#2E6A8E] text-white py-2 px-4 mx-3 rounded-full mt-4"
        >
          <span>
            <i className="bi bi-file-earmark-plus"></i> Done
          </span>
        </button>
      </div>

      {/* Document List */}
      <div className="space-y-2">
        {filteredDocuments.map((doc, index) => (
          <DocumentItem
            key={doc.id}
            title={doc.title}
            type={doc.type}
            date={doc.date}
            stakeholders={doc.stakeholders}
            connectionOptions={defaultConnectionOptions}
            selectedOption={connections[index]}
            onConnectionChange={(value) => handleConnectionChange(index, value)}
          />
        ))}
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
  stakeholders,
  connectionOptions,
  selectedOption,
  onConnectionChange,
}) => {
  const backgroundColor =
    selectedOption === "None"
      ? "bg-document_item_radient_grey"
      : "bg-document_item_radient_blue";

  return (
    <div
      className={`flex flex-row rounded-3xl ${backgroundColor} p-4 relative`}
    >
      {/* Connection Section */}
      <div className="flex basis-1/6 flex-col self-center">
        <label>Connection:</label>
        <select
          className="rounded-full min-w-36 h-8 mt-1 pl-3 bg-customGray3_30 text-white"
          value={selectedOption}
          onChange={(e) => onConnectionChange(e.target.value)}
        >
          {connectionOptions.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Vertical Line */}
      <div className="w-0.5 h-28 bg-white opacity-10 mx-2"></div>

      {/* Document Title and Description */}
      <div className="mx-4 flex-col">
        <div className="text-2xl mb-4 font-normal">{title}</div>
        <div className="text-2xl font-light flex items-center">
          <img src={getIcon({ type })} className="w-8 mr-2" alt="type_icon" />
          {type}
        </div>
      </div>

      {/* Date */}
      <div className="absolute top-3 right-5 text-gray-400">{date}</div>

      {/* Stakeholders */}
      <div className="flex space-x-2 absolute bottom-3 right-5">
        {stakeholders.map((stakeholder, idx) => (
          <span
            key={idx}
            className={`rounded-full px-3 py-1 text-sm text-white ${getStakeholderColor(
              { stakeholder }
            )}`}
          >
            {stakeholder}
          </span>
        ))}
      </div>
    </div>
  );
};

// Modal component for confirmation
const ConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center ">
      <div className="flex flex-col items-center bg-box_color backdrop-blur-2xl drop-shadow-xl w-1/3 h-1/3 p-6 rounded-3xl text-white relative font-sans">
        <div className="text-2xl mb-4 font-bold">Add connections?</div>
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
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkDocuments;
