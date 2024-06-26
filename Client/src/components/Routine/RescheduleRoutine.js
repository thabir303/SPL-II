import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

const RescheduleRoutine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    semesterName: '',
    day: '',
    startTime: '',
    endTime: '',
    courseId: '',
    teacherId: '',
    roomNo: '',
    section: '',
    classType: '',
    expirationDate: '',
  });
  const [semesters, setSemesters] = useState([]);
  const [days, setDays] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          routineResponse,
          semesterRes,
          dayRes,
          roomRes,
          sectionRes,
          timeSlotRes,
          teacherRes,
        ] = await Promise.all([
          axios.get(`http://localhost:5000/api/class-slots/${id}`),
          axios.get('http://localhost:5000/api/semesters'),
          axios.get('http://localhost:5000/api/days'),
          axios.get('http://localhost:5000/api/rooms'),
          axios.get('http://localhost:5000/api/sections'),
          axios.get('http://localhost:5000/api/class-slots/time-slots'),
          axios.get('http://localhost:5000/api/teachers'),
        ]);

        const routineData = routineResponse.data;

        setFormData({
          semesterName: routineData.semesterName,
          day: routineData.day,
          startTime: routineData.startTime,
          endTime: routineData.endTime,
          courseId: routineData.courseId,
          teacherId: routineData.teacherId,
          roomNo: routineData.roomNo,
          section: routineData.section,
          classType: routineData.classType,
          expirationDate: routineData.expirationDate,
        });

        setSemesters(semesterRes.data);
        setDays(dayRes.data);
        setRooms(roomRes.data);
        setSections(sectionRes.data);
        setTimeSlots(timeSlotRes.data);
        setTeachers(teacherRes.data);

        if (routineData.teacherId) {
          const courseResponse = await axios.get(`http://localhost:5000/api/courses/teacher/${routineData.teacherId}`);
          setAssignedCourses(courseResponse.data);
        }

        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch data', { autoClose: 2000 });
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTeacherChange = async (e) => {
    const teacherId = e.target.value;
    setFormData({ ...formData, teacherId });

    if (teacherId) {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/teacher/${teacherId}`);
        setAssignedCourses(response.data);
      } catch (error) {
        toast.error('Failed to fetch assigned courses', { autoClose: 2000 });
      }
    } else {
      setAssignedCourses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5000/api/class-slots/${id}`, formData);
      toast.success('Routine updated successfully', { autoClose: 2000 });
      navigate('/teacher/routine'); // Trigger re-fetch by navigating back to the routine list
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error.join(', ')
          : error.response.data.error;
        toast.error(errorMessage, { autoClose: 3000 });
      } else {
        toast.error('Failed to update routine', { autoClose: 2000 });
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // if (error) {
  //   return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  // }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Reschedule Routine</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="semesterName" className="block text-gray-700 font-semibold mb-2">Semester</label>
            <select
              id="semesterName"
              name="semesterName"
              value={formData.semesterName}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester._id} value={semester.semesterName}>
                  {semester.semesterName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="day" className="block text-gray-700 font-semibold mb-2">Day</label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Day</option>
              {days.map((day) => (
                <option key={day._id} value={day.dayNo}>
                  {day.dayNo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startTime" className="block text-gray-700 font-semibold mb-2">Start Time</label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Start Time</option>
              {timeSlots.map((time, index) => (
                <option key={index} value={time.split('-')[0]}>
                  {time.split('-')[0]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endTime" className="block text-gray-700 font-semibold mb-2">End Time</label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select End Time</option>
              {timeSlots.map((time, index) => (
                <option key={index} value={time.split('-')[1]}>
                  {time.split('-')[1]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="teacherId" className="block text-gray-700 font-semibold mb-2">Teacher</label>
            <select
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleTeacherChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher.teacherId}>
                  {`${teacher.teacherName} | ${teacher.teacherId}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="courseId" className="block text-gray-700 font-semibold mb-2">Course</label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              {assignedCourses.map((course) => (
                <option key={course._id} value={course.courseId}>
                  {course.courseId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="roomNo" className="block text-gray-700 font-semibold mb-2">Room</label>
            <select
              id="roomNo"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room.roomNo}>
                  {room.roomNo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="section" className="block text-gray-700 font-semibold mb-2">Section</label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section._id} value={section.sectionName}>
                  {section.sectionName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="classType" className="block text-gray-700 font-semibold mb-2">Class Type</label>
            <select
              id="classType"
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class Type</option>
              {['Theory', 'Lab'].map((classType) => (
                <option key={classType} value={classType}>
                  {classType}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expirationDate" className="block text-gray-700 font-semibold mb-2">Expiration Date</label>
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Update Routine
          </button>
        </form>
      </div>
    </div>
  );
};

export default RescheduleRoutine;