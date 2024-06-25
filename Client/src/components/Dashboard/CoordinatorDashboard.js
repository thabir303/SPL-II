// CoordinatorDashboard.js
import React, { useContext } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { RiAccountPinCircleFill } from "react-icons/ri";
// import ViewRoutines from "../Routine/ViewRoutines";
import CoordinatorClassSlot from "../Coordinators/CoordinatorClassSlot";
import CoordinatorUpdateClassSlot from "../Coordinators/CoordinatorUpdateClassSlot";
import CoordinatorEditClassSlot from "../Coordinators/CoordinatorEditClassSlot";
import CoordinatorCourse from "../Coordinators/CoordinatorCourse";
import CoordinatorEditCourse from "../Coordinators/CoordinatorEditCourse";
import CoTeacher from "../Coordinators/CoTeachers";
import CoAssignCourses from "../Coordinators/CoAssignCourses";
import CoEditTeacher from "../Coordinators/CoEditTeacher";
import AuthContext from "../../context/AuthContext";
// import FullRoutine from "../Routine/FullRoutine";
import CoFullRoutine from "../Coordinators/CoordinatorRoutine";

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "bg-gray-700 font-bold" : "hover:bg-gray-700";
  };

  return (
    <div className="flex min-h-screen">
      <aside className="bg-gray-800 text-white w-64 p-6 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Coordinator</h1>
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <nav className="flex flex-col space-y-4 flex-grow">
          <Link to="/coordinator/view-routines" className={`p-2 rounded ${isActive("/coordinator/view-routines")}`}>
            View Routine
          </Link>
          <Link to="/coordinator/class-slots" className={`p-2 rounded ${isActive("/coordinator/class-slots")}`}>
            Class Slots
          </Link>
          <Link to="/coordinator/courses" className={`p-2 rounded ${isActive("/coordinator/courses")}`}>
            Courses
          </Link>
          <Link to="/coordinator/teachers" className={`p-2 rounded ${isActive("/coordinator/teachers")}`}>
            Teachers
          </Link>
        </nav>
        <div className="mt-6 sticky bottom-0 bg-gray-800">
          <div onClick={() => navigate("/coordinator")} className="cursor-pointer p-2 rounded flex items-center space-x-2 hover:bg-gray-700">
            <RiAccountPinCircleFill size={40} />
            <span>{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="bg-red-500 p-2 rounded mt-4 w-full mb-8">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-grow p-6 bg-gray-100">
        <Routes>
        <Route path="/" element={<CoFullRoutine />} />

          <Route path="view-routines" element={<CoFullRoutine />} />
          <Route path="class-slots" element={<CoordinatorClassSlot />} />
          <Route path="class-slots/new" element={<CoordinatorUpdateClassSlot />} />
          <Route path="class-slots/update/:id" element={<CoordinatorEditClassSlot />} />
          <Route path="courses" element={<CoordinatorCourse />} />
          <Route path="courses/new" element={<CoordinatorEditCourse />} />
          <Route path="courses/update/:courseId" element={<CoordinatorEditCourse />} />
          <Route path="teachers" element={<CoTeacher />} />
          <Route path="teachers/edit/:teacherId" element={<CoEditTeacher />} />
          <Route path="teachers/assign/:teacherId" element={<CoAssignCourses />} />
        </Routes>
      </main>
    </div>
  );
};

export default CoordinatorDashboard;
