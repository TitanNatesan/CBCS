import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Printer } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

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
interface report {
  id: number,

}
type ActionStatus = "Pending" | "Accept" | "Rejection" | "reject";

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [status, setStatus] = useState<ActionStatus>("Pending");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [report, setReport] = useState([{
  }])

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/students/", {
        headers: { Authorization: `token ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students", error);
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

      console.log("reponsedata", response.data);

      // Extract the student and current semester
      const student = response.data.student;
      const currentSemester = student.sem; // Assuming sem contains the current semester
      const report = response.data.report;

      const filteredReport = report.filter(
        (reportItem: { semester: string }) => reportItem.semester === currentSemester
      );
      console.log("filter bro,", filteredReport);
      // Update the states with filtered data
      setSelectedStudent(student);
      setReport(filteredReport);

      // Logic to set default status
      let status: ActionStatus = "Pending"; // Default status

      if (response.data.is_approved) {
        status = "Accept"; // If approved, set to "Accept"
      } else if (response.data.reason_for_rejection === null) {
        status = "Rejection"; // If not approved and no rejection reason, set to "Reject"
      }

      setStatus(status); // Update the status state to the calculated value

    } catch (error) {
      console.error("Error fetching individual student", error);
    }
  };


  useEffect(() => {
    fetchStudents();
  }, []);

  const handleBackToList = () => setSelectedStudent(null);


  const handlePrint = () => {
    const printableContent = document.getElementById("printable-area");
    if (printableContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(
          `<html><head><title>Student Details</title></head><body>`
        );
        printWindow.document.write(printableContent.innerHTML);
        printWindow.document.write(
          `<style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>`
        );
        printWindow.document.write(`</body></html>`);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl text-black mx-auto p-4 sm:p-6 lg:p-8">
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
              <div id="printable-area" className="bg-green-50 -mt-10 p-6 rounded-lg">
                <div className="bg-green-700 text-white p-4 rounded-t-lg flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Student Details</h2>
                  <button
                    onClick={handlePrint}
                    className="bg-white text-green-700 py-2 px-4 rounded flex items-center hover:bg-gray-100 transition-all"
                    aria-label="Print student details"
                  >
                    <Printer className="inline mr-2" size={20} /> Print
                  </button>
                </div>

                <div className="p-6">
                  {/* Student Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                      <p className="mb-4">
                        <span className="font-semibold">Register No: </span>
                        {selectedStudent.username}
                      </p>
                      <p className="mb-4">
                        <span className="font-semibold">Email: </span>
                        {selectedStudent.email}
                      </p>
                      <p className="mb-4">
                        <span className="font-semibold">Department: </span>
                        {selectedStudent.department.name}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                      {selectedStudent.phone && (
                        <p className="mb-4">
                          <span className="font-semibold">Phone: </span>
                          {selectedStudent.phone}
                        </p>
                      )}
                      {selectedStudent.address && (
                        <p className="mb-4">
                          <span className="font-semibold">Address: </span>
                          {selectedStudent.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
                    {selectedStudent.enrolled_courses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2 text-left">Course Name</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Course Code</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Semester</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Credits</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudent.enrolled_courses.map((enrollment) => (
                              <tr key={enrollment.id} className="odd:bg-white even:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">{enrollment.course.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{enrollment.course.code}</td>
                                <td className="border border-gray-300 px-4 py-2">{enrollment.course.semester}</td>
                                <td className="border border-gray-300 px-4 py-2">{enrollment.course.courseCredit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No courses enrolled yet.</p>
                    )}
                  </div>
                  <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Enrollment Status</h3>

                    {/* Status Row */}
                    <div className="flex-row justify-evenly items-center space-x-6">
                      {/* Label */}
                      <div>
                        <label htmlFor="status" className="font-medium text-gray-700 whitespace-nowrap">
                          Status:
                        </label>

                        <>
                          <select
                            id="status"
                            className="form-select rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-4"
                            value={status}
                            aria-label="Select enrollment status"
                            onChange={(e) => setStatus(e.target.value as ActionStatus)}
                          >
                            <option value="pending">Pending</option>
                            <option value="accept">Accept</option>
                            <option value="reject">Reject</option>
                          </select>

                          {/* Show rejection reason when status is 'reject' */}
                          {status === "reject" && (
                            <div className="mt-4">
                              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                                Rejection Reason
                              </label>
                              <textarea
                                id="rejectionReason"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                placeholder="Enter reason for rejection..."
                              />
                            </div>
                          )}
                        </>

                        {/* Update Button */}
                        <button
                          type="button"
                          className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                          onClick={() => {
                            const isApproved = status === 'accept';
                            const data = {
                              report: report[0].id,
                              aproved: isApproved,
                              ror: status === 'reject' ? rejectionReason : '', // Send rejection reason if status is 'reject'
                              type: "ReportUpdate"
                            };
                            axios.put("http://localhost:8000/hodDash/", data, {
                              headers: {
                                Authorization: `Token ${localStorage.getItem("token")}`
                              }
                            }).then((res) => {
                              console.log(res);
                              toast.success("Updated successfully");
                            }).catch((err) => {
                              console.log(err);
                              toast.error("Already updated the status");
                            });
                          }}
                          aria-label="Update enrollment status"
                        >
                          Update Status
                        </button>
                      </div>


                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleBackToList}
                    className="bg-green-700 text-white py-3 px-6 rounded-md flex items-center space-x-2 hover:bg-green-800 transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Back to student list"
                  >
                    <ArrowLeft className="inline-block w-5 h-5" />
                    <span>Back to List</span>
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
                  <table className="min-w-full max-h-full">
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
                            >View Details</button>
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
    </div >
  );
}
