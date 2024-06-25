import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/auth/protected', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user); // Ensure you set the correct user data
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user');
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUser(response.data.user); // Ensure you set the correct user data
      localStorage.setItem('token', response.data.token);
      setError(null); // Clear any previous errors on successful login
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.response?.data?.error || 'Failed to log in');
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password, role });
      return response.data;
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.response?.data?.error || 'Failed to sign up');
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
      setUser(null);
      localStorage.removeItem('token');
      setError(null); // Clear any previous errors on logout
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
