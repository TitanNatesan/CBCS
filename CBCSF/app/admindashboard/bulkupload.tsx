"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export default function BulkUpload() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const file = e.target.files?.[0];

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setErrorMessage("Please upload a valid Excel file (.xlsx).");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const binaryStr = event.target?.result;
        if (!binaryStr) return;

        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const formattedData = jsonData.map((row: any) => ({
          program: row["Program"],
          semester: row["Semester"],
          batch: row["Batch"],
          name: row["Subject Name"],
          code: row["Subject Code"],
          courseCredit: row["Course Credit"],
          is_optional: row["Is Optional"] === "Yes",
        }));

        setLoading(true);

        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:8000/courses/hodDash/",
          { courses: formattedData },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (response.status === 201) {
          toast.success("Courses uploaded successfully!", {
            position: "top-right",
          });
          // Clear the selected file after successful upload
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          toast.error("Failed to upload courses.");
        }
      } catch (error) {
        console.error("Error uploading courses:", error);
        toast.error("Failed to process the file. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
    setSelectedFile(file);
  };

  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Program: "",
        Semester: "",
        Batch: "",
        "Subject Name": "",
        "Subject Code": "",
        "Course Credit": "",
        "Is Optional": "",
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "coursedata.xlsx");
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrorMessage("");
  };

  return (
    <div className="my-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bulk Upload Courses
      </h3>
      <div className="flex items-center">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="flex-grow text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <button
            onClick={handleClearFile}
            className="ml-2 bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm"
            title="Clear selected file"
          >
            Clear
          </button>
        )}
      </div>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      {loading && (
        <div className="mt-4 text-center">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600 mx-auto"
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
        </div>
      )}
      <button
        onClick={handleDownloadTemplate}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download Excel Template
      </button>
    </div>
  );
}
