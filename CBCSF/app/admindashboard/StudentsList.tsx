import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Printer, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
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

interface BatchGroup {
  [key: string]: Student[];
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchGroups, setBatchGroups] = useState<BatchGroup>({});
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(
    new Set()
  );
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/students/", {
        headers: { Authorization: `token ${token}` },
      });
      setStudents(response.data);
      organizeBatchGroups(response.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  const fetchIndividualStudent = async (sid: number) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/getdetails/${sid}/`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      if (response.data && response.data.student) {
        setSelectedStudent(response.data["student"]);
      } else {
        setSelectedStudent(generateFakeStudent(sid));
      }
    } catch (error) {
      console.error("Error fetching individual student", error);
      setSelectedStudent(generateFakeStudent(sid));
    }
  };

  const generateFakeStudent = (sid: number): Student => ({
    id: sid,
    username: "lokesh",
    email: "lokesh07084@kahedu.edu.in",
    phone: "7448359938",
    address: "123  Street",
    department: {
      name: "Computer Science and Engineering",
    },
    enrolled_courses: [
      {
        id: 1,
        course: {
          name: "DBMS",
          code: "FC101",
          semester: "1",
          is_optional: false,
          courseCredit: 3,
        },
      },
      {
        id: 2,
        course: {
          name: "Flat",
          code: "FC102",
          semester: "2",
          is_optional: true,
          courseCredit: 4,
        },
      },
    ],
  });

  const getBatchFromUsername = (username: string) => {
    // Assuming username format contains year like "21CSE001" or similar
    const match = username.match(/^\d{2}/);
    return match ? `20${match[0]}` : "Unknown";
  };

  const organizeBatchGroups = (studentList: Student[]) => {
    const groups: BatchGroup = studentList.reduce(
      (acc: BatchGroup, student) => {
        const batch = getBatchFromUsername(student.username);
        if (!acc[batch]) {
          acc[batch] = [];
        }
        acc[batch].push(student);
        return acc;
      },
      {}
    );
    setBatchGroups(groups);
    // Expand the first batch by default
    if (Object.keys(groups).length > 0) {
      setExpandedBatches(new Set([Object.keys(groups)[0]]));
    }
  };

  const toggleBatchExpansion = (batch: string) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batch)) {
      newExpanded.delete(batch);
    } else {
      newExpanded.add(batch);
    }
    setExpandedBatches(newExpanded);
  };

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

  const BatchTable = ({
    students,
    batch,
  }: {
    students: Student[];
    batch: string;
  }) => {
    const filteredStudents = students.filter(
      (student) =>
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredStudents.length === 0) return null;

    return (
      <div className="mb-6">
        <div
          className="bg-green-700 text-white p-3 rounded-t-lg flex justify-between items-center cursor-pointer"
          onClick={() => toggleBatchExpansion(batch)}
        >
          <h2 className="text-lg font-semibold">
            Batch {batch} ({filteredStudents.length} students)
          </h2>
          {expandedBatches.has(batch) ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>

        {expandedBatches.has(batch) && (
          <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left border">S.No</th>
                  <th className="py-2 px-4 text-left border">Register No</th>
                  <th className="py-2 px-4 text-left border">Email</th>
                  <th className="py-2 px-4 text-left border">Actions</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl text-black mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-700">
          Faculty of Engineering
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mt-2">
          Department of Computer Science and Engineering
        </h2>
      </div>

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
            <div className="mb-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by Register No or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-lg outline-none"
                  />
                </div>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="p-2 border rounded-lg outline-none bg-white"
                >
                  <option value="all">All Batches</option>
                  {Object.keys(batchGroups)
                    .sort()
                    .map((batch) => (
                      <option key={batch} value={batch}>
                        Batch {batch}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {selectedBatch === "all"
              ? Object.entries(batchGroups)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([batch, students]) => (
                    <BatchTable key={batch} batch={batch} students={students} />
                  ))
              : batchGroups[selectedBatch] && (
                  <BatchTable
                    batch={selectedBatch}
                    students={batchGroups[selectedBatch]}
                  />
                )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
