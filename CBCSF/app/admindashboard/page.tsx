"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import UploadForm from "./UploadForm";
import StudentsList from "./StudentsList";
import CoursesList from "./CoursesList";

const Page = () => {
  const [view, setView] = useState("upload");

  return (
    <div className="flex bg-white h-screen">
      <Sidebar setView={setView} />
      <div className="flex-1 p-6">
        {view === "upload" && <UploadForm />}
        {view === "students" && <StudentsList />}
        {view === "courses" && <CoursesList />}
      </div>
    </div>
  );
};

export default Page;
