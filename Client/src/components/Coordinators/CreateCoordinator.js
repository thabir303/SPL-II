import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

const CreateCoordinator = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    batchNo: "",
    coordinatorId: "",
    expired_date: "",
  });
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchBatchNumbers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/batches"); // Adjust this endpoint as necessary
        setBatchNumbers(response.data);
      } catch (error) {
        setError("Failed to fetch batch numbers");
      }
    };

    fetchBatchNumbers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/coordinators",
        formData,
        {}
      );
      setSuccessMessage(response.data.message);
      setFormData({
        name: "",
        email: "",
        password: "",
        batchNo: "",
        coordinatorId: "",
        expired_date: "",
      });
      setTimeout(() => {
        navigate("/admin/coordinator"); // Navigate to /admin/coordinator after a short delay
      }, 2000); // You can adjust the delay time as needed
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create coordinator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create Coordinator
        </h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        {successMessage && (
          <div className="mb-4 text-green-500 text-center">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-bold mb-2"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="batchNo"
              className="block text-gray-700 font-bold mb-2"
            >
              Batch No
            </label>
            <select
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
            <label
              htmlFor="coordinatorId"
              className="block text-gray-700 font-bold mb-2"
            >
              Coordinator ID
            </label>
            <input
              type="text"
              name="coordinatorId"
              placeholder="Enter coordinator ID"
              value={formData.coordinatorId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="expired_date"
              className="block text-gray-700 font-bold mb-2"
            >
              Expiry Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="expired_date"
                value={formData.expired_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Coordinator"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCoordinator;
