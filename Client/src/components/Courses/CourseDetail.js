// src/components/CourseDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch course');
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Course Details</h2>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Course ID:</strong> {course.courseId}</p>
        <p><strong>Course Name:</strong> {course.courseName}</p>
        <p><strong>Credit:</strong> {course.credit}</p>
        <p><strong>Type:</strong> {course.type}</p>
        <p><strong>Semester:</strong> {course.semesterName}</p>
        <p><strong>Active:</strong> {course.isActive ? 'Yes' : 'No'}</p>
        <Link to="/admin/courses" className="bg-blue-500 text-white p-2 rounded mt-4">Back to Courses</Link>
      </div>
    </div>
  );
};

export default CourseDetail;
