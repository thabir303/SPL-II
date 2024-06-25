import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
// import ViewRoutine from "../Routine/ViewRoutine";
import axios from 'axios';
// import FullRoutine from "../Routine/FullRoutine";
import StudentsFullRoutine from "../Students/StudentsRoutine";

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [routine, setRoutine] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchRoutine = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/full-routines`);
      setRoutine(response.data);
    } catch (error) {
      console.error("Error fetching routine:", error);
    }
  };

  useEffect(() => {
    if (user && user.batchNo) {
      fetchRoutine();
    }
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path ? "bg-gray-700 font-bold" : "hover:bg-gray-700";
  };

  return (
    <div className="flex min-h-screen">
      <aside className="bg-gray-800 text-white w-64 p-6 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Student</h1>
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <nav className="flex flex-col space-y-4 flex-grow">
          <Link to="/student/weekly-schedule" className={`p-2 rounded ${isActive("/student/weekly-schedule")}`}>
            View Routine
          </Link>
          {/* <Link to="/student/view-routine" className={`p-2 rounded ${isActive("/student/view-routine")}`}>
            View Routine
          </Link> */}
        </nav>
        <div className="mt-6 sticky bottom-0 bg-gray-800">
          <div onClick={() => navigate("/student")} className="cursor-pointer p-2 rounded flex items-center space-x-2 hover:bg-gray-700">
            <span>{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="bg-red-500 p-2 rounded mt-4 w-full">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-grow p-6 bg-gray-100">
        <Routes>
        <Route path="/" element={<StudentsFullRoutine />} />
          <Route path="weekly-schedule" element={<StudentsFullRoutine />} />
          {/* <Route path="view-routine" element={<ViewRoutine />} /> */}
        </Routes>
      </main>
    </div>
  );
};

export default StudentDashboard;
