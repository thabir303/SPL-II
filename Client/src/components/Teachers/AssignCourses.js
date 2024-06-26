import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignCourses = () => {
  const { teacherId } = useParams();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({courses: [{ courseId: '', courseName: '', credit: '', type: '', semesterName: '', isActive: true }]});
  const [availableCourses, setAvailableCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [allCoursesResponse, teacherResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/courses'),
          axios.get(`http://localhost:5000/api/teachers/${teacherId}`)
        ]);
        setAvailableCourses(allCoursesResponse.data);
        setAssignedCourses(teacherResponse.data.assignedCourses || []);
      } catch (error) {
        setError('Failed to fetch courses or teacher');
        toast.error('Failed to fetch courses or teacher', { autoClose: 2000 });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [teacherId]);

  const handleCourseChange = (e, index) => {
    const selectedCourseId = e.target.value.split('|')[1].trim();
    const selectedCourse = availableCourses.find(course => course.courseId === selectedCourseId);
    const newCourses = [...formData.courses];
    newCourses[index] = { 
      ...newCourses[index], 
      courseId: selectedCourse.courseId,
      courseName: selectedCourse.courseName,
      credit: selectedCourse.credit,
      type: selectedCourse.type,
      semesterName: selectedCourse.semesterName
    };
    setFormData({ courses: newCourses });
  };

  const addCourseField = () => {
    setFormData({ courses: [...formData.courses, { courseId: '', courseName: '', credit: '', type: '', semesterName: '', isActive: true }] });
  };

  const removeCourseField = (index) => {
    const newCourses = formData.courses.filter((_, i) => i !== index);
    setFormData({ courses: newCourses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation check
    const invalidCourse = formData.courses.some(course => !course.courseId);
    if (invalidCourse) {
      toast.error('Please select a valid course for all entries.', { autoClose: 2000 });
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/courses/${teacherId}/assign`, formData, {
      
      });
      toast.success('Courses assigned successfully', { autoClose: 2000 });
      navigate('/admin/teachers');
    } catch (error) {
      setError('Failed to assign courses');
      toast.error('Failed to assign courses', { autoClose: 2000 });
    }
  };
  const handleCheckboxChange = async (e, index) => {
    const newCourses = [...formData.courses];
    newCourses[index].isActive = e.target.checked;
    setFormData({ courses: newCourses });

    if (!e.target.checked) {
      try {
        await axios.post(`http://localhost:5000/api/courses/${teacherId}/remove`, { courseId: newCourses[index].courseId }, {
          headers: {
            // Authorization: `Bearer ${user.token}`
          }
        });
        toast.success('Course removed successfully', { autoClose: 2000 });
      } catch (error) {
        setError('Failed to remove course');
        toast.error('Failed to remove course', { autoClose: 2000 });
      }
    }
  };

  const getFilteredCourses = () => {
    const selectedCourseIds = formData.courses.map(course => course.courseId);
    return availableCourses.filter(course => 
      !selectedCourseIds.includes(course.courseId) && !assignedCourses.includes(course.courseId)
    );
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Assign Courses to Teacher</h2>
        <form onSubmit={handleSubmit}>
          {formData.courses.map((course, index) => (
            <div key={index} className="mb-4">
              <label htmlFor={`courseId-${index}`} className="block text-gray-700 font-bold mb-2">Course</label>
              <select
                id={`courseId-${index}`}
                name="courseId"
                value={`${course.courseName} | ${course.courseId}`}
                onChange={(e) => handleCourseChange(e, index)}
                className="block w-full p-2 border border-gray-300 rounded mb-4"
              >
                <option value="">Select Course</option>
                {getFilteredCourses().map((c) => (
                  <option key={c.courseId} value={`${c.courseName} | ${c.courseId}`}>{`${c.courseName} | ${c.courseId}`}</option>
                ))}
              </select>
              <input
                type="text"
                name="courseName"
                placeholder="Course Name"
                value={course.courseName}
                readOnly
                className="block w-full p-2 border border-gray-300 rounded mb-4"
              />
              <input
                type="number"
                name="credit"
                placeholder="Credit"
                value={course.credit}
                readOnly
                className="block w-full p-2 border border-gray-300 rounded mb-4"
              />
              <input
                type="text"
                name="semesterName"
                placeholder="Semester Name"
                value={course.semesterName}
                readOnly
                className="block w-full p-2 border border-gray-300 rounded mb-4"
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={course.isActive}
                  onChange={(e) => handleCheckboxChange(e, index)}
                  className="mr-2"
                />
                <span>Active</span>
              </div>
              <button type="button" onClick={() => removeCourseField(index)} className="bg-red-500 text-white p-2 rounded mt-2">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addCourseField} className="bg-blue-500 text-white p-2 rounded mb-4">
            Add Another Course
          </button>
          <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
            Assign Courses
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignCourses;