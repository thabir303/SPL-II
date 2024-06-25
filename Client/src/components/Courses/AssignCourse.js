// src/components/AssignCourse.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AssignCourse = () => {
  const { courseId } = useParams();
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    teacherId: '',
    semesterName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers');
        setTeachers(response.data);
      } catch (error) {
        setError('Failed to fetch teachers');
      }
    };

    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/assign`, formData);
      toast.success('Course assigned successfully');
      navigate('/courses');
    } catch (error) {
      setError('Failed to assign course');
      toast.error('Failed to assign course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Assign Course to Teacher</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <select
          name="teacherId"
          value={formData.teacherId}
          onChange={handleChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          required
        >
          <option value="">Select Teacher</option>
          {teachers.map(teacher => (
            <option key={teacher._id} value={teacher.teacherId}>{teacher.teacherName}</option>
          ))}
        </select>
        <input
          type="text"
          name="semesterName"
          placeholder="Semester Name"
          value={formData.semesterName}
          onChange={handleChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Assigning...' : 'Assign Course'}
        </button>
      </form>
    </div>
  );
};

export default AssignCourse;
