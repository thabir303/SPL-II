// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Home from './components/Home';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import CoordinatorDashboard from './components/Dashboard/CoordinatorDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AuthContext from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {user && user.role === 'admin' && (
            <Route path="/admin/*" element={<AdminDashboard />} />
          )}
          {user && user.role === 'teacher' && (
            <Route path="/teacher/*" element={<TeacherDashboard />} />
          )}
          {user && user.role === 'student' && (
            <Route path="/student/*" element={<StudentDashboard />} />
          )}
          {user && user.role === 'coordinator' && (
            <Route path="/coordinator/*" element={<CoordinatorDashboard />} />
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
