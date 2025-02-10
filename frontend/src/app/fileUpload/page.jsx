"use client";
import React, { useState } from "react";
import axios from "axios";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("Please select a CSV file.");
            return;
        }

        const formData = new FormData();
        formData.append("csv_data", file);

        try {
            const token = localStorage.getItem("token");
            setIsLoading(true);
            const response = await axios.post(
                "http://localhost:8000/api/upload-csv", 
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    },
                }
            );
            setMessage(response.data.message || "File uploaded successfully!");
        } catch (error) {
            setMessage(error.response?.data?.message || "Error uploading file.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white ">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Upload CSV
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleUpload}>
                            <div>
                                <label
                                    htmlFor="csv_data"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    CSV File
                                </label>
                                <input
                                    type="file"
                                    name="csv_data"
                                    id="csv_data"
                                    onChange={handleFileChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                disabled={isLoading}
                            >
                                {isLoading ? "Uploading..." : "Upload"}
                            </button>
                        </form>
                        {message && (
                            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Upload;
