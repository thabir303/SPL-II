//NewRoutine.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewRoutine = () => {
  const [formData, setFormData] = useState({
    section: "",
    day: "",
    startTime: "",
    endTime: "",
    teacherId: "",
    courseId: "",
    roomNo: "",
    semesterName: "",
    batchNo: "",
    classType: "",
  });

  const [sections, setSections] = useState([]);
  const [days, setDays] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classSlots, setClassSlots] = useState([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionRes, dayRes, teacherRes, courseRes, roomRes, semesterRes, batchRes, classSlotRes] = await Promise.all([
          axios.get("http://localhost:5000/api/sections"),
          axios.get("http://localhost:5000/api/days"),
          axios.get("http://localhost:5000/api/teachers"),
          axios.get("http://localhost:5000/api/courses"),
          axios.get("http://localhost:5000/api/rooms"),
          axios.get("http://localhost:5000/api/semesters"),
          axios.get("http://localhost:5000/api/batches"), // Assuming there's an endpoint for batches
          axios.get("http://localhost:5000/api/class-slots"),
        ]);

        setSections(sectionRes.data);
        setDays(dayRes.data);
        setTeachers(teacherRes.data);
        setCourses(courseRes.data);
        setRooms(roomRes.data);
        setSemesters(semesterRes.data);
        setBatches(batchRes.data); // Set the batches state
        setClassSlots(classSlotRes.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch data for form");
        setLoading(false);
        toast.error("Failed to fetch data for form", { autoClose: 2000 });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterTimeSlots = () => {
      if (formData.teacherId && formData.day) {
        const filteredSlots = classSlots.filter(
          slot => slot.teacherId === formData.teacherId && slot.day === formData.day
        );
        setFilteredTimeSlots(filteredSlots);
      } else {
        setFilteredTimeSlots([]);
      }
    };

    filterTimeSlots();
  }, [formData.teacherId, formData.day, classSlots]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/full-routines", formData);
      toast.success("Routine created successfully", { autoClose: 2000 });
      navigate("/admin/full-routines");
    } catch (error) {
      setError("Failed to create routine");
      toast.error("Failed to create routine", { autoClose: 2000 });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Create New Routine</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="semesterName" className="block text-gray-700 font-bold mb-2">
              Semester
            </label>
            <select
              id="semesterName"
              name="semesterName"
              value={formData.semesterName}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester._id} value={semester.semesterName}>
                  {semester.semesterName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="section" className="block text-gray-700 font-bold mb-2">
              Section
            </label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section._id} value={section.sectionName}>
                  {section.sectionName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="day" className="block text-gray-700 font-bold mb-2">
              Day
            </label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Day</option>
              {days.map((day) => (
                <option key={day._id} value={day.dayNo}>
                  {day.dayNo}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="startTime" className="block text-gray-700 font-bold mb-2">
              Start Time
            </label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Start Time</option>
              {filteredTimeSlots.length > 0 ? (
                filteredTimeSlots.map((slot, index) => (
                  <option key={index} value={slot.startTime}>
                    {slot.startTime}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No class slots available for this day and teacher
                </option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="endTime" className="block text-gray-700 font-bold mb-2">
              End Time
            </label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select End Time</option>
              {filteredTimeSlots.length > 0 ? (
                filteredTimeSlots.map((slot, index) => (
                  <option key={index} value={slot.endTime}>
                    {slot.endTime}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No class slots available for this day and teacher
                </option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="teacherId" className="block text-gray-700 font-bold mb-2">
              Teacher
            </label>
            <select
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher.teacherId}>
                  {teacher.teacherName} | {teacher.teacherId}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="courseId" className="block text-gray-700 font-bold mb-2">
              Course
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course.courseId}>
                  {course.courseName} | {course.courseId}
                  </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="roomNo" className="block text-gray-700 font-bold mb-2">
              Room
            </label>
            <select
              id="roomNo"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room.roomNo}>
                  {room.roomNo}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="batchNo" className="block text-gray-700 font-bold mb-2">
              Batch No
            </label>
            <select
              id="batchNo"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch.batchNo}>
                  {batch.batchNo}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="classType" className="block text-gray-700 font-bold mb-2">
              Class Type
            </label>
            <select
              id="classType"
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Class Type</option>
              <option value="Lab">Lab</option>
              <option value="Theory">Theory</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
          >
            Create Routine
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewRoutine;

