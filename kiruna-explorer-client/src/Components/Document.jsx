import { useState } from "react";
import dayjs from "dayjs";


function Document() {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [stakeholder, setStakeholder] = useState("None");

    const [scale, setScale] = useState("");

    const [date, setDate] = useState("");

    const [type, setType] = useState("");

    const [language, setLanguage] = useState("");

    const [number, setNumber] = useState("");




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


    return (
        <>
            <div className="bg-[#0A0A0A] min-h-screen flex justify-center">
                <div className="flex items-center justify-between w-full h-16 ">

                    <div className="flex items-center gap-3 mx-3">
                        <button className="text-white text-2xl">
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Search"
                                className="bg-[#F4F4F4] w-60 py-2 pl-10 pr-4 text-black rounded-[50px] focus:outline-none placeholder-black"
                            />
                        </div>

                        <button className="text-white text-2xl">
                            <i className="bi bi-sort-down-alt"></i>
                        </button>
                    </div>

                    <button onClick={toggleModal} className="bg-[#2E6A8E] text-white grid justify-items-end py-2 px-4 mx-3 rounded-[77px]">
                        <i className="bi bi-file-earmark-plus"> Add document</i>
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center scrollbar-thin scrollbar-webkit">

                    <div className="bg-[#373737] w-96 p-6 h-2/3 overflow-y-auto rounded-lg flex flex-col items-center relative scrollbar-thin scrollbar-webkit">
                        <h2 className="text-white text-[20px] font-bold ">Add New Document</h2>
                        <button onClick={toggleModal} className="absolute top-5 text-white text-xl right-4 hover:text-gray-600">
                            <i class="bi bi-x-lg"></i>
                        </button>

                        <div className="input-title mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Title</label>
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9] rounded-[40px]"
                            />
                        </div>

                        <div className="input-stakeholder mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Stakeholders</label>
                            <select
                                id="document-type"
                                value={stakeholder}
                                onChange={handleStakeholder}
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9] rounded-[40px]"
                            >
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        <div className="input-scale mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Scale</label>
                            <select
                                id="document-type"
                                value={scale}
                                onChange={handleScale}
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9] rounded-[40px]"
                            >
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        <div className="input-date mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Issuance date</label>
                            <input
                                id="document-date"
                                type="date"
                                value={date}
                                onChange={handleDate}
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9] rounded-[40px]"
                            />
                        </div>

                        <div className="input-type mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Type</label>
                            <select
                                id="document-type"
                                value={type}
                                onChange={handleType}
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9] rounded-[40px]"
                            >
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        <div className="input-language mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Language</label>
                            <select
                                id="document-language"
                                value={language}
                                onChange={handleLanguage}
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9] rounded-[40px]"
                            >
                                <option value="report">Report</option>
                                <option value="invoice">Invoice</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>


                        <div className="input-number mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Enter a Number</label>
                            <input
                                id="number-input"
                                type="number"
                                value={number}
                                placeholder="Select a number"
                                onChange={handleNumber}
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9] rounded-[40px]"
                            />
                        </div>

                        <div className="input-description mb-2 w-full">
                            <label className="text-white text-sm w-full ml-2 text-left">Description</label>
                            <textarea
                                placeholder="Description"
                                className="w-full p-2 text-black border border-gray-300 placeholder:text-gray-500 focus:outline-none opacity-30 bg-[#D9D9D9]"
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="input-map mb-2 w-full">
                        <label className="text-white text-sm w-full text-left">Georeference</label>
                        <button
                            onClick={() => {console.log("ok")}}
                            className="w-full p-2 text-black border border-gray-300 focus:outline-none bg-[#D9D9D9] rounded-[40px]"><i class="bi bi-globe-europe-africa"></i> Open the Map
                        </button>
                        </div>

                        <div className="input-link mb-2 w-full">
                        <label  className="text-white text-sm w-full text-left">Linking</label>
                        <button
                            onClick={() => {console.log("ok")}}
                            className="w-full p-2 text-black border border-gray-300 focus:outline-none bg-[#D9D9D9] rounded-[40px]"> Select Documents to Link
                        </button>
                        </div>

                        {/* Save button */}
                        <button className="bg-[#1A5F88] w-full font-bold text-[28px]  text-white py-2 px-4 rounded-lg mt-4">
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Document;
