"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faRightLong, faTrash } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {

  const [student, setStudent] = useState(null);
  const [view, setView] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentSem, setCurrentSem] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const fetchCourses = async (sem) => {
    setCurrentSem(sem);
    try {
      const request = await axios.get(`http://127.0.0.1:8000/selectcourse/${sem}/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`
        }
      })
      setCourses(request.data['avail_courses']);
      for (let i = 0; i < request.data['avail_courses'].length; i++) {
        if (selectedCourses.some((c) => c.id === request.data['avail_courses'][i].id)) {
          setCourses(courses.filter((c) => c.id !== request.data['avail_courses'][i].id));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/getdetails/", {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`
        }
      });
      setStudent(response.data['student']);
      setCurrentSem(response.data['sem']);
      fetchCourses(response.data['sem']);;
    } catch (error) {
      console.error(error);
    }
  }

  const addSelectedCourse = (course) => {
    if (totalCredits + course.courseCredit > 30) {
      alert("Cannot add more courses. Maximum credit limit reached.")
      return;
    } else if (!selectedCourses.some((c) => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course]);
      setTotalCredits(totalCredits + course.courseCredit);
      setCourses(courses.filter((c) => c.id !== course.id));
    } else {
      alert('Course already added');
    }
  }

  const removeSelectedCourse = (course) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
    setTotalCredits(totalCredits - course.courseCredit);
    if (course.semester === currentSem) {
      setCourses([...courses, course]);
    }
  }

  const handleSubmit = async () => {
    const course_ids = selectedCourses.map((course) => course.id);
    try {
      const response = await axios.post("http://127.0.0.1:8000/selectcourse/1/", {
        CourseIDs: course_ids
      }, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`
        }
      })
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/getCourses/", {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`
        }
      })
      setEnrolledCourses(response.data);
      console.log("Enrolled Courses: ");
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    fetchStudentDetails();
    fetchEnrolledCourses();
  }, [view]);

  return (
    <div className="flex h-screen text-black overflow-y-hidden bg-gray-100">
      <div className="hidden md:flex flex-col w-1/5 bg-gray-800">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white font-bold uppercase">Kahe Dashboard</span>
        </div>
        <div className="flex flex-col mx-4 overflow-y-auto">
          <div className="mt-4 bg-white shadow-md rounded-lg p-4">
            {student ? (
              <div className="space-y-4">
                <div className="ml-4">

                  <h3 className="text-lg font-semibold inline">Username: </h3>
                  <p className="text-gray-600 inline">{student.username}</p>
                  <br />
                  <h3 className="text-lg font-semibold inline">E-mail: </h3>
                  <p className="text-gray-600 inline">{student.email}</p>
                </div>
              </div>
            ) : (
              <p>No student data available</p>
            )}
          </div>
          <nav className="flex-1 px-2 py-4 bg-gray-800">
            <a
              href="#"
              onClick={() => setView("courses")}
              className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faBook} className="h-6 w-6 mr-2" />
              Courses Enrollment
            </a>
            <a
              href="#"
              onClick={() => setView("EnrolledCourses")}
              className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faBook} className="h-6 w-6 mr-2" />
              Enrolled Courses
            </a>

          </nav>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="p-6">
          {view === "courses" && (
            <div className="flex-col w-full justify-evenly">
              <div className="flex gap-10">
                <div className="flex-col w-1/2 ">
                  <h1 className="font-bold text-xl inline">Available Courses</h1>
                  <select name="semester" id="current_semester" className="ml-5" value={currentSem} onChange={(e) => { fetchCourses(e.target.value), setCurrentSem(e.target.value) }}>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((semester) => (
                      <option key={semester} value={semester} >
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                  <div className="overflow-x-auto mt-4 bg-white shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            ID
                          </th>
                          <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            Subject Name
                          </th>
                          <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            Subject Code
                          </th>
                          <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            Semester No.
                          </th>
                          <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            Credits
                          </th>
                          <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courses.length > 0 ?
                          (
                            courses.map((course) => (
                              <tr key={course.id} >
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                  {course.id}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                  {course.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                  {course.code}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                  {course.semester}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                  {course.courseCredit}
                                </td>
                                <td className="text-sm text-gray-500 text-center hover:text-xl hover:text-green-600 transition-all" onClick={() => addSelectedCourse(course)}>
                                  <FontAwesomeIcon icon={faRightLong} />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                No courses available
                              </td>
                            </tr>
                          )
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex-col w-1/2 ">
                  <h3 className="text-xl font-bold mb-4 inline">
                    Enrolled Courses
                  </h3>
                  <p className="inline ml-10">{totalCredits}/30</p>

                  <div className="overflow-x-auto mt-4 bg-white shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject Name
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject Code
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Semester No.
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credits
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedCourses.length > 0 ?
                          (selectedCourses.map((course) => (
                            <tr key={course.id}>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {course.id}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {course.name}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {course.code}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {course.semester}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {course.courseCredit}
                              </td>
                              <td className="text-sm text-gray-500 text-center hover:text-xl hover:text-red-600 transition-all" onClick={() => removeSelectedCourse(course)}>
                                <FontAwesomeIcon icon={faTrash} />
                              </td>
                            </tr>
                          ))) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                No courses Selected
                              </td>
                            </tr>
                          )
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mt-10"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          )}
          {view === "EnrolledCourses" && (
            <div>
              <h1 className="font-bold text-xl inline">Enrolled Courses</h1>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border">Course Name</th>
                    <th className="border">Course Code</th>
                    <th className="border">Semester</th>
                    <th className="border">Course Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="border">{course.name}</td>
                        <td className="border">{course.code}</td>
                        <td className="border">{course.semester}</td>
                        <td className="border">{course.courseCredit}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No courses available</td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
