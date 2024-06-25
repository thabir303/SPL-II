import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditTeacher = () => {
  const { teacherId } = useParams();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    teacherName: '',
    departmentName: '',
    teacherId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/teachers/${teacherId}`);
        setFormData(response.data.data);
      } catch (error) {
        setError('Failed to fetch teacher');
        toast.error('Failed to fetch teacher', { autoClose: 2000 });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/teachers/edit/${teacherId}`, formData, {
       
      });
      toast.success('Teacher updated successfully', { autoClose: 2000 });
      navigate('/admin/teachers');
    } catch (error) {
      setError('Failed to update teacher');
      toast.error('Failed to update teacher', { autoClose: 2000 });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Teacher</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="teacherName" className="block text-gray-700 font-bold mb-2">Teacher Name</label>
            <input
              type="text"
              id="teacherName"
              name="teacherName"
              value={formData.teacherName}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="departmentName" className="block text-gray-700 font-bold mb-2">Department Name</label>
            <input
              type="text"
              id="departmentName"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="teacherId" className="block text-gray-700 font-bold mb-2">Teacher ID</label>
            <input
              type="text"
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              disabled
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            />
          </div>
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300">Update Teacher</button>
        </form>
      </div>
    </div>
  );
};

export default EditTeacher;
