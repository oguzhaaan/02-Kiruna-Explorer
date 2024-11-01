import { useState } from "react";
import dayjs from "dayjs";
import "./document.css";
import Alert from "./Alert";

function Document() {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [stakeholder, setStakeholder] = useState("None");

    const [scale, setScale] = useState("");

    const [date, setDate] = useState("");

    const [type, setType] = useState("");

    const [language, setLanguage] = useState("");

    const [number, setNumber] = useState("");

    const [alertMessage, setAlertMessage] = useState(['', '']);


    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleStakeholder = (event) => {
        setStakeholder(event.target.value);
    };

    const handleScale = (event) => {
        setScale(event.target.value);
    }

    const handleDate = (event) => {
        const selectedDate = dayjs(event.target.value).format("YYYY-MM-DD");
        setDate(selectedDate);
    };

    const handleType = (event) => {
        setType(event.target.value);
    }

    const handleLanguage = (event) => {
        setLanguage(event.target.value);
    }

    const handleNumber = (event) => {
        setNumber(event.target.value);
    };

    const handleConfirm = () => {
            setAlertMessage(['FANCULOOOOOOO', 'success']); //integration TODO
    }


    return (
        <>
            <div className="bg-background_color min-h-screen flex justify-center">
                <Alert message={alertMessage[0]} type={alertMessage[1]} clearMessage={() => setAlertMessage(['', ''])}></Alert>
                <div className="flex items-center justify-between w-full h-16  ">

                    <div className="flex items-center gap-3 mr-3 ml-20 mt-4">


                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Search"
                                className="bg-search_color w-60 py-2 pl-10 pr-4 text-black rounded-[50px] focus:outline-none placeholder-black"
                            />
                        </div>

                        <button className="text-white text-2xl">
                            <i className="bi bi-sort-down-alt"></i>
                        </button>
                    </div>

                    <button onClick={toggleModal} className="bg-[#2E6A8E] text-white grid justify-items-end py-2 px-4 mx-3 rounded-[77px] mt-4">
                        <span><i className="bi bi-file-earmark-plus"></i>  Add document</span>
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit">

                    <div className="bg-box_color backdrop-blur-2xl drop-shadow-xl  w-1/3 p-6 h-2/3 overflow-y-auto rounded-lg flex flex-col items-center relative scrollbar-thin scrollbar-webkit">
                        <h2 className="text-white text-3xl font-bold ">Add New Document</h2>
                        <button onClick={toggleModal} className="absolute top-5 text-white text-xl right-4 hover:text-gray-600">
                            <i class="bi bi-x-lg"></i>
                        </button>

                        <div className="input-title mb-4 w-full">
                            <label className="text-white w-full ml-2 mb-1 text-xl text-left">Title</label>
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full px-3 text-xl py-2 text-black placeholder:text-placeholder_color border-none bg-input_color rounded-[40px]"
                            />
                        </div>

                        <div className="input-stakeholder mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Stakeholders</label>
                            <select
                                id="document-type"
                                value={stakeholder}
                                onChange={handleStakeholder}

                                className="w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px]">
                                <option value="none">None</option>
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        <div className="input-scale mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Scale</label>
                            <select
                                id="document-type"
                                value={scale}
                                onChange={handleScale}
                                className="w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px]">
                                <option value="none">None</option>
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        <div className="input-date mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Issuance date</label>
                            <input
                                id="document-date"
                                type="date"
                                value={date}
                                onChange={handleDate}
                                className="w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px]">
                            </input>
                        </div>

                        <div className="input-type mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Type</label>
                            <select
                                id="document-type"
                                value={type}
                                onChange={handleType}
                                className="w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px]">
                                <option value="none">None</option>
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        <div className="input-language mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Language</label>
                            <select
                                id="document-language"
                                value={language}
                                onChange={handleLanguage}
                                className="w-full px-3 text-xl py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color  rounded-[40px]">
                                <option value="none">None</option>
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>


                        <div className="input-number mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Enter a Number</label>
                            <input
                                id="number-input"
                                type="number"
                                value={number}
                                placeholder="Select a number"
                                onChange={handleNumber}
                                className="w-full text-xl px-3 py-2 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px]">
                            </input>
                        </div>

                        <div className="input-description mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Description</label>
                            <textarea
                                placeholder="Description"
                                className="w-full p-2 px-3 py-2 text-xl text-white border-gray-300 placeholder:text-placeholder_color bg-input_color"
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="input-map mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Georeference</label>
                            <button
                                onClick={() => { console.log("ok") }}
                                className="w-full p-2 text-xl text-black border border-gray-300 focus:outline-none bg-[#D9D9D9] rounded-[40px]"><i class="bi bi-globe-europe-africa"></i> Open the Map
                            </button>
                        </div>

                        <div className="input-link mb-4 w-full">
                            <label className="text-white mb-1 text-xl w-full ml-2 text-left">Linking</label>
                            <button
                                onClick={() => { console.log("ok") }}
                                className="w-full p-2 text-black border text-xl border-gray-300 focus:outline-none bg-[#D9D9D9] rounded-[40px]"> Select Documents to Link
                            </button>
                        </div>

                        {/* Save button */}
                        <button className="bg-[#1A5F88] w-full font-bold text-[28px]  text-white py-2 px-4 rounded-lg mt-4" onClick={handleConfirm}>
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export { Document };
