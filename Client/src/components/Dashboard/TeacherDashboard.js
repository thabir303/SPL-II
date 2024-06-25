import React, { useContext } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { RiAccountPinCircleFill } from "react-icons/ri";
import AuthContext from "../../context/AuthContext";
import TeacherRoutine from "../Routine/TeacherRoutine"; // Import the correct path
import RescheduleRoutine from "../Routine/RescheduleRoutine"; // Import the correct path
import TeacherCourseList from "../Teachers/TeacherCourseList";

const TeacherDashboard = () => {
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
          <h1 className="text-3xl font-bold">Teacher</h1>
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <nav className="flex flex-col space-y-4 flex-grow">
          <Link
            to="/teacher/routine"
            className={`p-2 rounded ${isActive("/teacher/routine")}`}
          >
            Routine
          </Link>
          <Link
            to="/teacher/courses"
            className={`p-2 rounded ${isActive("/teacher/courses")}`}
          >
            Courses
          </Link>
        </nav>
        <div className="mt-6 sticky bottom-0 bg-gray-800">
          <div
            onClick={() => navigate("/teacher/profile")}
            className="cursor-pointer p-2 rounded flex items-center space-x-2 hover:bg-gray-700"
          >
            <RiAccountPinCircleFill size={40} />
            <span>{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 p-2 rounded mt-4 w-full"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-grow p-6 bg-gray-100">
        <Routes>
          <Route path="/" element={<TeacherRoutine teacherId={user.teacherId} />} />
          <Route path="routine" element={<TeacherRoutine teacherId={user.teacherId} />} />
          <Route path="reschedule-routine/:id" element={<RescheduleRoutine />} />
          <Route path="courses" element={<TeacherCourseList />} /> {/* Add the route for TeacherCourseList */}
          {/* <Route path="profile" element={<Profile />} /> */}
        </Routes>
      </main>
    </div>
  );
};

export default TeacherDashboard;
