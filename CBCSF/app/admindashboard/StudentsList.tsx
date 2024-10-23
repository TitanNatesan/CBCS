import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
} from "@mui/material";

import { ArrowBack, Print, Search } from "@mui/icons-material";

// Define the Student interface
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
    };
  }>;
} 

const StudentsList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const token = localStorage.getItem("token");

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/students/", {
        headers: { Authorization: `token ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  // Fetch individual student details
  const fetchIndividualStudent = async (sid: number) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/getdetails/${sid}/`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      setSelectedStudent(response.data["student"]);
      
    } catch (error) {
      console.error("Error fetching individual student", error);
    }
  };

  // UseEffect to fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle back to student list
  const handleBackToList = () => setSelectedStudent(null);

  // Filter students based on search and department
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
    <Box maxWidth="lg" margin="auto" padding={4}>
      <Typography
        variant="h4"
        gutterBottom
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Student List
      </Typography>

      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div
            key="student-details"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card elevation={3} sx={{ padding: 3 }}>
              <CardContent>
                <Typography variant="h5" color="primary" gutterBottom>
                  Student Details
                </Typography>
                <Box marginBottom={2}>
                  <Typography variant="subtitle1">
                    <strong>Register No:</strong> {selectedStudent.username}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Email:</strong> {selectedStudent.email}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Department:</strong> {selectedStudent.department.name}
                  </Typography>
                  {selectedStudent.phone && (
                    <Typography variant="subtitle1">
                      <strong>Phone:</strong> {selectedStudent.phone}
                    </Typography>
                  )}
                  {selectedStudent.address && (
                    <Typography variant="subtitle1">
                      <strong>Address:</strong> {selectedStudent.address}
                    </Typography>
                  )}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Enrolled Courses:
                </Typography>
                {selectedStudent.enrolled_courses &&
                selectedStudent.enrolled_courses.length > 0 ? (
                  <TableContainer component={Paper} elevation={2}>
                  <Table>
                    <TableHead>
                    <TableRow>
                      <TableCell>S.No</TableCell>
                      <TableCell>Course Name</TableCell>
                      <TableCell>Course Code</TableCell>
                      <TableCell>Semester</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {selectedStudent.enrolled_courses.map((course, index) => (
                      <TableRow key={course.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{course.course.name}</TableCell>
                      <TableCell>{course.course.code}</TableCell>
                      <TableCell>{course.course.semester}</TableCell>
                      <TableCell>{course.course.courseCredit}</TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                  </TableContainer>
                ) : (
                  <Typography>No enrolled courses available.</Typography>
                )}
                

                <Box display="flex" justifyContent="space-between" marginTop={2}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBackToList}
                    variant="contained"
                    color="secondary"
                  >
                    Back to List
                  </Button>
                  <Button
                    startIcon={<Print />}
                    onClick={() => window.print()}
                    variant="contained"
                    color="primary"
                  >
                    Print
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="student-list"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card elevation={3} sx={{ padding: 3 }}>
              <Box display="flex" marginBottom={2}>
                <TextField
                  label="Search by Username or Email"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <Search />,
                  }}
                />
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value as string)}
                  displayEmpty
                  variant="outlined"
                  sx={{ minWidth: 180, marginLeft: 2 }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                </Select>
              </Box>

              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Reg No.</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => fetchIndividualStudent(student.id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default StudentsList;
