import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../../context/AuthContext';
import backgroundImage from '../Assest/iit.jpeg';
import './Login.css'; // Make sure to import your custom CSS

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      const timer = setTimeout(() => {
        setLocalError(null);
        clearError();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(formData.email, formData.password);
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher');
      } else if (user.role === 'student') {
        navigate('/student');
      } else if (user.role === 'coordinator') {
        navigate('/coordinator');
      } else {
        navigate('/');
      }
    }
  };

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
        overflow: 'hidden'
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
          <h2 className="text-4xl font-semibold mb-6 text-gray-800 text-center">Login</h2>
          {localError && <p className="text-red-500 mb-4">{localError}</p>}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full p-4 text-xl border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full p-4 text-xl border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 text-xl bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
          <p className="mt-6 text-center text-base text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="mt-2 text-center text-base text-gray-600">
            Forgot your password?{' '}
            <Link to="/request-password-reset" className="text-blue-500 hover:underline">
              Reset Password
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
