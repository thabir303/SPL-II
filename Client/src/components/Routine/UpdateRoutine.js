import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const UpdateRoutine = () => {
  const [formData, setFormData] = useState({
    section: '',
    day: '',
    startTime: '',
    endTime: '',
    teacherId: '',
    courseId: '',
    roomNo: '',
    semesterName: '',
    batchNo: '',
    classType: '',
  });

  const [sections, setSections] = useState([]);
  const [days, setDays] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classSlots, setClassSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/full-routines/${id}`);
        setFormData({
          section: res.data.section || '',
          day: res.data.day || '',
          startTime: res.data.startTime || '',
          endTime: res.data.endTime || '',
          teacherId: res.data.teacherId || '',
          courseId: res.data.courseId || '',
          roomNo: res.data.roomNo || '',
          semesterName: res.data.semesterName || '',
          batchNo: res.data.batchNo || '',
          classType: res.data.classType || '',
        });
      } catch (error) {
        setError('Failed to fetch routine data');
        toast.error('Failed to fetch routine data', { autoClose: 2000 });
      }
    };

    const fetchFormData = async () => {
      try {
        const [
          sectionRes,
          dayRes,
          teacherRes,
          courseRes,
          roomRes,
          semesterRes,
          batchRes,
          classSlotRes,
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/sections'),
          axios.get('http://localhost:5000/api/days'),
          axios.get('http://localhost:5000/api/teachers'),
          axios.get('http://localhost:5000/api/courses'),
          axios.get('http://localhost:5000/api/rooms'),
          axios.get('http://localhost:5000/api/semesters'),
          axios.get('http://localhost:5000/api/batches'),
          axios.get('http://localhost:5000/api/class-slots'),
        ]);

        setSections(sectionRes.data);
        setDays(dayRes.data);
        setTeachers(teacherRes.data);
        setCourses(courseRes.data);
        setRooms(roomRes.data);
        setSemesters(semesterRes.data);
        setBatches(batchRes.data);
        setClassSlots(classSlotRes.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch data for form');
        setLoading(false);
        toast.error('Failed to fetch data for form', { autoClose: 2000 });
      }
    };

    fetchRoutineData();
    fetchFormData();
  }, [id]);

  useEffect(() => {
    const filterSlots = () => {
      if (formData.teacherId && formData.day) {
        const filtered = classSlots.filter(
          (slot) =>
            slot.teacherId === formData.teacherId && slot.day === formData.day
        );
        setFilteredSlots(filtered);
      } else {
        setFilteredSlots([]);
      }
    };

    filterSlots();
  }, [formData.teacherId, formData.day, classSlots]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const requiredFields = [
      'section',
      'day',
      'startTime',
      'endTime',
      'teacherId',
      'courseId',
      'roomNo',
      'semesterName',
      'batchNo',
      'classType',
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`, { autoClose: 2000 });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/full-routines/${id}`, formData);
      toast.success('Routine updated successfully', { autoClose: 2000 });
      navigate('/admin/full-routines');
    } catch (error) {
      setError('Failed to update routine');
      toast.error('Failed to update routine', { autoClose: 2000 });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Update Routine
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              id: 'semesterName',
              label: 'Semester',
              options: semesters,
              valueKey: 'semesterName',
            },
            {
              id: 'section',
              label: 'Section',
              options: sections,
              valueKey: 'sectionName',
            },
            { id: 'day', label: 'Day', options: days, valueKey: 'dayNo' },
            {
              id: 'teacherId',
              label: 'Teacher',
              options: teachers,
              valueKey: 'teacherId',
              displayKey: 'teacherName',
            },
            {
              id: 'courseId',
              label: 'Course',
              options: courses,
              valueKey: 'courseId',
              displayKey: 'courseName',
            },
            { id: 'roomNo', label: 'Room', options: rooms, valueKey: 'roomNo' },
            {
              id: 'batchNo',
              label: 'Batch No',
              options: batches,
              valueKey: 'batchNo',
            },
          ].map(({ id, label, options, valueKey, displayKey }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="block text-gray-700 font-semibold mb-2"
              >
                {label}
              </label>
              <select
                id={id}
                name={id}
                value={formData[id] || ''}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
              >
                <option value="">Select {label}</option>
                {options.map((option) => (
                  <option key={option._id} value={option[valueKey]}>
                    {displayKey
                      ? `${option[displayKey]} | ${option[valueKey]}`
                      : option[valueKey]}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label
              htmlFor="startTime"
              className="block text-gray-700 font-semibold mb-2"
            >
              Start Time
            </label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime || ''}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
            >
              <option value="">Select Start Time</option>
              {filteredSlots.map((slot) => (
                <option key={slot._id} value={slot.startTime}>
                  {slot.startTime}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block text-gray-700 font-semibold mb-2"
            >
              End Time
            </label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime || ''}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
            >
              <option value="">Select End Time</option>
              {filteredSlots.map((slot) => (
                <option key={slot._id} value={slot.endTime}>
                  {slot.endTime}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="classType"
              className="block text-gray-700 font-semibold mb-2"
            >
              Class Type
            </label>
            <select
              id="classType"
              name="classType"
              value={formData.classType || ''}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300"
            >
              <option value="">Select Class Type</option>
              <option value="Lab">Lab</option>
              <option value="Theory">Theory</option>
            </select>
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

export default UpdateRoutine;
