"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function StudentBulkRegister(props: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [program, setProgram] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // Validate file type (xls, xlsx, csv)
    if (file && !file.name.match(/\.(xls|xlsx|csv)$/)) {
      toast.error("Please upload a valid Excel or CSV file (.xls, .xlsx, .csv)");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };
  const token = localStorage.getItem("token")
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!program) {
      toast.error("Please select a program.");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("program", program);
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/studentblukregister/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`, // Add the token here
          },
        }
      );

      toast.success("File uploaded successfully!");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };
  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/studentdata.xlsx';
    link.download = 'student_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Upload Excel/CSV File for Student Registration
        </h2>
        <div className="mb-4 font-black">
          <label htmlFor="program" className="block text-sm font-medium text-gray-700">
            Select a Program
          </label>
          <select
            id="program"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="">Select a program</option>
            {props.program?.map((prog: any) => (
              <option key={prog.id} value={prog.id}>
                {prog.name} - {prog.department.name}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Select Excel or CSV File (.xls, .xlsx, .csv)
            </label>
            <input
              type="file"
              id="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Upload"
            )}
          </button>
        </form>
      </div>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-xl p-8">
          <button
            onClick={downloadTemplate}
            className="mb-6 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Download Template File
          </button>
          {/* Rest of your existing JSX */}
        </div>
      </div>

    </div>
  );
}



