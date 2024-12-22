"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Book, ChevronRight, Trash2, LogOut } from "lucide-react";


export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [view, setView] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentSem, setCurrentSem] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [responseData, setResponseData] = useState({
    department: "",
  });

  const token = localStorage.getItem("token");

  const fetchDetails = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/studDash/", {
        headers: { Authorization: `Token ${token}` },
      });
      console.log(response.data);
      setResponseData(response.data);
      setCourses(response.data.avail_courses);
      setSelectedCourses(response.data.enrolled_courses);
      setEnrolledCourses(response.data.enrolled_courses);
    } catch (error) {
      console.error(error);
    }
  };

  const addSelectedCourse = (course) => {
    if (totalCredits + course.courseCredit > 30) {
      alert("Cannot add more courses. Maximum credit limit reached.");
      return;
    }
    setSelectedCourses((prev) => [...prev, course]);
    setTotalCredits((prev) => prev + course.courseCredit);
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
  };

  const removeSelectedCourse = (course) => {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== course.id));
    setTotalCredits((prev) => prev - course.courseCredit);
    if (course.semester === currentSem.toString()) {
      setCourses((prev) => [...prev, course]);
    }
  };

  const handleSubmit = () => {
    const course_ids = selectedCourses.map((course) => course.id);
    axios.post("http://localhost:8000/studDash/", { CourseIDs: course_ids, type: "enroll" }, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
    fetchDetails();
  };

  useEffect(() => {
    fetchDetails();
  }, [view]);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 bg-indigo-600 text-white">
          <h1 className="text-xl font-bold">Course Registration</h1>
        </div>
        <div className="p-4 border-b">
          <p className="text-sm font-medium mt-2 text-black">Reg No: {responseData.username}</p>
          <p className="text-sm font-medium mt-2 text-black">{responseData.first_name + " " + responseData.last_name}</p>
          <p className="text-sm font-medium mt-2 text-black">Batch: {responseData.batch}</p>
          <p className="text-sm font-medium mt-2 text-black">Current Semester: {responseData.current_sem}</p>
          <p className="text-sm font-medium mt-2 text-black">Program: {responseData.program}</p>
        </div>
        <nav className="p-4">
          <button
            onClick={() => setView("courses")}
            className={`flex items-center w-full p-2 rounded ${view === "courses"
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Book className="mr-2 h-5 w-5" />
            Course Enrollment
          </button>
          <button
            onClick={() => setView("EnrolledCourses")}
            className={`flex items-center w-full p-2 rounded mt-2 ${view === "EnrolledCourses"
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Book className="mr-2 h-5 w-5" />
            Enrolled Courses
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-xl font-semibold text-gray-700 mb-6">Department of <b className="text-blue-700">{responseData.department}</b></h1>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Course Registration
        </h1>
        {student && (
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Department of {student.department.name}
          </h2>
        )}

        {view === "courses" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <label htmlFor="semester" className="font-medium text-gray-700">
                  Semester:
                </label>
                <select
                  id="semester"
                  value={currentSem}
                  // onChange={(e) => fetchCourses(Number(e.target.value))}
                  className="border rounded p-2 text-gray-700"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(
                    (semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">
                  Available Courses
                </h4>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {course.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {course.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {course.courseCredit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => addSelectedCourse(course)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">
                  Selected Courses
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Total Credits: {totalCredits}/30
                </p>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCourses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {course.course.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {course.course.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {course.course.courseCredit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => removeSelectedCourse(course)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Submit Enrollment
            </button>
          </div>
        )}

        {view === "EnrolledCourses" && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Enrolled Courses
            </h3>
            <p className="text-black">
              api la irunthu report nu onnu varum ,
              adhula irunthu student semester report full ah varum yeallathaium history type la runder panniru
            </p>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrolledCourses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {course.course.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {course.course.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {course.course.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {course.course.courseCredit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
