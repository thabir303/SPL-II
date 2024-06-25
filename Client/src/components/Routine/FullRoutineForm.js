import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FullRoutineForm = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [formData, setFormData] = useState({
    sectionName: '',
    dayNo: '',
    startTime: '',
    endTime: '',
    courseId: '',
    teacherId: '',
    roomNo: '',
    semesterName: '',
    classType: ''
  });
  const [semesters, setSemesters] = useState([]);
  const [days, setDays] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [semesterRes, dayRes, courseRes, teacherRes, roomRes, sectionRes] = await Promise.all([
          axios.get('http://localhost:5000/api/semesters'),
          axios.get('http://localhost:5000/api/days'),
          axios.get('http://localhost:5000/api/courses'),
          axios.get('http://localhost:5000/api/teachers'),
          axios.get('http://localhost:5000/api/rooms'),
          axios.get('http://localhost:5000/api/sections')
        ]);
        setSemesters(semesterRes.data);
        setDays(dayRes.data);
        setCourses(courseRes.data);
        setTeachers(teacherRes.data);
        setRooms(roomRes.data);
        setSections(sectionRes.data);
      } catch (error) {
        setError('Failed to fetch data for form');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFullRoutine = async () => {
      if (id) {
        try {
          const response = await axios.get(`http://localhost:5000/api/full-Routines/${id}`, {
          
          });
          setFormData(response.data);
        } catch (error) {
          setError('Failed to fetch full routine');
        }
      }
      setLoading(false);
    };

    fetchFullRoutine();
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/full-Routines/${id}`, formData, {

        });
        toast.success('Full routine updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/full-Routines', formData, {
        
        });
        toast.success('Full routine created successfully!');
      }
      setTimeout(() => {
        navigate('/admin/full-routines');
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      setError('Failed to save full routine');
      toast.error('Failed to save full routine');
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
      <h2 className="text-2xl mb-4">{id ? 'Update' : 'Create'} Full Routine</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <label className="block mb-4">
          <span className="text-gray-700">Semester</span>
          <select
            name="semesterName"
            value={formData.semesterName}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Semester</option>
              {semesters.map(semester => (
                <option key={semester._id} value={semester.semesterName}>{semester.semesterName}</option>
              ))}
            </select>
          </label>
          
          <label className="block mb-4">
            <span className="text-gray-700">Section</span>
            <select
              name="sectionName"
              value={formData.sectionName}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section._id} value={section.sectionName}>{section.sectionName}</option>
              ))}
            </select>
          </label>
  
          <label className="block mb-4">
            <span className="text-gray-700">Day</span>
            <select
              name="dayNo"
              value={formData.dayNo}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Day</option>
              {days.map(day => (
                <option key={day._id} value={day.dayNo}>{day.dayNo}</option>
              ))}
            </select>
          </label>
  
          <label className="block mb-4">
            <span className="text-gray-700">Time Slot</span>
            <select
              name="timeSlotNo"
              value={formData.timeSlotNo}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Time Slot</option>
              {semesters.map(semester => (
                <option key={semester._id} value={semester.timeSlotNo}>{semester.timeSlotNo}</option>
              ))}
            </select>
          </label>
  
          <label className="block mb-4">
            <span className="text-gray-700">Course</span>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course._id} value={course.courseId}>{course.courseName}</option>
              ))}
            </select>
          </label>
  
          <label className="block mb-4">
            <span className="text-gray-700">Teacher</span>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher.teacherId}>{teacher.teacherName}</option>
              ))}
            </select>
          </label>
  
          <label className="block mb-4">
            <span className="text-gray-700">Room</span>
            <select
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room._id} value={room.roomNo}>{room.roomNo}</option>
              ))}
            </select>
          </label>
  
          <label className="block mb-4">
            <span className="text-gray-700">Class Type</span>
            <select
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Class Type</option>
              <option value="Lab">Lab</option>
              <option value="Theory">Theory</option>
            </select>
          </label>
  
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            {id ? 'Update Full Routine' : 'Create Full Routine'}
          </button>
        </form>
      </div>
    );
  };
  
export default FullRoutineForm;
  