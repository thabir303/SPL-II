import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CoTeacher = () => {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
//   const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers', {
       
        });
        setTeachers(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch teachers');
        setLoading(false);
        toast.error('Failed to fetch teachers', { autoClose: 2000 });
      }
    };

    fetchTeachers();
  }, [refresh, user.token]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/teachers/delete/${teacherToDelete}`, {
        
      });
      toast.success('Teacher deleted successfully', { autoClose: 2000 });
      setRefresh(!refresh);
      setShowModal(false);
      setTeacherToDelete(null);
    } catch (error) {
      setError('Failed to delete teacher');
      toast.error('Failed to delete teacher', { autoClose: 2000 });
    }
  };

  const confirmDelete = (teacherId) => {
    setTeacherToDelete(teacherId);
    setShowModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Teachers</h2>
      {/* <Link to="/coordinator/teachers/new" className="bg-blue-500 text-white p-2 rounded">Add New Teacher</Link> */}
      {teachers.length === 0 ? (
        <p className="mt-4">No teachers found.</p>
      ) : (
        <ul className="mt-4">
          {teachers.map((teacher) => (
            <li key={teacher._id} className="bg-white p-4 mb-4 rounded shadow">
              <p><strong>Name:</strong> {`${teacher.teacherName} || ${teacher.teacherId}`}</p>
              <p><strong>Department:</strong> {teacher.departmentName}</p>
              <p><strong>Assigned Courses:</strong> {teacher.assignedCourses.length > 0 ? teacher.assignedCourses.join(', ') : 'None'}</p>
              <Link to={`/coordinator/teachers/edit/${teacher.teacherId}`} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</Link>
              <Link to={`/coordinator/teachers/assign/${teacher.teacherId}`} className="bg-green-500 text-white p-2 rounded mr-2">Course Assign</Link>
              <button onClick={() => confirmDelete(teacher.teacherId)} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this teacher?</p>
            <div className="flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoTeacher;
