//CreateClassSlot.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CoordinatorUpdateClassSlot = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    semesterName: "",
    day: "",
    startTime: "",
    endTime: "",
    courseId: "",
    teacherId: "",
    roomNo: "",
    section: "",
    classType: "",
  });
  const [semesters, setSemesters] = useState([]);
  const [days, setDays] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          semesterRes,
          dayRes,
          courseRes,
          teacherRes,
          roomRes,
          sectionRes,
          timeSlotRes
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/semesters"),
          axios.get("http://localhost:5000/api/days"),
          axios.get("http://localhost:5000/api/courses"),
          axios.get("http://localhost:5000/api/teachers"),
          axios.get("http://localhost:5000/api/rooms"),
          axios.get("http://localhost:5000/api/sections"),
          axios.get("http://localhost:5000/api/class-slots/time-slots")
        ]);
        setSemesters(semesterRes.data);
        setDays(dayRes.data);
        setCourses(courseRes.data);
        setTeachers(teacherRes.data);
        setRooms(roomRes.data);
        setSections(sectionRes.data);
        setTimeSlots(timeSlotRes.data); // This should be an array now
      } catch (error) {
        setError("Failed to fetch data for form");
        toast.error("Failed to fetch data for form", { autoClose: 2000 });
      }
    };

    fetchData();
  }, []);

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
        toast.error("Failed to fetch assigned courses", { autoClose: 2000 });
      }
    } else {
      setAssignedCourses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the courseId is valid for the selected semesterName
    const course = courses.find(
      (course) => course.courseId === formData.courseId
    );
    if (course && course.semesterName !== formData.semesterName) {
      toast.error(
        `Course ${course.courseId} is assigned to ${course.semesterName}, not ${formData.semesterName}`,
        { autoClose: 3000 }
      );
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/class-slots", formData);
      toast.success("Class slot created successfully", { autoClose: 2000 });
      navigate("/coordinator/class-slots");
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error.join(', ')
          : error.response.data.error;
        toast.error(errorMessage, { autoClose: 3000 });
      } else {
        toast.error("Failed to create class slot", { autoClose: 2000 });
      }
    }
  };
 return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create Class Slot
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="semesterName"
              className="block text-gray-700 font-bold mb-2"
            >
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
            <label
              htmlFor="startTime"
              className="block text-gray-700 font-bold mb-2"
            >
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
              {timeSlots.map((time, index) => (
                <option key={index} value={time.split('-')[0]}>
                  {time.split('-')[0]}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="endTime"
              className="block text-gray-700 font-bold mb-2"
            >
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
              {timeSlots.map((time, index) => (
                <option key={index} value={time.split('-')[1]}>
                  {time.split('-')[1]}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="teacherId"
              className="block text-gray-700 font-bold mb-2"
            >
              Teacher
            </label>
            <select
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleTeacherChange}
              className="block w-full p-2 border border-gray-300 rounded mb-4">
                              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option
                  key={teacher._id}
                  value={teacher.teacherId}
                >{`${teacher.teacherName} | ${teacher.teacherId}`}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="courseId"
              className="block text-gray-700 font-bold mb-2"
            >
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
              {assignedCourses.map((course) => (
                <option key={course._id} value={course.courseId}>
                  {course.courseId}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="roomNo"
              className="block text-gray-700 font-bold mb-2"
            >
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
            <label
              htmlFor="section"
              className="block text-gray-700 font-bold mb-2"
            >
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
            <label
              htmlFor="classType"
              className="block text-gray-700 font-bold mb-2"
            >
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
            Create Class Slot
          </button>
        </form>
      </div>
    </div>
  );
};

 
export default CoordinatorUpdateClassSlot;





