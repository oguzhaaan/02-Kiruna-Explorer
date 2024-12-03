import { useState, useEffect } from "react";
import "./document.css";
import Alert from "./Alert.jsx";
import { SingleDocument } from "./SingleDocument.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import API from "../API/API.mjs";

import FilterMenu from "./FilterMenu.jsx";
import FilterLabels from "./FilterLabels.jsx";
import AddDocumentForm from "./AddDocumentForm.jsx";
import DocumentItem from "./DocumentItem.jsx";

function DocumentsPage(props) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [documents, setDocuments] = useState([]);

  // --- Search ---
  const [searchQuery, setSearchQuery] = useState(""); // User's input
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
  // --- Filter ---
  const [filterValues, setFilterValues] = useState({
    type: "",
    stakeholders: [],
    startDate: "",
    endDate: "",
  });
  // --- Update Documents List ---
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
    const fetchFilteredDocuments = async (filters) => {
      try {
        const data = await API.getFilteredDocuments(filters);
        setDocuments(data);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchFilteredDocuments({ ...filterValues, title: debouncedQuery });
  }, [filterValues, debouncedQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalNumberOfPages, setTotalNumberOfPages] = useState(1);
  const numberOfDocumentsInPage = 5;
  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };
  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // --- others ---
  const [alertMessage, setAlertMessage] = useState(["", ""]);

  useEffect(() => {
    props.setNavShow(true);
  }, []);

  const toggleModal = () => {
    props.setIsModalOpen(!props.isModalOpen);
  };

  return (
    <div className={isDarkMode ? "dark" : "light"}>
      <div className="bg-background_color_white dark:bg-background_color min-h-screen flex flex-col items-center">
        <SingleDocument
          updateAreaId={props.updateAreaId}
          setUpdateAreaId={props.setUpdateAreaId}
          setNavShow={props.setNavShow}
          municipalGeoJson={props.municipalGeoJson}
          setMode={props.setMode}
          setoriginalDocId={props.setoriginalDocId}
          setAlertMessage={setAlertMessage}
          setShowArea={props.setShowArea}
        ></SingleDocument>
        <Alert
          message={alertMessage[0]}
          type={alertMessage[1]}
          clearMessage={() => setAlertMessage(["", ""])}
        ></Alert>
        <div className="sticky-top w-full bg-[#f3f3f3ef] dark:bg-[#313131ef] rounded-b-md px-20">
          <div className="flex flex-row justify-content-between align-items-center h-16  w-full">
            <div className="flex flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="z-[0] relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black_text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  className="outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color lg:md:w-72 sm:w-48 py-2 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row justify-content-end gap-3 align-items-center left-2">
              {/* Add document Button */}
              <button
                onClick={toggleModal}
                className="bg-primary_color_light dark:bg-primary_color_dark hover:bg-[#2E6A8E66] transition text-black_text dark:text-white_text flex flex-row gap-2 justify-items-end py-2 px-3 rounded-md"
              >
                <i className="bi bi-file-earmark-plus"></i>
                <p className="text-base m-0 p-0 lg:inline-block md:inline-block sm:hidden">
                  Add document
                </p>
              </button>

              {/* Change Theme Button */}
              <button
                className="text-black_text dark:text-white_text grid justify-items-center transition-transform transform hover:scale-105 active:scale-95"
                onClick={() => {
                  toggleTheme();
                }}
              >
                <div className="flex justify-center items-center gap-2 relative">
                  <i
                    className="bi bi-sun-fill transition-opacity duration-300 ease-in-out text-2xl"
                    style={{ opacity: isDarkMode ? 0.2 : 1 }}
                  ></i>
                  <i
                    className="bi bi-moon-fill transition-opacity duration-300 ease-in-out text-2xl"
                    style={{ opacity: isDarkMode ? 1 : 0.2 }}
                  ></i>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full">
          <div className="flex flex-col mt-8 mx-7 w-1/4">
            {/* Filter Menu */}
            <FilterMenu
              filterValues={filterValues}
              setFilterValues={setFilterValues}
            />
            {/* Page selection */}
            <div className="flex flex-row items-center justify-between py-2 text-black_text dark:text-white_text bg-box_white_color dark:bg-box_color mt-24 rounded-lg">
              <i
                className="ml-3 bi bi-arrow-left cursor-pointer text-3xl"
                onClick={previousPage}
              />
              <div className="text-xl">
                <span className="bg-slate-400 rounded-md px-2">{currentPage}</span>
                <span className="mx-2 px-2">of</span>
                <span className="px-2">{totalNumberOfPages}</span>
              </div>

              <i
                className="mr-3 bi bi-arrow-right cursor-pointer  text-3xl"
                onClick={nextPage}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 w-3/4 overflow-y-scroll mr-7">
            {/* Filter Labels */}
            <div className="w-full">
              <FilterLabels
                filterValues={filterValues}
                setFilterValues={setFilterValues}
              />
            </div>
            {/* Documents List */}
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                documentId={doc.id}
                title={doc.title}
                type={doc.type}
                date={doc.date}
                stakeholders={doc.stakeholders}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Document Form */}
      {props.isModalOpen && (
        <AddDocumentForm
          updateAreaId={props.updateAreaId}
          setUpdateAreaId={props.setUpdateAreaId}
          setoriginalDocId={props.setoriginalDocId}
          setMode={props.setMode}
          connections={props.connections}
          setConnections={props.setConnections}
          setNavShow={props.setNavShow}
          setIsModalOpen={props.setIsModalOpen}
          isModalOpen={props.isModalOpen}
          newAreaId={props.newAreaId}
          setnewAreaId={props.setnewAreaId}
          setNewDocument={props.setNewDocument}
          newDocument={props.newDocument}
          setAlertMessage={setAlertMessage}
          toggleModal={toggleModal}
        />
      )}
    </div>
  );
}

export default DocumentsPage;
