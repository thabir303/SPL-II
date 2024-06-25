import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import './FullRoutine.css';

const FullRoutine = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("All");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");

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
    const fetchRoutines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/full-routines');
        const slots = response.data;

        const slotsWithTeacherNames = await Promise.all(
          slots.map(async (slot) => {
            const teacherResponse = await axios.get(`http://localhost:5000/api/teachers/${slot.teacherId}`);
            return { ...slot, teacherName: teacherResponse.data.teacherName };
          })
        );

        const sortedRoutines = slotsWithTeacherNames.sort((a, b) => {
          if (a.semesterName < b.semesterName) return -1;
          if (a.semesterName > b.semesterName) return 1;
          if (a.startTime < b.startTime) return -1;
          if (a.startTime > b.startTime) return 1;
          return 0;
        });

        setRoutines(sortedRoutines);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch full routines');
        setLoading(false);
        toast.error('Failed to fetch full routines', { autoClose: 2000 });
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers');
        setTeachers(response.data);
      } catch (error) {
        toast.error('Failed to fetch teachers', { autoClose: 2000 });
      }
    };

    const fetchSections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sections');
        setSections(response.data);
      } catch (error) {
        toast.error('Failed to fetch sections', { autoClose: 2000 });
      }
    };

    fetchRoutines();
    fetchTeachers();
    fetchSections();
  }, []);

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleTeacherChange = (event) => {
    setSelectedTeacher(event.target.value);
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const filteredRoutines = routines.filter((routine) => {
    if (selectedSemester && routine.semesterName !== selectedSemester) {
      return false;
    }
    if (selectedTeacher !== "All" && routine.teacherId !== selectedTeacher) {
      return false;
    }
    if (selectedSection !== "All" && routine.section !== selectedSection) {
      return false;
    }
    if (selectedDay !== "All" && routine.day !== selectedDay) {
      return false;
    }
    return true;
  });

  const renderTable = (semesterName) => {
    const table = Array.from({ length: days.length }, () => Array(timeSlots.length).fill(null));

    filteredRoutines.forEach(slot => {
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
              <p><strong>Class:</strong> {slot.courseId} ({slot.classType === 'Lab' ? 'L' : 'T'})</p>
              <p><strong>Teacher:</strong> {slot.teacherName}</p>
              <p><strong>Room:</strong> {slot.roomNo}</p>
              <p><strong>Section:</strong> {slot.section}</p>
            </div>
          );
        }
      }
    });

    return table;
  };

  const calculateColSpan = (startTime, endTime) => {
    const startIndex = timeSlots.findIndex(slot => slot.start === startTime);
    const endIndex = timeSlots.findIndex(slot => slot.end === endTime);
    return endIndex - startIndex + 1;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const semesters = Array.from(new Set(routines.map(slot => slot.semesterName))).sort();
  const semesterColors = ['text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-orange-500', 'text-teal-500', 'text-pink-500', 'text-yellow-500'];
  const dayColors = ['text-red-500', 'text-green-500', 'text-blue-500', 'text-purple-500', 'text-orange-500'];

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold mb-6 text-center">View Routine</h2>
      <div className="flex justify-center mb-6">
        <select
          value={selectedSemester}
          onChange={handleSemesterChange}
          className="w-64 p-3 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
        >
          <option value="">All Semesters</option>
          {semesters.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
        <select
          value={selectedTeacher}
          onChange={handleTeacherChange}
          className="w-64 p-3 ml-4 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
        >
          <option value="All">Sort By Teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher.teacherId}>
              {teacher.teacherName}
            </option>
          ))}
        </select>
        <select
          value={selectedSection}
          onChange={handleSectionChange}
          className="w-64 p-3 ml-4 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
        >
          <option value="All">Sort By Section</option>
          {sections.map((section) => (
            <option key={section._id} value={section.sectionName}>
              {section.sectionName}
            </option>
          ))}
        </select>
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
      </div>
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
                    {timeSlots.map((_, timeIndex) => (
                      <td key={timeIndex} className="border border-gray-300 p-2">
                        {table[dayIndex][timeIndex]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default FullRoutine;