"use client";

import React, { useState, useEffect } from "react";

interface Course {
  id: number;
  name: string;
  code: string;
  semester: string;
  is_optional: boolean;
  program: {
    id: number;
    name: string;
  };
  batch: {
    start: number;
    end: number;
  }[];
}

export default function CoursesList({ course }) {
  const [courses, setCourses] = useState<Course[]>(course);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(course);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  useEffect(() => {
    setCourses(course);
    setFilteredCourses(course);
    console.log(course);
  }, [course]);

  useEffect(() => {
    let filtered = courses;
    if (selectedSemester) {
      filtered = filtered.filter(
        (course) => course.semester === selectedSemester
      );
    }
    if (selectedProgram) {
      filtered = filtered.filter(
        (course) => course.program.name === selectedProgram
      );
    }
    if (selectedBatch) {
      const [batchStart, batchEnd] = selectedBatch.split("-");
      filtered = filtered.filter((course) =>
        course.batch.some(
          (bat) =>
            bat.start.toString() === batchStart &&
            bat.end.toString() === batchEnd
        )
      );
    }
    setFilteredCourses(filtered);
  }, [selectedSemester, selectedProgram, selectedBatch, courses]);

  const semesters = Array.from(
    new Set(courses.map((course) => course.semester))
  );
  const programs = Array.from(
    new Set(courses.map((course) => course.program.name))
  );
  const batches = Array.from(
    new Set(
      courses.flatMap((course) =>
        course.batch.map((bat) => `${bat.start}-${bat.end}`)
      )
    )
  );

  return (
    <div className="max-w-6xl text-black mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Courses List</h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programs</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Semesters</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>
        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {filteredCourses.length} courses
        </span>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses
                .sort((a, b) => parseInt(a.semester) - parseInt(b.semester))
                .map((course, index) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.batch.map((bat) => (
                        <p
                          key={`${bat.start}-${bat.end}`}
                          className="text-black"
                        >
                          {bat.start}-{bat.end}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
