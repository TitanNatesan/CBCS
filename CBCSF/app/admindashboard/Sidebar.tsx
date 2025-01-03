// components/Sidebar.tsx
import React from "react";

interface SidebarProps {
  setView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setView }) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-white font-bold uppercase">
          Course Registration
        </span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-800">
          <a
            href="#"
            onClick={() => setView("upload")}
            className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700"
          >
            Upload
          </a>
          <a
            href="#"
            onClick={() => setView("students")}
            className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700"
          >
            View Students
          </a>
          <a
            href="#"
            onClick={() => setView("courses")}
            className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700"
          >
            View Courses
          </a>
          {/* <a
            href="#"
            onClick={() => setView("studentsupload")}
            className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700"
          >
            studentsupload
          </a> */}
          <a
            href="#"
            onClick={() => setView("PaBv")}
            className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700"
          >
            Programs and Batch
          </a>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
