//src/componets/UserList.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext"; // Update import path as needed
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!user) {
          console.log("No user found in context.");
          return;
        }
        console.log("Fetching users...");
        const response = await axios.get(
          "http://localhost:5000/api/admin/users",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        console.log("Users fetched:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const handleApprove = async (email) => {
    try {
      setActionLoading({ ...actionLoading, [email]: true });
      if (!user) {
        console.log("No user found in context.");
        return;
      }
      await axios.post(
        "http://localhost:5000/api/admin/approve-user",
        { email },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUsers(
        users.map((user) =>
          user.email === email ? { ...user, status: "approved" } : user
        )
      );
      toast.success("User approved successfully!");
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    } finally {
      setActionLoading({ ...actionLoading, [email]: false });
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading({ ...actionLoading, [userToDelete]: true });
      if (!user) {
        console.log("No user found in context.");
        return;
      }
      await axios.delete(
        `http://localhost:5000/api/admin/delete-user/${userToDelete}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUsers(users.filter((user) => user.userId !== userToDelete));
      toast.success("User deleted successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading({ ...actionLoading, [userToDelete]: false });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (users.length === 0) {
    return <div>No users found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">User List</h1>
      <div className="w-full max-w-4xl bg-white shadow-md rounded p-8">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">{user.status}</td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  {user.status === "pending" && (
                    <button
                      onClick={() => handleApprove(user.email)}
                      className={`bg-blue-500 text-white px-4 py-2 rounded ${
                        actionLoading[user.email]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={actionLoading[user.email]}
                    >
                      {actionLoading[user.email] ? "Approving..." : "Approve"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setUserToDelete(user.userId);
                    }}
                    className={`bg-red-500 text-white px-4 py-2 rounded ${
                      actionLoading[user.userId]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={actionLoading[user.userId]}
                  >
                    {actionLoading[user.userId] ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
