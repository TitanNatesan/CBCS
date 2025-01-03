import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Printer } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import PrintableStudentDetails from "./PrintableStudentDetails"; // Import your print component

interface Student {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  department: {
    name: string;
  };
  enrolled_courses: Array<{
    id: number;
    course: {
      name: string;
      code: string;
      semester: string;
      is_optional: boolean;
      courseCredit: number;
    };
  }>;
}

type ActionStatus = "Pending" | "Accept" | "Rejection";

interface StudentAction {
  status: ActionStatus;
  reason?: string;
  isSaved?: boolean;
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentActions, setStudentActions] = useState<
    Record<number, StudentAction>
  >({});
  const [saveStatus, setSaveStatus] = useState<Record<number, string>>({});
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/students/", {
        headers: { Authorization: `token ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students", error);
      // Set demo data on error
      setStudents(generatedemoStudents());
    }
  };

  const fetchIndividualStudent = async (sid: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/getdetails/${sid}/`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      if (response.data && response.data.student) {
        setSelectedStudent(response.data["student"]);
      } else {
        setSelectedStudent(generatedemoStudent(sid));
      }
    } catch (error) {
      console.error("Error fetching individual student", error);
      setSelectedStudent(generatedemoStudent(sid));
    }
  };

  const generatedemoStudent = (sid: number): Student => ({
    id: sid,
    username: `demo_user_${sid}`,
    email: `demo_email_${sid}@example.com`,
    phone: "123-456-7890",
    address: `${sid} demo Street, demotown`,
    department: {
      name: "demo Department",
    },
    enrolled_courses: [
      {
        id: 1,
        course: {
          name: "demo Course 1",
          code: "FC101",
          semester: "1",
          is_optional: false,
          courseCredit: 3,
        },
      },
      {
        id: 2,
        course: {
          name: "demo Course 2",
          code: "FC102",
          semester: "2",
          is_optional: true,
          courseCredit: 4,
        },
      },
    ],
  });

  const generatedemoStudents = (): Student[] => [
    generatedemoStudent(1),
    generatedemoStudent(2),
    generatedemoStudent(3),
    generatedemoStudent(4),
    generatedemoStudent(5),
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleBackToList = () => setSelectedStudent(null);

  const calculateTotalCredits = (courses: Student["enrolled_courses"]) => {
    return courses.reduce(
      (total, enrolled) => total + enrolled.course.courseCredit,
      0
    );
  };

  const handlePrint = () => {
    if (selectedStudent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(
          "<html><head><title>Student Details</title>"
        );
        printWindow.document.write(`
          <style>
            @media print {
              body { padding: 20px; font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              @page { margin: 0.5in; }
            }
          </style>
        `);
        printWindow.document.write("</head><body></body></html>");
        printWindow.document.close();

        const printContent = printWindow.document.body.appendChild(
          document.createElement("div")
        );

        // Render PrintableStudentDetails into the print window
        const { createRoot } = require("react-dom/client");
        const root = createRoot(printContent);
        root.render(<PrintableStudentDetails student={selectedStudent} />);

        // Print the window after rendering
        printWindow.onload = function () {
          printWindow.print();
          printWindow.onafterprint = function () {
            printWindow.close();
          };
        };
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionChange = (studentId: number, status: ActionStatus) => {
    setStudentActions((prev) => ({
      ...prev,
      [studentId]: {
        status,
        reason: prev[studentId]?.reason || "",
        isSaved: false,
      },
    }));
    // Reset save status when action changes
    setSaveStatus((prev) => ({ ...prev, [studentId]: "" }));
  };

  const handleReasonChange = (studentId: number, reason: string) => {
    setStudentActions((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], reason, isSaved: false },
    }));
    // Reset save status when reason changes
    setSaveStatus((prev) => ({ ...prev, [studentId]: "" }));
  };

  const handleSave = (studentId: number) => {
    const action = studentActions[studentId];
    if (
      action.status === "Rejection" &&
      (!action.reason || action.reason.trim() === "")
    ) {
      alert("Please provide a reason for rejection.");
      return;
    }

    // Here, you can implement the API call to save the action.
    // For demonstration, we'll just update the saveStatus state.

    // Example API call (uncomment and modify as needed):
    /*
    axios.post(`http://localhost:8000/students/${studentId}/action/`, {
      status: action.status,
      reason: action.reason,
    }, {
      headers: { Authorization: `token ${token}` },
    })
    .then(response => {
      setSaveStatus(prev => ({ ...prev, [studentId]: "Saved successfully!" }));
      // Optionally, update the student list or perform other actions
    })
    .catch(error => {
      console.error("Error saving action", error);
      setSaveStatus(prev => ({ ...prev, [studentId]: "Error saving action." }));
    });
    */

    // Simulate saving with a timeout
    setTimeout(() => {
      setSaveStatus((prev) => ({
        ...prev,
        [studentId]: "Saved successfully!",
      }));
      setStudentActions((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], isSaved: true },
      }));
    }, 500);
  };


  return (
    <div className="max-w-6xl text-black mx-auto p-4 sm:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div
            key="student-details"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="bg-white rounded-lg shadow-lg"
          >
            <div className="bg-green-700 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">Student Details</h2>
              <button
                onClick={handlePrint}
                className="bg-white text-green-700 py-2 px-4 rounded flex items-center hover:bg-gray-100 transition-colors"
              >
                <Printer className="inline mr-2" size={20} /> Print
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2">
                    <span className="font-semibold">Register No: </span>
                    <span className="ml-2">{selectedStudent.username}</span>
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Email: </span>
                    <span className="ml-2">{selectedStudent.email}</span>
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Department: </span>
                    <span className="ml-2">
                      {selectedStudent.department.name}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedStudent.phone && (
                    <p className="mb-2">
                      <span className="font-semibold">Phone: </span>
                      <span className="ml-2">{selectedStudent.phone}</span>
                    </p>
                  )}
                  {selectedStudent.address && (
                    <p className="mb-2">
                      <span className="font-semibold">Address: </span>
                      <span className="ml-2">{selectedStudent.address}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
                {selectedStudent.enrolled_courses &&
                selectedStudent.enrolled_courses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 text-left border">S.No</th>
                          <th className="py-2 px-4 text-left border">
                            Course Name
                          </th>
                          <th className="py-2 px-4 text-left border">Code</th>
                          <th className="py-2 px-4 text-left border">
                            Semester
                          </th>
                          <th className="py-2 px-4 text-left border">
                            Credits
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.enrolled_courses.map(
                          (enrolled, index) => (
                            <tr key={enrolled.id}>
                              <td className="py-2 px-4 border">{index + 1}</td>
                              <td className="py-2 px-4 border">
                                {enrolled.course.name}
                              </td>
                              <td className="py-2 px-4 border">
                                {enrolled.course.code}
                              </td>
                              <td className="py-2 px-4 border">
                                {enrolled.course.semester}
                              </td>
                              <td className="py-2 px-4 border">
                                {enrolled.course.courseCredit}
                              </td>
                            </tr>
                          )
                        )}
                        <tr className="bg-green-50 font-semibold">
                          <td
                            colSpan={4}
                            className="py-2 px-4 border text-right"
                          >
                            Total Credits:
                          </td>
                          <td className="py-2 px-4 border">
                            {calculateTotalCredits(
                              selectedStudent.enrolled_courses
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No enrolled courses found.</p>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleBackToList}
                  className="bg-green-700 text-white py-2 px-4 rounded flex items-center hover:bg-green-800 transition-colors"
                >
                  <ArrowLeft className="inline mr-2" /> Back to List
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="student-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4 border rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search by Register No or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-2 outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left border">S.No</th>
                      <th className="py-2 px-4 text-left border">
                        Register No
                      </th>
                      <th className="py-2 px-4 text-left border">Email</th>
                      <th className="py-2 px-4 text-left border">Actions</th>
                      <th className="py-2 px-4 text-left border">Status</th>
                      <th className="py-2 px-4 text-left border">Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td className="py-2 px-4 border">{index + 1}</td>
                        <td className="py-2 px-4 border">{student.username}</td>
                        <td className="py-2 px-4 border">{student.email}</td>
                        <td className="py-2 px-4 border">
                          <button
                            onClick={() => fetchIndividualStudent(student.id)}
                            className="text-green-700 hover:text-green-800 hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="flex flex-col">
                            <select
                              value={
                                studentActions[student.id]?.status || "Pending"
                              }
                              onChange={(e) =>
                                handleActionChange(
                                  student.id,
                                  e.target.value as ActionStatus
                                )
                              }
                              className="p-1 border rounded"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Accept">Accept</option>
                              <option value="Rejection">Rejection</option>
                            </select>

                            {/* Rejection Reason Textbox */}
                            {studentActions[student.id]?.status ===
                              "Rejection" && (
                              <input
                                type="text"
                                placeholder="Reason for rejection"
                                value={studentActions[student.id]?.reason || ""}
                                onChange={(e) =>
                                  handleReasonChange(student.id, e.target.value)
                                }
                                className="mt-2 p-1 border rounded"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleSave(student.id)}
                              className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition-colors"
                            >
                              Save
                            </button>
                            {saveStatus[student.id] && (
                              <span
                                className={`mt-1 text-sm ${
                                  saveStatus[student.id] ===
                                  "Saved successfully!"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {saveStatus[student.id]}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
