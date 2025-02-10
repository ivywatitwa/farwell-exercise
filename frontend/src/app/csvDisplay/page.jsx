"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const CsvDataDisplay = () => {
    const [csvDataList, setCsvDataList] = useState([]);
    const [selectedCsvId, setSelectedCsvId] = useState(null);
    const [csvContent, setCsvContent] = useState({ header: [], data: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCsvDataList = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8000/api/csv/data", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCsvDataList(response.data);
            } catch (err) {
                setError(err.message || "Failed to fetch CSV data list.");
            }
        };

        fetchCsvDataList();
    }, []);

    const handleCsvSelection = async (id) => {
        setSelectedCsvId(id);
        setIsLoading(true);
        setError(null);
        setCsvContent({ header: [], data: [] }); 

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8000/api/csv/content/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCsvContent({ header: response.data.header, data: response.data.data });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch CSV content.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white dark:bg-gray-900 py-8">
            <div className="container mx-auto">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                    CSV Data Display
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                    {/* CSV List */}
                    <div className="w-full md:w-1/4">
                        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Uploaded CSVs
                        </h2>
                        <ul>
                            {csvDataList.map((csv) => (
                                <li key={csv.id} className="py-2">
                                    <button
                                        onClick={() => handleCsvSelection(csv.id)}
                                        className={`text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 ${selectedCsvId === csv.id ? 'font-semibold' : ''}`}
                                    >
                                        CSV ID: {csv.id} {/* Display ID instead of file name */}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CSV Content Display */}
                    <div className="w-full md:w-3/4">
                        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CSV Content
                        </h2>

                        {isLoading ? (
                            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                        ) : (
                            <>
                                {csvContent.header.length > 0 && csvContent.data.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full leading-normal">
                                            <thead>
                                                <tr>
                                                    {csvContent.header.map((header, index) => (
                                                        <th
                                                            key={index}
                                                            className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                                        >
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvContent.data.map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {csvContent.header.map((header, colIndex) => (
                                                            <td
                                                                key={colIndex}
                                                                className="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-900 dark:border-gray-700"
                                                            >
                                                                <p className="text-gray-900 whitespace-no-wrap dark:text-white">{row[header] || ''}</p>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {selectedCsvId
                                            ? "No data to display for the selected CSV."
                                            : "Select a CSV from the list to view its content."}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CsvDataDisplay;