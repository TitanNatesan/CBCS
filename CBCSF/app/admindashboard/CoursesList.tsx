import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Chip,
} from "@mui/material";

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
}

const CoursesList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/courses/", {
        headers: { Authorization: `token ${token}` },
      });
      setCourses(response.data);
      setFilteredCourses(response.data);
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

  useEffect(() => {
    fetchCourses();
  }, []);

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
    setFilteredCourses(filtered);
  }, [selectedSemester, selectedProgram, courses]);

  const semesters = Array.from(
    new Set(courses.map((course) => course.semester))
  );
  const programs = Array.from(
    new Set(courses.map((course) => course.program.name))
  );

  return (
    <Box maxWidth="lg" margin="auto" padding={4}>
      <Typography variant="h4" gutterBottom>
        Courses List
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <Box>
          <FormControl
            variant="outlined"
            style={{ minWidth: 120, marginRight: 16 }}
          >
            <InputLabel>Program</InputLabel>
            <Select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value as string)}
              label="Program"
            >
              <MenuItem value="">All Programs</MenuItem>
              {programs.map((program) => (
                <MenuItem key={program} value={program}>
                  {program}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as string)}
              label="Semester"
            >
              <MenuItem value="">All Semesters</MenuItem>
              {semesters.map((semester) => (
                <MenuItem key={semester} value={semester}>
                  {semester}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Chip label={`${filteredCourses.length} courses`} color="primary" />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Program</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses
              .sort((a, b) => parseInt(a.semester) - parseInt(b.semester))
              .map((course, index) => (
                <TableRow key={course.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.program.name}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CoursesList;
