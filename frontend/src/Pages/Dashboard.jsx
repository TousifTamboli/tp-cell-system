import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentDrives, setCurrentDrives] = useState([]);
  const [pastDrives, setPastDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // Helper function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

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

        // Fetch all drives for user's specialization
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
          
          // Separate drives into current and past based on deadline
          const current = data.filter(drive => !isDeadlinePassed(drive.deadline));
          const past = data.filter(drive => isDeadlinePassed(drive.deadline));
          
          setCurrentDrives(current);
          setPastDrives(past);
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

  const handleStatusUpdate = async (driveId, status, deadline) => {
    // Check if deadline has passed
    if (isDeadlinePassed(deadline)) {
      alert("This drive has ended. You cannot update your status.");
      return;
    }

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
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to update status");
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
            📋 Current Drives ({currentDrives.length})
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeTab === "past"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            📂 Past Drives ({pastDrives.length})
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
            {currentDrives && currentDrives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentDrives.map((drive) => (
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
                              onClick={() => handleStatusUpdate(drive._id, status, drive.deadline)}
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
            {pastDrives && pastDrives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastDrives.map((drive) => {
                  // Find user's registration status for this drive
                  const userRegistration = drive.registrations?.find(
                    reg => reg.userId.toString() === user.id
                  );

                  return (
                    <div
                      key={drive._id}
                      className="bg-gray-50 shadow-md rounded-lg p-6 border-l-4 border-gray-400 opacity-90"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-700">
                          {drive.companyName}
                        </h3>
                        <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded">
                          ENDED
                        </span>
                      </div>

                      {userRegistration && (
                        <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Your Status:</p>
                          <p className="font-semibold text-gray-800">{userRegistration.status}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Updated: {new Date(userRegistration.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {!userRegistration && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-sm text-gray-600">You did not participate in this drive</p>
                        </div>
                      )}

                      {drive.deadline && (
                        <div className="pt-3 border-t border-gray-300">
                          <p className="text-xs text-gray-500">
                            Deadline: {new Date(drive.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">
                  No past placement drives found
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;