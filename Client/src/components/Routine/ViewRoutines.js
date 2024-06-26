import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2pdf from 'html2pdf.js';

const ViewRoutines = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/full-routines');
        setRoutines(response.data.sort((a, b) => a.batchNo.localeCompare(b.batchNo)));
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch routines');
        setLoading(false);
        toast.error('Failed to fetch routines', { autoClose: 2000 });
      }
    };

    fetchRoutines();
  }, []);

  const handlePrint = (routine) => {
    const element = document.getElementById(`routine-${routine._id}`);
    html2pdf().from(element).save(`${routine.batchNo}_routine.pdf`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Routines Sorted by Batch</h2>
      {routines.length === 0 ? (
        <p className="mt-4">No routines found.</p>
      ) : (
        <ul className="mt-4">
          {routines.map(routine => (
            <li key={routine._id} className="bg-white p-4 mb-4 rounded shadow" id={`routine-${routine._id}`}>
              <p><strong>Semester:</strong> {routine.semesterName}</p>
              <p><strong>Day:</strong> {routine.day}</p>
              <p><strong>Start Time:</strong> {routine.startTime}</p>
              <p><strong>End Time:</strong> {routine.endTime}</p>
              <p><strong>Course:</strong> {routine.courseId}</p>
              <p><strong>Teacher:</strong> {routine.teacherId}</p>
              <p><strong>Room:</strong> {routine.roomNo}</p>
              <p><strong>Section:</strong> {routine.section}</p>
              <p><strong>Class Type:</strong> {routine.classType}</p>
              <button onClick={() => handlePrint(routine)} className="bg-blue-500 text-white p-2 rounded">Print Routine</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewRoutines;
