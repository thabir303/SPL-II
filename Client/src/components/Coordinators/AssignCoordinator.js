// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AssignCoordinator = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [batches, setBatches] = useState([]);
//   const [selectedTeacher, setSelectedTeacher] = useState('');
//   const [selectedBatch, setSelectedBatch] = useState('');
//   const [expiredDate, setExpiredDate] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchTeachers = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/teachers');
//         setTeachers(response.data);
//       } catch (error) {
//         console.error('Error fetching teachers:', error);
//         setError('Failed to fetch teachers');
//       }
//     };

//     const fetchBatches = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/batches');
//         setBatches(response.data);
//       } catch (error) {
//         console.error('Error fetching batches:', error);
//         setError('Failed to fetch batches');
//       }
//     };

//     fetchTeachers();
//     fetchBatches();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/assign-coordinator', {
//         teacherId: selectedTeacher,
//         batchNo: selectedBatch,
//         expired_date: expiredDate
//       });
//       toast.success('Coordinator assigned successfully', { autoClose: 2000 });
//       setLoading(false);
//     } catch (error) {
//       console.error('Error assigning coordinator:', error);
//       setError('Failed to assign coordinator');
//       toast.error('Failed to assign coordinator', { autoClose: 2000 });
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
//         <h2 className="text-2xl font-bold mb-4 text-center">Assign Coordinator</h2>
//         {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label htmlFor="teacher" className="block text-gray-700 font-bold mb-2">
//               Select Teacher
//             </label>
//             <select
//               name="teacher"
//               value={selectedTeacher}
//               onChange={(e) => setSelectedTeacher(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option value="">Select a Teacher</option>
//               {teachers.map((teacher) => (
//                 <option key={teacher.teacherId} value={teacher.teacherId}>
//                   {teacher.teacherName}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label htmlFor="batch" className="block text-gray-700 font-bold mb-2">
//               Select Batch
//             </label>
//             <select
//               name="batch"
//               value={selectedBatch}
//               onChange={(e) => setSelectedBatch(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option value="">Select a Batch</option>
//               {batches.map((batch) => (
//                 <option key={batch.batchNo} value={batch.batchNo}>
//                   {batch.batchNo}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label htmlFor="expiredDate" className="block text-gray-700 font-bold mb-2">
//               Expired Date
//             </label>
//             <input
//               type="date"
//               name="expiredDate"
//               value={expiredDate}
//               onChange={(e) => setExpiredDate(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
//             disabled={loading}
//           >
//             {loading ? 'Assigning...' : 'Assign Coordinator'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AssignCoordinator;
