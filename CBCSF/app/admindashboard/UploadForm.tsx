"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import BulkUpload from "./bulkupload";

interface Program {
  id: number;
  name: string;
  duration: number;
  department: {
    name: string;
  };
}

interface Batch {
  id: number;
  start: number;
  end: number;
}

export default function CourseRegistrationForm() {
  const [formData, setFormData] = useState({
    program: "",
    semester: "",
    batch: "",
    subjectName: "",
    subjectCode: "",
    courseCredit: 0,
    isOptional: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [department, setDepartment] = useState("");
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [batchs, setBatchs] = useState<Batch[]>([]);
  const [totalSem, setTotalSem] = useState(4);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  const token = localStorage.getItem("token");

  const fetchPrograms = async (): Promise<void> => {
    try {
      const response = await axios.get(
        "http://192.168.87.151:8000/adminDash/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setPrograms(response.data["programs"]);
      setDepartment(response.data["department"]);
      setAllPrograms(response.data["allprograms"]);
      setBatchs(response.data["batch"]);
    } catch (error) {
      console.error("There was an error fetching the programs!", error);
      toast.error("Failed to fetch programs");
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []); // Empty array to prevent re-running on each render.

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "program") {
      const selectedProgram = programs.find(
        (p: Program) => p.id == Number(value)
      );
      setTotalSem(selectedProgram ? selectedProgram.duration : 8);
    }
  };

  const handleToggle = (departmentId: number) => {
    setSelectedDepartments((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.semester || !formData.subjectName || !formData.subjectCode) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const semesterNumber = Number(formData.semester);
    if (isNaN(semesterNumber) || semesterNumber <= 0) {
      setErrorMessage("Semester must be a positive number.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.87.151:8000/courses/",
        {
          course_id: 1,
          semester: formData.semester,
          name: formData.subjectName,
          code: formData.subjectCode,
          program: formData.program,
          courseCredit: formData.courseCredit,
          is_optional: formData.isOptional,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setFormData({
        program: "",
        semester: "",
        batch: "",
        subjectName: "",
        subjectCode: "",
        courseCredit: 0,
        isOptional: false,
      });
      setSelectedDepartments([]);

      if (response.status === 201) {
        toast.success("Course created successfully", { position: "top-right" });
      } else {
        toast.error("Failed to create course");
      }
    } catch (error) {
      console.error("There was an error updating the course!", error);
      setErrorMessage(
        "There was an error updating the course. Please try again."
      );
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Department of {department}
          </h2>
          <h3 className="text-lg text-gray-600 mb-6">Course Registration</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="program"
                  className="block text-sm font-medium text-gray-700"
                >
                  Program
                </label>
                <select
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-gray-700"
                >
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Semester</option>
                  {[...Array(totalSem * 2)].map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="batch"
                  className="block text-sm font-medium text-gray-700"
                >
                  Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a Batch</option>
                  {batchs.map((batch) => {
                    const startYear = batch.start.toString().split("-")[0];
                    const endYear = batch.end.toString().split("-")[0];
                    return (
                      <option key={batch.id} value={batch.id}>
                        {startYear} - {endYear}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label
                  htmlFor="subjectName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject Name
                </label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="subjectCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject Code
                </label>
                <input
                  type="text"
                  id="subjectCode"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="courseCredit"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course Credit
                </label>
                <input
                  type="number"
                  id="courseCredit"
                  name="courseCredit"
                  value={formData.courseCredit}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
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
                  "Submit"
                )}
              </button>
            </div>
          </form>
          <BulkUpload />
        </div>
      </div>
    </div>
  );
}
