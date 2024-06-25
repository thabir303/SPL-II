import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Coordinator = () => {
  const { user } = useContext(AuthContext);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/coordinators"
        );
        setCoordinators(response.data);
      } catch (error) {
        setError("Failed to fetch coordinators");
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinators();
  }, [user]);

  const handleDelete = async (coordinatorId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/auth/coordinators/${coordinatorId}`
      );
      setCoordinators(
        coordinators.filter(
          (coordinator) => coordinator.coordinatorId !== coordinatorId
        )
      );
      setModalMessage("Coordinator deleted successfully");
      setShowModal(true);
    } catch (error) {
      setModalMessage("Failed to delete coordinator");
      setShowModal(true);
    }
  };

  const handleEdit = (coordinatorId) => {
    navigate(`/admin/coordinators/edit/${coordinatorId}`);
  };

  const handleAddRoutineCommittee = async (coordinatorId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/routine-committees",
        { coordinatorId }
      );
      setModalMessage(response.data.message);
      setShowModal(true);
      // Update coordinator's in_committee status in the local state
      setCoordinators(
        coordinators.map((coordinator) =>
          coordinator.coordinatorId === coordinatorId
            ? { ...coordinator, in_committee: true }
            : coordinator
        )
      );
    } catch (error) {
      setModalMessage("Failed to add routine committee");
      setShowModal(true);
    }
  };

  const handleRemoveFromCommittee = async (coordinatorId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/auth/routine-committees/${coordinatorId}`
      );
      setModalMessage(response.data.message);
      setShowModal(true);
      // Update coordinator's in_committee status in the local state
      setCoordinators(
        coordinators.map((coordinator) =>
          coordinator.coordinatorId === coordinatorId
            ? { ...coordinator, in_committee: false }
            : coordinator
        )
      );
    } catch (error) {
      setModalMessage("Failed to remove from committee");
      setShowModal(true);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Coordinators</h2>
      {/* <button
        onClick={() => navigate('/admin/create-coordinator')}
        className="bg-green-500 text-white px-4 py-2 rounded mb-6"
      >
        Create Coordinator
      </button> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coordinators.map((coordinator) => (
          <div
            key={coordinator.coordinatorId}
            className="bg-white p-6 rounded shadow"
          >
            <p>
              <strong>Name:</strong> {coordinator.coordinatorName}
            </p>
            <p>
              <strong>Email:</strong> {coordinator.email}
            </p>
            <p>
              <strong>Batch No:</strong> {coordinator.batchNo}
            </p>
            <p>
              <strong>Coordinator ID:</strong> {coordinator.coordinatorId}
            </p>
            <p>
              <strong>Expired Date:</strong>{" "}
              {new Date(coordinator.expired_date).toLocaleDateString()}
            </p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(coordinator.coordinatorId)}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(coordinator.coordinatorId)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
              {!coordinator.in_committee ? (
                <button
                  onClick={() =>
                    handleAddRoutineCommittee(coordinator.coordinatorId)
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add Routine Committee
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleRemoveFromCommittee(coordinator.coordinatorId)
                  }
                  className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                  Remove from Committee
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">Notification</h2>
            <p className="mb-4">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coordinator;
