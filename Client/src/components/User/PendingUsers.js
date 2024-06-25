import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherIds, setTeacherIds] = useState({});
  const [batchNos, setBatchNos] = useState({});
  const [batches, setBatches] = useState([]);
  const [approveError, setApproveError] = useState(null);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/pending-users');
        setPendingUsers(response.data);
      } catch (error) {
        setError('Failed to fetch pending users');
      } finally {
        setLoading(false);
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/batches');
        setBatches(response.data);
      } catch (error) {
        setError('Failed to fetch batches');
      }
    };

    fetchPendingUsers();
    fetchBatches();
  }, []);

  const handleApprove = async (email, role) => {
    try {
      const data = { email };
      if (role === 'teacher') {
        data.teacherId = teacherIds[email];
      } else if (role === 'student') {
        data.batchNo = batchNos[email];
      }

      const response = await axios.post('http://localhost:5000/api/admin/approve-user', data);
      toast.success(response.data.message, { autoClose: 2000 });
      setApproveError(null);
      setPendingUsers(pendingUsers.filter((user) => user.email !== email));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setApproveError(error.response.data.error);
      } else {
        setApproveError('Failed to approve user');
      }
    }
  };

  const handleChangeTeacherId = (email, value) => {
    setTeacherIds({ ...teacherIds, [email]: value });
  };

  const handleChangeBatchNo = (email, value) => {
    setBatchNos({ ...batchNos, [email]: value });
  };

  if (loading) {
    return <div className="text-center mt-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-6 text-red-500">{error}</div>;
  }

  if (pendingUsers.length === 0) {
    return <div className="p-6 text-center">No pending users found.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-6 text-center">Pending Users</h2>
      {approveError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{approveError}</div>}
      <ul className="space-y-4">
        {pendingUsers.map((user) => (
          <li key={user.email} className="bg-white p-4 rounded shadow">
            <p className="text-lg font-semibold"><strong>Name:</strong> {user.name}</p>
            <p className="text-lg"><strong>Email:</strong> {user.email}</p>
            <p className="text-lg"><strong>Role:</strong> {user.role}</p>
            {user.role === 'teacher' && (
              <input
                type="text"
                placeholder="Teacher ID"
                value={teacherIds[user.email] || ''}
                onChange={(e) => handleChangeTeacherId(user.email, e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded mb-4"
              />
            )}
            {user.role === 'student' && (
              <select
                value={batchNos[user.email] || ''}
                onChange={(e) => handleChangeBatchNo(user.email, e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded mb-4"
              >
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch.batchNo}>
                    {batch.batchNo}
                  </option>
                ))}
              </select>
            )}
            <button 
              onClick={() => handleApprove(user.email, user.role)} 
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300"
            >
              Approve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingUsers;
