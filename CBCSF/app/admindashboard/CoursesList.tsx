// components/CoursesList.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Course {
  id: number;
  name: string;
  code: string;
  semester: string;
  is_optional: boolean;
}

const CoursesList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const token = localStorage.getItem("token");

  const handleCourses = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/courses/",
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      setCourses(response.data);
      setFilteredCourses(response.data); // Initially display all courses
    } catch (error: any) {
      console.error("Error fetching courses", error);
      if (error.response) {
        alert(`Error: ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        alert("Error: No response from server.");
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  useEffect(()=>{
    handleCourses();
  },[])

  useEffect(() => {
    // Filter courses based on selected semester
    if (selectedSemester) {
      const filtered = courses.filter(
        (course) => course.semester === selectedSemester
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedSemester, courses]);

  // Get unique semesters for dropdown
  const semesters = Array.from(
    new Set(courses.map((course) => course.semester))
  );

  return (
    <div className="max-w-4xl text-black mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Courses List</h2>
      <p className="text-black">filter with program and semester</p>
      <p className="text-black">count show pannanum based on filters</p>
      <button
        onClick={handleCourses}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-6 transition duration-200"
      >
        Better Remove the Button
      </button>


      <select
        value={selectedSemester}
        onChange={(e) => setSelectedSemester(e.target.value)}
        className="border rounded-lg p-2 mb-6"
      >
        <option value="">Make Filters Valid</option>
        {semesters.map((semester, index) => (
          <option key={index} value={semester}>
            {semester}
          </option>
        ))}
      </select>

      {filteredCourses.length > 0 ? (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">#</th> {/* Updated Header */}
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Code</th>
              <th className="py-3 px-4 text-left">Semester</th>
              <th className="py-3 px-4 text-left">Program</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses
              .sort((a, b) => parseInt(a.semester) - parseInt(b.semester))
              .map((course, index) => (
                <tr
                  key={course.id}
                  className="hover:bg-gray-100 transition duration-200"
                >
                  <td className="py-2 px-4 border-b">{index + 1}</td>{" "}
                  {/* Sequential Number */}
                  <td className="py-2 px-4 border-b">{course.name}</td>
                  <td className="py-2 px-4 border-b">{course.code}</td>
                  <td className="py-2 px-4 border-b">{course.semester}</td>
                  <td className="py-2 px-4 border-b">
                    {course.program.name}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mt-4">
          No courses available. Please fetch the courses.
        </p>
      )}
    </div>
  );
};

export default CoursesList;
