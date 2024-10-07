import React, { useState } from "react";
import axios from "axios";

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
    name: string;
    code: string;
    semester: string;
    is_optional: boolean;
  }>;
}

const StudentsList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  const handleFetch = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/students/",
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  const handleStudentClick = (student: Student) => setSelectedStudent(student);
  const handleBackToList = () => setSelectedStudent(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearchTerm =
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter
      ? student.department.name === departmentFilter
      : true;

    return matchesSearchTerm && matchesDepartment;
  });

  return (
    <div className="max-w-5xl mx-auto text-gray-800 bg-gray-100 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Student List</h2>
      <button
        onClick={handleFetch}
        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 mb-4"
      >
        Fetch Students
      </button>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by Username or Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg py-2 px-4 mr-4 flex-1 shadow-sm"
        />

        <select
          value={departmentFilter || ""}
          onChange={(e) => setDepartmentFilter(e.target.value || null)}
          className="border rounded-lg py-2 px-4 shadow-sm"
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
        </select>
      </div>

      {selectedStudent ? (
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
          <div className="flex items-center mb-6">
            <img
              src="https://kahedu.edu.in/n/wp-content/uploads/2020/01/KAHE-logo-2.png"
              alt="Karpagam Academy Logo"
              className="mr-4 h-16"
            />
            <div>
              <h1 className="text-2xl font-bold text-green-700">
                KARPAGAM ACADEMY OF HIGHER EDUCATION
              </h1>
              <p className="text-sm">(Deemed to be University)</p>
              <p className="text-xs">
                [Established Under Section 3 of UGC Act, 1956]
              </p>
            </div>
          </div>

          <p className="text-sm mb-4">
            Pollachi Main Road, Eachanari Post, Coimbatore - 641 021, Tamil
            Nadu, India.
          </p>
          <p className="text-sm mb-6">
            Phone: 0422 - 2980011- 14 | Fax : 0422 - 2980022 | Email :
            info@kahedu.edu.in
          </p>

          <p className="text-right mb-6">{new Date().toLocaleDateString()}</p>

          <h2 className="text-xl font-bold mb-4">Student Details</h2>

          <div className="mb-6">
            <p>
              <strong>ID:</strong> {selectedStudent.id}
            </p>
            <p>
              <strong>Username:</strong> {selectedStudent.username}
            </p>
            <p>
              <strong>Email:</strong> {selectedStudent.email}
            </p>
            <p>
              <strong>Department:</strong> {selectedStudent.department.name}
            </p>
            {selectedStudent.phone && (
              <p>
                <strong>Phone:</strong> {selectedStudent.phone}
              </p>
            )}
            {selectedStudent.address && (
              <p>
                <strong>Address:</strong> {selectedStudent.address}
              </p>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">Enrolled Courses:</h3>
          {selectedStudent.enrolled_courses &&
          selectedStudent.enrolled_courses.length > 0 ? (
            <ul className="list-disc list-inside mb-6">
              {selectedStudent.enrolled_courses.map((course) => (
                <li key={course.id}>
                  {course.name} (Code: {course.code}, Semester:{" "}
                  {course.semester}, Optional:{" "}
                  {course.is_optional ? "Yes" : "No"})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-6">No enrolled courses available.</p>
          )}
          <div className="flex justify-between mt-4">
            <button
              onClick={handleBackToList}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
            >
              Back to List
            </button>
            <button
              onClick={() => window.print()}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Print
            </button>
          </div>
        </div>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-100">
                <td className="py-2 px-4">{student.id}</td>
                <td className="py-2 px-4">{student.username}</td>
                <td className="py-2 px-4">{student.email}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleStudentClick(student)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentsList;
