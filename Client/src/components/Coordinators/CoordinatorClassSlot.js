import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../../context/AuthContext';

const CoordinatorClassSlot = () => {
  const { user } = useContext(AuthContext);
  const [classSlots, setClassSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [coordinatorSemester, setCoordinatorSemester] = useState('');

  const timeSlots = [
    { start: '8:00', end: '8:50' },
    { start: '9:00', end: '9:50' },
    { start: '10:00', end: '10:50' },
    { start: '11:00', end: '11:50' },
    { start: '12:00', end: '12:50' },
    { start: '13:00', end: '14:00', label: 'Lunch Break' },
    { start: '14:00', end: '14:50' },
    { start: '15:00', end: '15:50' },
    { start: '16:00', end: '16:50' },
  ];

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  useEffect(() => {
    const fetchCoordinatorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/coordinators/E18`);
        setCoordinatorSemester(response.data.semesterName);

        const slotsResponse = await axios.get(`http://localhost:5000/api/class-slots/semester/${response.data.semesterName}`);
        setClassSlots(slotsResponse.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch coordinator details or class slots');
        setLoading(false);
        toast.error('Failed to fetch coordinator details or class slots', { autoClose: 2000 });
      }
    };

    fetchCoordinatorDetails();
  }, [user.coordinatorId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/class-slots/${slotToDelete}`);
      setClassSlots(classSlots.filter(slot => slot._id !== slotToDelete));
      toast.success('Class slot deleted successfully', { autoClose: 2000 });
      setShowModal(false);
      setSlotToDelete(null);
    } catch (error) {
      setError('Failed to delete class slot');
      toast.error('Failed to delete class slot', { autoClose: 2000 });
    }
  };

  const calculateColSpan = (startTime, endTime) => {
    const startIndex = timeSlots.findIndex(slot => slot.start === startTime);
    const endIndex = timeSlots.findIndex(slot => slot.end === endTime);
    return endIndex - startIndex + 1;
  };

  const renderTable = (semesterName) => {
    const table = Array.from({ length: days.length }, () => Array(timeSlots.length).fill(null));

    classSlots.forEach(slot => {
      if (slot.semesterName !== semesterName) return;

      const dayIndex = days.indexOf(slot.day);
      const startTimeIndex = timeSlots.findIndex(t => t.start === slot.startTime);
      const colSpan = calculateColSpan(slot.startTime, slot.endTime);

      if (dayIndex !== -1 && startTimeIndex !== -1) {
        for (let i = 0; i < colSpan; i++) {
          if (!table[dayIndex][startTimeIndex + i]) {
            table[dayIndex][startTimeIndex + i] = [];
          }
          table[dayIndex][startTimeIndex + i].push(
            <div key={`${slot._id}-${i}`} className="border border-gray-300 p-2 bg-white rounded shadow mb-2">
              <p><strong>Course:</strong> {slot.courseId}</p>
              <p><strong>Teacher:</strong> {slot.teacherName}</p>
              <p><strong>Section:</strong> {slot.section}</p>
              <p><strong>Room:</strong> {slot.roomNo}</p>
              <p><strong>Class Type:</strong> {slot.classType}</p>
              {user.role === 'admin' || (user.role === 'coordinator' && coordinatorSemester === slot.semesterName) ? (
                <>
                  <Link to={`/coordinator/class-slots/update/${slot._id}`} className="bg-yellow-500 text-white p-1 rounded mr-2 btn-small">Edit</Link>
                  <button onClick={() => { setShowModal(true); setSlotToDelete(slot._id); }} className="bg-red-500 text-white p-1 rounded btn-small">Delete</button>
                </>
              ) : null}
            </div>
          );
        }
      }
    });

    return table;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const semesters = Array.from(new Set(classSlots.map(slot => slot.semesterName))).sort();
  const semesterColors = ['text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-orange-500', 'text-teal-500', 'text-pink-500', 'text-yellow-500'];
  const dayColors = ['text-red-500', 'text-green-500', 'text-blue-500', 'text-purple-500', 'text-orange-500'];

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold mb-6 text-center">Class Slots</h2>
      <Link to="/coordinator/class-slots/new" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4 inline-block transition duration-300">Add New Class Slot</Link>
      {semesters.map((semester, index) => {
        const table = renderTable(semester);
        return (
          <div key={index} className="mt-8">
            <h3 className={`text-xl mb-4 font-bold ${semesterColors[index % semesterColors.length]}`}>{semester} Semester</h3>
            <table className="min-w-full border-collapse border border-gray-400">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2">Time/Day</th>
                  {timeSlots.map((slot, index) => (
                    <th key={index} className="border border-gray-300 p-2">{slot.label || `${slot.start}-${slot.end}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dayIndex) => (
                  <tr key={dayIndex} className="even:bg-gray-50">
                    <td className={`border border-gray-300 p-2 font-semibold ${dayColors[dayIndex % dayColors.length]}`}>{day}</td>
                    {timeSlots.map((_, timeIndex) => {
                      const cell = table[dayIndex][timeIndex];
                      if (cell) {
                        const colSpan = cell[0].props.colSpan;
                        return (
                          <React.Fragment key={timeIndex}>
                            <td colSpan={colSpan} className="border border-gray-300 p-2">
                              {cell}
                            </td>
                            {Array.from({ length: colSpan - 1 }).map((_, i) => (
                              <td key={i} className="border border-gray-300 p-2"></td>
                            ))}
                          </React.Fragment>
                        );
                      } else if (timeIndex === 0 || !table[dayIndex][timeIndex - 1]) {
                        return <td key={timeIndex} className="border border-gray-300 p-2"></td>;
                      }
                      return null;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this class slot?</p>
            <div className="flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded mr-2 transition duration-300 hover:bg-gray-600">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded transition duration-300 hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorClassSlot;
