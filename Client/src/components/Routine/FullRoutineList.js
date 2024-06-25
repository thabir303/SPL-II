import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FullRoutineList = () => {
  const { user } = useContext(AuthContext);
  const [fullRoutines, setFullRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFullRoutines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/full-Routines', {
         
        });
        setFullRoutines(response.data);
      } catch (error) {
        setError('Failed to fetch full routines');
      } finally {
        setLoading(false);
      }
    };

    fetchFullRoutines();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this full routine?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/full-Routines/${id}`, {
       
      });
      setFullRoutines(fullRoutines.filter(routine => routine._id !== id));
      toast.success('Full routine deleted successfully!');
    } catch (error) {
      setError('Failed to delete full routine');
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
      <h2 className="text-2xl mb-4">Full Routines</h2>
      <Link to="/admin/full-routines/new" className="bg-blue-500 text-white p-2 rounded">Add New Full Routine</Link>
      {fullRoutines.length === 0 ? (
        <p className="mt-4">No full routines found.</p>
      ) : (
        <ul className="mt-4">
          {fullRoutines.map(routine => (
            <li key={routine._id} className="bg-white p-4 mb-4 rounded shadow">
              <p><strong>Semester:</strong> {routine.semesterName}</p>
              <p><strong>Section:</strong> {routine.sectionName}</p>
              <p><strong>Day:</strong> {routine.dayNo}</p>
              <p><strong>Time Slot:</strong> {routine.timeSlotNo}</p>
              <p><strong>Course:</strong> {routine.courseName}</p>
              <p><strong>Teacher:</strong> {routine.teacherName}</p>
              <p><strong>Room:</strong> {routine.roomNo}</p>
              <Link to={`/admin/full-routines/update/${routine._id}`} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</Link>
              <button onClick={() => handleDelete(routine._id)} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FullRoutineList;
