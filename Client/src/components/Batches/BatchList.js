import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/batches');
        setBatches(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch batches');
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/batches/${batchToDelete}`);
      setBatches(batches.filter(batch => batch.batchNo !== batchToDelete));
      setSuccessMessage('Batch deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3 seconds
      setShowModal(false);
      setBatchToDelete(null);
    } catch (error) {
      setError('Failed to delete batch');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Batches</h2>
      <Link to="/admin/batches/new" className="bg-blue-500 text-white p-2 rounded">Add New Batch</Link>
      {successMessage && <div className="bg-green-100 text-green-700 p-2 rounded mt-4">{successMessage}</div>}
      {batches.length === 0 ? (
        <p className="mt-4">No batches found.</p>
      ) : (
        <ul className="mt-4">
          {batches.map(batch => (
            <li key={batch.batchNo} className="bg-white p-4 mb-4 rounded shadow">
              <p><strong>Batch No:</strong> {batch.batchNo}</p>
              <p><strong>Semester Name:</strong> {batch.semesterName}</p>
              {batch.coordinatorId ? (
                <p><strong>Coordinator ID:</strong> {batch.coordinatorId}</p>
              ) : (
                <p className="text-red-500"><strong>Coordinator ID:</strong> Not assigned yet</p>
              )}
              {batch.coordinatorEmail ? (
                <p><strong>Coordinator Email:</strong> {batch.coordinatorEmail}</p>
              ) : (
                <p className="text-red-500"><strong>Coordinator Email:</strong> Not assigned yet</p>
              )}
              <Link to={`/admin/batches/update/${batch.batchNo}`} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</Link>
              <button onClick={() => { setShowModal(true); setBatchToDelete(batch.batchNo); }} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </li>
          ))}
        </ul>
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this batch?</p>
            <div className="flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchList;
