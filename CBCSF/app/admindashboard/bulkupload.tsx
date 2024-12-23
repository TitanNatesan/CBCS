"use client";

import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export default function BulkUpload() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

        // Parse the Excel file
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Format the data for the API
        const formattedData = jsonData.map((row: any) => ({
          program: row["Program"], // Assuming Excel column name is "Program"
          semester: row["Semester"], // Assuming Excel column name is "Semester"
          batch: row["Batch"], // Assuming Excel column name is "Batch"
          name: row["Subject Name"], // Assuming Excel column name is "Subject Name"
          code: row["Subject Code"], // Assuming Excel column name is "Subject Code"
          courseCredit: row["Course Credit"], // Assuming Excel column name is "Course Credit"
          is_optional: row["Is Optional"] === "Yes", // Assuming Excel column name is "Is Optional"
        }));

        setLoading(true);

        // Send the formatted data to your API
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://192.168.87.151:8000/courses/bulk-upload/",
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
  };

  return (
    <div className="my-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bulk Upload Courses
      </h3>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
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
    </div>
  );
}
