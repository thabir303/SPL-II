import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditCoordinator = () => {
  const { coordinatorId } = useParams();
  const [formData, setFormData] = useState({
    coordinatorName: '',
    email: '',
    batchNo: '',
    expired_date: '',
  });
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [inCommittee, setInCommittee] = useState(false); // New state to track committee status
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoordinator = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/coordinators/${coordinatorId}`);
        
        setFormData({
          coordinatorName: response.data.coordinatorName,
          email: response.data.email,
          batchNo: response.data.batchNo,
          expired_date: new Date(response.data.expired_date).toISOString().split('T')[0], // format date for input[type=date]
        });
  
        try {
          const committeeResponse = await axios.get(`http://localhost:5000/api/auth/routine-committees/${coordinatorId}`);
          setInCommittee(committeeResponse.data.in_committee);
        } catch (committeeError) {
          if (committeeError.response && committeeError.response.status === 404) {
            setInCommittee(false); // Handle the case where the coordinator is not in the routine committee
          } else {
            throw committeeError;
          }
        }
      } catch (error) {
        setError('Failed to fetch coordinator details');
      } finally {
        setLoading(false);
      }
    };
  
    const fetchBatchNumbers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/batches'); // Adjust this endpoint as necessary
        setBatchNumbers(response.data);
      } catch (error) {
        setError('Failed to fetch batch numbers');
      }
    };
  
    fetchCoordinator();
    fetchBatchNumbers();
  }, [coordinatorId]);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/auth/coordinators/${coordinatorId}`, formData);
      setSuccessMessage(response.data.message);
      setError(null);
      setTimeout(() => {
        navigate('/admin/coordinator');
      }, 2000); // redirect after 2 seconds
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update coordinator');
      setSuccessMessage(null);
    }
  };

  const handleRemoveFromCommittee = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/auth/routine-committees/${coordinatorId}`, { in_committee: false });
      setSuccessMessage(response.data.message);
      setInCommittee(false); // Update the committee status
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to remove from committee');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Coordinator</h2>
        {successMessage && <div className="mb-4 text-green-500 text-center">{successMessage}</div>}
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="coordinatorName" className="block text-gray-700 font-bold mb-2">
              Coordinator Name
            </label>
            <input
              type="text"
              name="coordinatorName"
              placeholder="Enter coordinator name"
              value={formData.coordinatorName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="batchNo" className="block text-gray-700 font-bold mb-2">
              Batch No
            </label>
            <select
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Batch No</option>
              {batchNumbers.map((batch) => (
                <option key={batch._id} value={batch.batchNo}>
                  {batch.batchNo}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="expired_date" className="block text-gray-700 font-bold mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              name="expired_date"
              value={formData.expired_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 mb-4"
          >
            Update Coordinator
          </button>
          {inCommittee && (
            <button
              type="button"
              onClick={handleRemoveFromCommittee}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
            >
              Remove from Committee
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditCoordinator;
