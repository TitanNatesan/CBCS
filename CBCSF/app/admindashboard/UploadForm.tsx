"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx"; // Import XLSX for file handling

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
  start_year: number;
  end_year: number;
}

export default function CourseRegistration() {
  const [formData, setFormData] = useState({
    program: "",
    semester: "",
    batch: "",
    subjectName: "",
    subjectCode: "",
    courseCredit: 0,
    isOptional: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  // API Data States
  const [programs, setPrograms] = useState<Program[]>([]);
  const [department, setDepartment] = useState("");
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [batchs, setBatchs] = useState<Batch[]>([]);
  const [totalSem, setTotalSem] = useState(8);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPrograms = async (): Promise<void> => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/adminDash/", {
          headers: { Authorization: `Token ${token}` },
        });
        setPrograms(response.data["programs"]);
        setDepartment(response.data["department"]);
        setAllPrograms(response.data["allprograms"]);
        setBatchs(response.data["batch"]);
      } catch (error) {
        console.error("There was an error fetching the programs!", error);
        toast.error("Failed to fetch programs");
      }
    };

    fetchPrograms();
  }, [token]);

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
      const selectedProgram = programs.find((p) => p.id === Number(value));
      setTotalSem(selectedProgram ? selectedProgram.duration * 2 : 8); // Assuming each year has 2 semesters
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleToggle = (departmentId: number) => {
    setSelectedDepartments((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        "http://127.0.0.1:8000/courses/",
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

      if (response.status === 201) {
        toast.success("Course created successfully", { position: "top-right" });
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
      }
    } catch (error) {
      console.error("There was an error creating the course!", error);
      setErrorMessage(
        "There was an error creating the course. Please try again."
      );
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  interface CourseData {
    course_id: number; // Add course_id here
    semester: number;
    name: string;
    code: string;
    program: string;
    courseCredit: number;
    is_optional: boolean;
  }

  const createSingleCourse = async (courseData: CourseData) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/courses/",
        {
          course_id: courseData.course_id, // Use course_id from CourseData
          semester: courseData.semester,
          name: courseData.name,
          code: courseData.code,
          program: courseData.program,
          courseCredit: courseData.courseCredit,
          is_optional: courseData.is_optional,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return response.status === 201;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  };

  const handleBulkUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          // Skip header row and process each row
          const courses = rows.slice(1).map((row: any) => ({
            course_id: row[0], // Assume course_id is the first column
            semester: row[1],
            name: row[2],
            code: row[3],
            program: row[4],
            courseCredit: row[5],
            is_optional: row[6] === "yes",
          }));

          let successCount = 0;
          let failedCount = 0;

          // Process each course one by one
          for (const course of courses) {
            try {
              await createSingleCourse(course);
              successCount++;
              // Show progress toast
              toast.success(
                `Processed ${successCount} of ${courses.length} courses`,
                {
                  duration: 2000,
                  position: "top-right",
                }
              );
            } catch (error) {
              failedCount++;
              toast.error(`Failed to create course: ${course.name}`, {
                position: "top-right",
              });
            }
          }

          // Show final summary
          toast.success(
            `Bulk upload completed: ${successCount} succeeded, ${failedCount} failed`,
            {
              position: "top-right",
            }
          );
        } catch (error) {
          console.error("Error processing file:", error);
          toast.error("Error processing file. Please check the format.");
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error("Bulk upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Manual Registration Form */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Department of {department}
            </h2>
            <h3 className="text-lg text-gray-600 mb-6">
              Manual Course Registration
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-6">
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
                    {[...Array(totalSem)].map((_, index) => (
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
                    {batchs.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.start_year} - {batch.end_year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="subjectName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course Name
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
                    Course Code
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

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Course Access
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Select departments that can access this course:
                </p>
                <div className="space-y-2">
                  {allPrograms.map((program) => (
                    <label
                      key={program.id}
                      className="inline-flex items-center"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-indigo-600"
                        checked={selectedDepartments.includes(program.id)}
                        onChange={() => handleToggle(program.id)}
                      />
                      <span className="ml-2 text-gray-700">
                        {program.name} ({program.department.name})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="text-sm text-red-600">{errorMessage}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Manual Entry"}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bulk Course Registration
            </h3>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Excel or CSV File (.xls, .xlsx, .csv)
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".xls,.xlsx,.csv"
                  onChange={handleFileChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Please ensure your file follows the required format with
                  columns for program, semester, subject name, subject code, and
                  course credit.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Uploading..." : "Upload File"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
