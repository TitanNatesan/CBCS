"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import UploadForm from "./UploadForm";
import StudentsList from "./StudentsList";
import CoursesList from "./CoursesList";
import StudentBulkRegister from "./Studentupload";
import PaBv from "./PaBv";
import axios from "axios";

const Page = () => {
  const [view, setView] = useState("upload");
  const [responseData, setResponseData] = useState({programs: [], batchs: [], courses: []});

  const fetch = () => {
    axios.get("http://localhost:8000/hodDash/",
      {
        headers:
        {
          Authorization: `Token ${localStorage.getItem("token")}`,
        }
      }
    ).then((response) => {
      setResponseData(response.data);
    }
    ).catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    fetch();
  }, [])

  return (
    <div className="flex bg-white h-screen">
      <Sidebar setView={setView} />
      <div className="flex-1 p-6">
        {view === "upload" && <UploadForm />}
        {view === "students" && <StudentsList />}
        {view === "courses" && <CoursesList course={responseData.courses}/>}
        {view === "studentsupload" && <StudentBulkRegister />}
        {view === "PaBv" && <PaBv program={responseData.programs} batch={responseData.batchs} />}
      </div>
    </div>
  );
};

export default Page;
