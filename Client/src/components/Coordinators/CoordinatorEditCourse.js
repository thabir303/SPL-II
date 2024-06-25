import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CoordinatorEditCourse = () => {
  const [formData, setFormData] = useState({
    courseId: '',
    courseName: '',
    credit: '',
    type: '',
    semesterName: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/semesters');
        setSemesters(response.data);
      } catch (error) {
        setError('Failed to fetch semesters');
        toast.error('Failed to fetch semesters');
      }
    };

    fetchSemesters();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/courses', formData);
      toast.success('Course added successfully');
      navigate('/coordinator/courses');
    } catch (error) {
      setError('Failed to add course');
      toast.error('Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Add New Course</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <input
          type="text"
          name="courseId"
          placeholder="Course ID"
          value={formData.courseId}
          onChange={handleChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <input
          type="text"
          name="courseName"
          placeholder="Course Name"
          value={formData.courseName}
          onChange={handleChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <input
          type="number"
          name="credit"
          placeholder="Credit"
          value={formData.credit}
          onChange={handleChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          required
        >
          <option value="">Select Type</option>
          <option value="Lab">Lab</option>
          <option value="Theory">Theory</option>
        </select>
        <select
          name="semesterName"
          value={formData.semesterName}
          onChange={handleChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          required
        >
          <option value="">Select Semester</option>
          {semesters.map((semester) => (
            <option key={semester._id} value={semester.semesterName}>
              {semester.semesterName}
            </option>
          ))}
        </select>
        <label className="block mb-4">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="mr-2"
          />
          Active
        </label>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Course'}
        </button>
      </form>
    </div>
  );
};

export default CoordinatorEditCourse;
