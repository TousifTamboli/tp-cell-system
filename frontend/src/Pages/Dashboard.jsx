import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [selectedStatuses, setSelectedStatuses] = useState({}); // Track selected statuses

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          navigate("/login");
          return;
        }

        setUser(JSON.parse(storedUser));

        // Fetch current placement drives for user's specialization
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/placement/get-drives`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setDrives(data);
          setError("");
        } else if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load placement drives");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleStatusUpdate = async (driveId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/placement/update-status`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driveId,
            status,
            userId: user.id,
          }),
        }
      );

      if (res.ok) {
        alert("Status updated successfully!");
        // Refresh drives
        window.location.reload();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">T&P Cell</h2>

        {user && (
          <div className="mb-8 pb-6 border-b border-gray-700">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        )}

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("current")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeTab === "current"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            📋 Current Drives
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeTab === "past"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            📂 Past Drives
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition"
          >
            👤 My Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:bg-opacity-20 transition mt-8"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {activeTab === "current" ? "Current Placement Drives" : "Past Placement Drives"}
          </h1>
          <p className="text-gray-600">
            {activeTab === "current"
              ? "Select a drive and update your status"
              : "View your previous placement drive history"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Current Drives Tab */}
        {activeTab === "current" && (
          <div>
            {drives && drives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drives.map((drive) => (
                  <div
                    key={drive._id}
                    className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-600 hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {drive.companyName}
                    </h3>

                    <div className="mb-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Status Options:</span>
                      </p>
                      {drive.statuses && drive.statuses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {drive.statuses.map((status, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleStatusUpdate(drive._id, status)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No statuses available</p>
                      )}
                    </div>

                    {drive.deadline && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500">
                          Deadline: {new Date(drive.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">
                  No current placement drives available for your specialization
                </p>
              </div>
            )}
          </div>
        )}

        {/* Past Drives Tab */}
        {activeTab === "past" && (
          <div>
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg mb-4">
                View your past placement drive participation
              </p>
              <button
                onClick={() => navigate("/past-drives")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                View Detailed History
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;