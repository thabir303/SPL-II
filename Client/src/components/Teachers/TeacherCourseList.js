import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBook, FaIdCard, FaCreditCard, FaListAlt, FaCalendarAlt } from 'react-icons/fa';

const TeacherCourseList = () => {
  const { user } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('myCourses');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [myCoursesResponse, allCoursesResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/courses/teacher/${user.teacherId}`),
          axios.get('http://localhost:5000/api/courses'),
        ]);

        setMyCourses(myCoursesResponse.data);
        setAllCourses(allCoursesResponse.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch courses');
        setLoading(false);
        toast.error('Failed to fetch courses', { autoClose: 2000 });
      }
    };

    fetchCourses();
  }, [user.teacherId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  }

  const CourseCard = ({ course }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">{course.courseName}</h3>
      <div className="space-y-2">
        <p className="flex items-center"><FaIdCard className="mr-2 text-gray-500" /> {course.courseId}</p>
        <p className="flex items-center"><FaCreditCard className="mr-2 text-gray-500" /> {course.credit} credits</p>
        <p className="flex items-center"><FaListAlt className="mr-2 text-gray-500" /> {course.type}</p>
        <p className="flex items-center"><FaCalendarAlt className="mr-2 text-gray-500" /> {course.semesterName}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Course Management</h1>
      
      <div className="flex justify-center mb-6">
        <button
          className={`px-6 py-2 mr-4 rounded-full ${activeTab === 'myCourses' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('myCourses')}
        >
          My Courses
        </button>
        <button
          className={`px-6 py-2 rounded-full ${activeTab === 'allCourses' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('allCourses')}
        >
          All Courses
        </button>
      </div>

      {activeTab === 'myCourses' && (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">My Courses</h2>
          {myCourses.length === 0 ? (
            <p className="text-center text-gray-600">No courses assigned to you.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => <CourseCard key={course._id} course={course} />)}
            </div>
          )}
        </>
      )}

      {activeTab === 'allCourses' && (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">All Courses</h2>
          {allCourses.length === 0 ? (
            <p className="text-center text-gray-600">No courses found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map(course => <CourseCard key={course._id} course={course} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherCourseList;