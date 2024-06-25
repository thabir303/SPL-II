import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateBatch = () => {
  const [formData, setFormData] = useState({
    batchNo: '',
    semesterName: ''
  });
  const [semesters, setSemesters] = useState([]);
  const [existingBatches, setExistingBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [semesterRes, batchesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/semesters'),
          axios.get('http://localhost:5000/api/batches')
        ]);
        setSemesters(semesterRes.data);
        setExistingBatches(batchesRes.data);
      } catch (error) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Check if the batchNo already exists for the selected semesterName
    const existingBatch = existingBatches.find(
      (batch) => batch.semesterName === formData.semesterName && batch.batchNo === formData.batchNo
    );

    if (existingBatch) {
      setError('The batch number already exists for the selected semester name');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/batches', formData);
      setSuccessMessage(response.data.message);
      setFormData({
        batchNo: '',
        semesterName: ''
      });
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/admin/batches');
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      setError(error.response?.data?.error || 'Batch already running on a semester. You can Edit the Batch No or delete the Batch No');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Batch</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        {successMessage && <div className="mb-4 text-green-500 text-center">{successMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="batchNo" className="block text-gray-700 font-bold mb-2">
              Batch No
            </label>
            <input
              type="text"
              name="batchNo"
              placeholder="Enter batch no"
              value={formData.batchNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="semesterName" className="block text-gray-700 font-bold mb-2">
              Semester Name
            </label>
            <select
              name="semesterName"
              value={formData.semesterName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester._id} value={semester.semesterName}>
                  {semester.semesterName}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Batch'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBatch;
