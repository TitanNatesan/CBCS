import React, { useState } from "react";
import axios from "axios";

export default function BulkUpload() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "BulkCourseUpload");

        try {
            const response = await axios.post("http://127.0.0.1:8000/hodDash/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Token ${token}`, // Add your token here
                },
            });
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Bulk Upload</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload CSV</h2>
                <form onSubmit={handleSubmit}>
                    <input type="file" name="file" onChange={handleFileChange} />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">
                        Upload
                    </button>
                </form>
            </div>
        </div>
    );
}