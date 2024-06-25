// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from './Assest/iit.jpeg';

const Home = () => {
  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div className="absolute top-0 w-full py-4 bg-black bg-opacity-50 text-center">
        <h1 className="text-5xl font-bold text-white animate-marquee font-custom">
          Welcome to the Routine Management System
        </h1>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <div className="bg-white bg-opacity-70 p-10 rounded-lg shadow-lg w-full max-w-4xl">
          <h2 className="text-4xl font-semibold mb-6 text-gray-800">Manage Your Routines Effectively</h2>
          <p className="text-lg text-gray-700 mb-6">
            Welcome to the Routine Management System. Here you can manage your schedules, classes, and tasks with ease.
          </p>
          <div className="space-y-4">
            <Link to="/login" className="block w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center text-lg">
              Login
            </Link>
            <Link to="/signup" className="block w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center text-lg">
              Sign Up
            </Link>
            {/* <Link to="/about" className="block w-full py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-center text-lg">
              About Us
            </Link>
            <Link to="/contact" className="block w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-center text-lg">
              Contact Us
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
