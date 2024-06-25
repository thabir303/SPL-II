import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import backgroundImage from '../Assest/iit.jpeg';
import './Login.css'; 

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const { signup, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await signup(formData.name, formData.email, formData.password, formData.role);
    if (response) {
      navigate('/login');
    }
  };

  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover', // Ensures the image covers the container
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '100vw', // Ensures full viewport width
        height: '100vh', // Ensures full viewport height
        overflow: 'hidden' // Prevents scrolling
      }}
    >

<div className="absolute top-0 w-full py-4 bg-black bg-opacity-50 text-center">
        <h1 className="text-5xl font-bold text-white animate-marquee font-custom">
          Welcome to Institute of Information Technology
        </h1>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="relative bg-white bg-opacity-70 p-20 rounded-lg shadow-lg border border-blue-500 border-opacity-50 w-3/4 max-w-lg transition-transform duration-300 ease-in-out transform hover:scale-105"
        >
          <h2 className="text-4xl font-semibold mb-6 text-gray-800 text-center">Sign Up</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full p-4 text-xl border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full p-4 text-xl border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full p-4 text-xl border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full p-4 text-xl border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <button type="submit" className="w-full py-3 text-xl bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Sign Up
          </button>
          <div className="mt-6 text-center text-gray-600">
            <p>
              Already signed up? <Link to="/login" className="text-blue-500 hover:underline">Log In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
