import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  Container,
  Grid,
  CircularProgress,
} from "@mui/material";

export default function CourseRegistrationForm() {
  const [semester, setSemester] = useState("");
  const [totalSem, setTotalSem] = useState(4);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [courseCredit, setCourseCredit] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState("");
  const [programs, setPrograms] = useState([]);
  const [department, setDepartment] = useState("");
  const [allPrograms, setAllPrograms] = useState([]);
  const [accessProgram, setAccessProgram] = useState("");
  const [batchs, setBatchs] = useState([]);

  const token = localStorage.getItem("token");

  const fetchPrograms = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/adminDash/", {
        headers: { Authorization: `Token ${token}` },
      });
      setPrograms(response.data['programs']);
      setDepartment(response.data['department']);
      setAllPrograms(response.data['allprograms']);
      setBatchs(response.data['batch']);
    } catch (error) {
      console.error("There was an error fetching the programs!", error);
      toast.error("Failed to fetch programs");
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (!semester || !subjectName || !subjectCode) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const semesterNumber = Number(semester);
    if (isNaN(semesterNumber) || semesterNumber <= 0) {
      setErrorMessage("Semester must be a positive number.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/courses/",
        {
          course_id: 1,
          semester,
          name: subjectName,
          code: subjectCode,
          program: program,
          courseCredit: courseCredit,
          is_optional: isOptional,
        },
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      setSemester("");
      setSubjectName("");
      setSubjectCode("");
      setIsOptional(false);
      setCourseCredit(0);
      if (response.statusText === "Created") {
        toast.success("Course created successfully", { position: "top-right" });
      } else {
        toast.error("Failed to create course");
      }
    } catch (error) {
      console.error("There was an error updating the course!", error);
      setErrorMessage("There was an error updating the course. Please try again.");
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [batch, setBatch] = useState("");

  const handleToggle = (departmentId) => {
    setSelectedDepartments((prev) => {
      if (prev.includes(departmentId)) {
        return prev.filter((id) => id !== departmentId); // Remove if already selected
      } else {
        return [...prev, departmentId]; // Add if not selected
      }
    });
  };



  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h5" component="h1" color="primary" align="left" fontWeight="bold">
            Department of {department}
          </Typography>
          <Typography variant="h6" color="text.secondary" align="left">
            Course Registration
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Program"
                value={program}
                onChange={(e) => {
                  setProgram(e.target.value);
                  const selectedProgram = programs.find((p) => p.id == e.target.value);
                  setTotalSem(selectedProgram?.duration || 8);
                }}
              >
                <MenuItem value="" disabled>
                  Select a program
                </MenuItem>
                {programs.map((program) => (
                  <MenuItem key={program.id} value={program.id}>
                    {program.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <MenuItem value="" disabled>
                  Select Semester
                </MenuItem>
                {[...Array(totalSem * 2)].map((_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Batch"
                value={batch}
                onChange={(e) => {
                  setBatch(e.target.value);
                  const selectedProgram = programs.find((p) => p.id == e.target.value);
                  setTotalSem(selectedProgram?.duration || 8);
                }}
              >
                <MenuItem value="" disabled>
                  Select a Batch
                </MenuItem>
                {batchs.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.start_year} / {batch.end_year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Code"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Course Credit"
                value={courseCredit}
                onChange={(e) => setCourseCredit(e.target.value)}
              />
            </Grid>
            <Box textAlign="center" m={4}>
              <Typography variant="h6" color="text.secondary" align="left">
                Course Access
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" align="left">
              Select departments that can access this course
            </Typography>
            {allPrograms.map((program) => (
              <FormControlLabel
                key={program.id}
                control={
                  <Checkbox
                    checked={selectedDepartments.includes(program.id)}
                    onChange={() => handleToggle(program.id)}
                    color="primary"
                  />
                }
                label={program.name + " (" + program.department.name + ")"}
              />
            ))}

            <Typography variant="h6" color="text.secondary" align="left">
              Select semester of students who can access this course
            </Typography>

          </Grid>
          {errorMessage && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ width: '50%' }}
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}