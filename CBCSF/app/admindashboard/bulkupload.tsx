"use client";

import React, { useState } from "react";
import axios from "axios";
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

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setErrorMessage("Invalid file format. Please upload an Excel file with .xlsx or .xls extension.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("type", "BulkCourseUpload");
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/hodDash/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 201) {
        // Display success messages
        if (response.data.details.success?.length > 0) {
          response.data.details.success.forEach((msg: string) => {
            toast.success(msg);
          });
        }

        // Display error messages
        if (response.data.details.error?.length > 0) {
          response.data.details.error.forEach((msg: string) => {
            toast.error(msg);
          });
        }

      } else {
        toast.error("Failed to upload courses. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bulk Upload Courses
      </h3>

      <form onSubmit={(e) => {
        e.preventDefault();
        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput.files?.length) {
          handleFileUpload({ target: fileInput } as React.ChangeEvent<HTMLInputElement>);
        }
      }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload
        </button>
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </form>
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

      <input
        type="button"
        value="Download Template"
        onClick={() => {
          const link = document.createElement("a");
          link.href = "/coursedata.xlsx";
          link.download = "coursedata.xlsx";
          link.click();
        }}
        className="px-4 py-2 mt-4 bg-green-600 text-white rounded"
      />
    </div>
  );
}
