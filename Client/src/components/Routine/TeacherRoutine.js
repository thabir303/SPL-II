import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../../context/AuthContext';
import './FullRoutine.css';

const TeacherRoutine = () => {
  const { user } = useContext(AuthContext);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState("All");
  const [selectedView, setSelectedView] = useState("Today");

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

  const colors = [
    '#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0',
    '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
    '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#795548'
  ];

  const colorMap = new Map();

  const getColorForSlot = (slot) => {
    const key = `${slot.courseId}-${slot.section}-${slot.teacherId}`;
    if (!colorMap.has(key)) {
      const color = colors[colorMap.size % colors.length];
      colorMap.set(key, color);
    }
    return colorMap.get(key);
  };

  const fetchRoutines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/class-slots');
      const slots = response.data;

      const sortedRoutines = slots.sort((a, b) => {
        if (a.day !== b.day) return days.indexOf(a.day) - days.indexOf(b.day);
        if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
        return 0;
      });

      setRoutines(sortedRoutines);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch routines');
      setLoading(false);
      toast.error('Failed to fetch routines', { autoClose: 2000 });
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const groupRoutinesByDay = (routines) => {
    const grouped = routines.reduce((acc, routine) => {
      const { day } = routine;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(routine);
      return acc;
    }, {});

    // Sort routines by start time within each day
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  };

  const handlePrint = () => {
    const element = document.getElementById('routine-content');
    html2pdf().from(element).save();
  };

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const filteredRoutines = routines.filter((routine) => {
    if (selectedDay !== "All" && routine.day !== selectedDay) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  }

  const todayRoutines = routines.filter(routine => routine.day === today && routine.teacherId === user.teacherId);
  const groupedFilteredRoutines = groupRoutinesByDay(filteredRoutines);
  const groupedTodayRoutines = groupRoutinesByDay(todayRoutines);
  const groupedTeacherRoutines = groupRoutinesByDay(routines.filter(routine => routine.teacherId === user.teacherId));

  const calculateColSpan = (startTime, endTime) => {
    const startIndex = timeSlots.findIndex(slot => slot.start === startTime);
    const endIndex = timeSlots.findIndex(slot => slot.end === endTime);
    return endIndex - startIndex + 1;
  };

  const renderTable = (groupedRoutines) => {
    const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    return (
      <>
        {days.map((day, dayIndex) => {
          const routinesForDay = groupedRoutines[day] || [];
          if (routinesForDay.length > 0) {
            return (
              <div key={day} className="mt-8">
                <h3 className={`text-xl mb-4 font-bold text-${['red', 'green', 'blue', 'purple', 'orange'][dayIndex % 5]}-500`}>{day}</h3>
                <table className="min-w-full border-collapse border border-gray-400">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2">Semester</th>
                      {timeSlots.map((slot, index) => (
                        <th key={index} className="border border-gray-300 p-2">{slot.label || `${slot.start}-${slot.end}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {semesters.map((semester, semesterIndex) => {
                      const routinesInSemester = routinesForDay.filter(routine => routine.semesterName === semester);
                      if (routinesInSemester.length > 0) {
                        return (
                          <tr key={semesterIndex} className="even:bg-gray-50">
                            <td className="border border-gray-300 p-2 font-semibold">{`${semester} Semester`}</td>
                            {timeSlots.map((slot, timeIndex) => {
                              const routinesInSlot = routinesInSemester.filter(routine => routine.startTime === slot.start);
                              if (routinesInSlot.length > 0) {
                                const routine = routinesInSlot[0];
                                return (
                                  <td key={timeIndex} className="border border-gray-300 p-2" colSpan={calculateColSpan(routine.startTime, routine.endTime)}>
                                    {routinesInSlot.map((routine, index) => {
                                      const color = getColorForSlot(routine);
                                      return (
                                        <div key={index} className="border border-gray-300 p-2 rounded shadow mb-2" style={{ backgroundColor: color }}>
                                          <p><strong>Class:</strong> {routine.courseId} ({routine.classType === 'Lab' ? 'L' : 'T'})</p>
                                          <p><strong>Teacher:</strong> {routine.teacherName}</p>
                                          <p><strong>Room:</strong> {routine.roomNo}</p>
                                          <p><strong>Section:</strong> {routine.section}</p>
                                          {routine.teacherId === user.teacherId && (
                                            <Link to={`/teacher/reschedule-routine/${routine._id}`} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-300">
                                              Edit
                                            </Link>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </td>
                                );
                              }
                              return <td key={timeIndex} className="border border-gray-300 p-2"></td>;
                            })}
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
          return null;
        })}
      </>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold mb-6 text-center">Teacher Dashboard</h2>
      <div className="flex justify-center mb-6">
        <button
          onClick={() => handleViewChange("Today")}
          className={`w-64 p-3 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${selectedView === "Today" ? 'bg-blue-500 text-white' : ''}`}
        >
          Today
        </button>
        <button
          onClick={() => handleViewChange("All")}
          className={`w-64 p-3 ml-4 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${selectedView === "All" ? 'bg-blue-500 text-white' : ''}`}
        >
          All
        </button>
        <button
          onClick={() => handleViewChange("Weekly")}
          className={`w-64 p-3 ml-4 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${selectedView === "Weekly" ? 'bg-blue-500 text-white' : ''}`}
        >
          Own Routine
        </button>
        {selectedView === "All" && (
          <select
            value={selectedDay}
            onChange={handleDayChange}
            className="w-64 p-3 ml-4 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
          >
            <option value="All">Sort By Day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        )}
      </div>
      <div id="routine-content" className="printable">
        {selectedView === "Today" && renderTable(groupedTodayRoutines)}
        {selectedView === "All" && renderTable(groupedFilteredRoutines)}
        {selectedView === "Weekly" && renderTable(groupedTeacherRoutines)}
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Print Routine
        </button>
      </div>
    </div>
  );
};

export default TeacherRoutine;
