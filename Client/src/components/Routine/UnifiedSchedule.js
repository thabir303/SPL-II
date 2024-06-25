import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const UnifiedSchedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/full-routines");
        setScheduleData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch schedule data");
        setLoading(false);
        toast.error("Failed to fetch schedule data", { autoClose: 2000 });
      }
    };

    fetchScheduleData();
  }, []);

  const getScheduleByDay = (day) => {
    return scheduleData.filter((slot) => slot.day.toLowerCase() === day.toLowerCase());
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Unified Schedule</h2>
      <div className="grid grid-cols-1 gap-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-bold mb-4">{day.toUpperCase()}</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Batch</th>
                    <th className="px-4 py-2">Class Slots</th>
                  </tr>
                </thead>
                <tbody>
                  {getScheduleByDay(day).map((slot) => (
                    <tr key={slot._id} className="text-left border-t">
                      <td className="px-4 py-2">{slot.batchNo}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col space-y-2">
                          <div>
                            <strong>Time:</strong> {slot.startTime} - {slot.endTime}
                          </div>
                          <div>
                            <strong>Course:</strong> {slot.courseId ? slot.courseId : "N/A"}
                          </div>
                          <div>
                            <strong>Teacher:</strong> {slot.teacherId ? slot.teacherId : "N/A"}
                          </div>
                          <div>
                            <strong>Room:</strong> {slot.roomNo}
                          </div>
                          <div>
                            <strong>Section:</strong> {slot.section}
                          </div>
                          <div>
                            <strong>Class Type:</strong> {slot.classType}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <button className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
                        <button className="bg-red-500 text-white p-2 rounded">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnifiedSchedule;
