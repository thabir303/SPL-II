import React, { useContext } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { RiAccountPinCircleFill } from "react-icons/ri";
import UserList from "../User/UserList";
import FullRoutine from "../Routine/FullRoutine";
import NewRoutine from "../Routine/NewRoutine";
import UpdateRoutine from "../Routine/UpdateRoutine";
import Coordinator from "../Coordinators/Coordinator";
import ClassSlots from "../ClassSlots/ClassSlots";
import CreateClassSlot from "../ClassSlots/CreateClassSlot";
import UpdateClassSlot from "../ClassSlots/UpdateClassSlot";
import PendingUsers from "../User/PendingUsers";
import CreateCoordinator from "../Coordinators/CreateCoordinator";
import EditCoordinator from "../Coordinators/EditCoordinator";
import CourseList from "../Courses/CourseList";
import CreateCourse from "../Courses/CreateCourse";
import UpdateCourse from "../Courses/UpdateCourse";
import AssignCourse from "../Courses/AssignCourse";
import AuthContext from "../../context/AuthContext";
import BatchList from "../Batches/BatchList";
import CreateBatch from "../Batches/CreateBatch";
import UpdateBatch from "../Batches/UpdateBatch";
import TeacherList from "../Teachers/TeacherList";
import AssignCourses from "../Teachers/AssignCourses";
import EditTeacher from "../Teachers/EditTeacher";
import ViewRoutines from "../Routine/ViewRoutines";
import AssignCoordinator from "../Coordinators/AssignCoordinator"; // Import AssignCoordinator

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-gray-700 font-bold"
      : "hover:bg-gray-700";
  };

  return (
    <div className="flex min-h-screen">
      <aside className="bg-gray-800 text-white w-64 p-6 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Admin</h1>
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <nav className="flex flex-col space-y-4 flex-grow">
          <Link
            to="/admin/full-routines"
            className={`p-2 rounded ${isActive("/admin/full-routines")}`}
          >
            View Routine
          </Link>
          {/* <Link
            to="/admin/view-routines"
            className={`p-2 rounded ${isActive("/admin/view-routines")}`}
          >
            View Routine
          </Link> */}
          <Link
            to="/admin/class-slots"
            className={`p-2 rounded ${isActive("/admin/class-slots")}`}
          >
            Class Slots
          </Link>
          <Link
            to="/admin/courses"
            className={`p-2 rounded ${isActive("/admin/courses")}`}
          >
            Courses
          </Link>
          <Link
            to="/admin/coordinator"
            className={`p-2 rounded ${isActive("/admin/coordinator")}`}
          >
            Coordinator
          </Link>
          <Link
            to="/admin/create-coordinator"
            className={`p-2 rounded ${isActive("/admin/create-coordinator")}`}
          >
            Create Coordinator
          </Link>
          <Link
            to="/admin/batches"
            className={`p-2 rounded ${isActive("/admin/batches")}`}
          >
            Batches
          </Link>
          <Link
            to="/admin/teachers"
            className={`p-2 rounded ${isActive("/admin/teachers")}`}
          >
            Teachers
          </Link>
          <Link
            to="/admin/users"
            className={`p-2 rounded ${isActive("/admin/users")}`}
          >
            User List
          </Link>
          <Link
            to="/admin/pending-users"
            className={`p-2 rounded ${isActive("/admin/pending-users")}`}
          >
            Pending Users
          </Link>
        </nav>
        <div className="mt-6 sticky bottom-0 bg-gray-800">
          <div
            onClick={() => navigate("/admin")}
            className="cursor-pointer p-2 rounded flex items-center space-x-2 hover:bg-gray-700"
            >
              <RiAccountPinCircleFill size={40} />
              <span>{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 p-2 rounded mt-4 w-full"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-grow p-6 bg-gray-100">
          <Routes>
          <Route path="/" element={<ClassSlots />} />
            <Route path="full-routines" element={<FullRoutine />} />
            <Route path="full-routines/new" element={<NewRoutine />} />
            <Route path="full-routines/update/:id" element={<UpdateRoutine />} />
            <Route path="view-routines" element={<ViewRoutines />} />
            <Route path="class-slots" element={<ClassSlots />} />
            <Route path="class-slots/new" element={<CreateClassSlot />} />
            <Route path="class-slots/update/:id" element={<UpdateClassSlot />} />
            <Route path="coordinator" element={<Coordinator />} />
            <Route path="create-coordinator" element={<CreateCoordinator />} />
            <Route
              path="coordinators/edit/:coordinatorId"
              element={<EditCoordinator />}
            />
            <Route path="users" element={<UserList />} />
            <Route path="pending-users" element={<PendingUsers />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/new" element={<CreateCourse />} />
            <Route path="courses/update/:courseId" element={<UpdateCourse />} />
            <Route path="courses/assign/:courseId" element={<AssignCourse />} />
            <Route path="batches" element={<BatchList />} />
            <Route path="batches/new" element={<CreateBatch />} />
            <Route path="batches/update/:batchNo" element={<UpdateBatch />} />
            <Route path="teachers" element={<TeacherList />} />
            <Route path="teachers/edit/:teacherId" element={<EditTeacher />} />
            <Route
              path="teachers/assign/:teacherId"
              element={<AssignCourses />}
            />
          </Routes>
        </main>
      </div>
    );
  };
  
  export default AdminDashboard;
