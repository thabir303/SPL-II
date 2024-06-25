// src/components/CourseList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure toast notifications
// toast.configure({
//   autoClose: 1000, // Set default auto close time to 2 seconds
// });

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseToDelete}`);
      setCourses(courses.filter(course => course._id !== courseToDelete));
      toast.success('Course deleted successfully', { autoClose: 2000 });      
      setShowModal(false);
      setCourseToDelete(null);
    } catch (error) {
      setError('Failed to delete course');
      setTimeout(() => setError(null), 2000); // Clear error message after 2 seconds
    }
  };

  const confirmDelete = (courseId) => {
    setShowModal(true);
    setCourseToDelete(courseId);
  };

  const cancelDelete = () => {
    setShowModal(false);
    setCourseToDelete(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Courses</h2>
      <Link to="/admin/courses/new" className="bg-blue-500 text-white p-2 rounded">Add New Course</Link>
      {courses.length === 0 ? (
        <p className="mt-4">No courses found.</p>
      ) : (
        <ul className="mt-4">
          {courses.map(course => (
            <li key={course._id} className="bg-white p-4 mb-4 rounded shadow">
              <p><strong>Course ID:</strong> {course.courseId}</p>
              <p><strong>Course Name:</strong> {course.courseName}</p>
              <p><strong>Credit:</strong> {course.credit}</p>
              <p><strong>Type:</strong> {course.type}</p>
              <p><strong>Semester:</strong> {course.semesterName}</p>
              <Link to={`/admin/courses/update/${course.courseId}`} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</Link>
              <button onClick={() => confirmDelete(course._id)} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this course?</p>
            <div className="flex justify-end">
              <button onClick={cancelDelete} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
