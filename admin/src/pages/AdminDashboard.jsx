import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [allDrives, setAllDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // Helper function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/placement/admin/all-drives`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setAllDrives(data);
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          setError("Failed to load drives");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading drives");
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/placement/admin/delete-drive/${driveId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setAllDrives(allDrives.filter((d) => d._id !== driveId));
        alert("Drive deleted successfully");
      } else {
        alert("Failed to delete drive");
      }
    } catch (err) {
      alert("Error deleting drive");
    }
  };

  // Separate drives into current and past
  const currentDrives = allDrives.filter(drive => !isDeadlinePassed(drive.deadline));
  const pastDrives = allDrives.filter(drive => isDeadlinePassed(drive.deadline));
  
  const drives = activeTab === "current" ? currentDrives : pastDrives;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">T&P Cell Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "current"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-gray-300"
            }`}
          >
            📋 Current Drives ({currentDrives.length})
          </button>
          
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "past"
                ? "bg-gray-600 text-white"
                : "bg-white text-slate-700 border border-gray-300"
            }`}
          >
            📂 Past Drives ({pastDrives.length})
          </button>

          <button
            onClick={() => navigate("/admin/create-drive")}
            className="px-6 py-2 rounded-lg font-semibold transition bg-green-600 text-white hover:bg-green-700"
          >
            ➕ Create New Drive
          </button>
          
          <button
            onClick={() => navigate("/admin/overview")}
            className="px-6 py-2 rounded-lg font-semibold transition bg-purple-600 text-white hover:bg-purple-700"
          >
            📊 Student Overview
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === "current" ? "Active Placement Drives" : "Past Placement Drives"}
          </h2>
          <p className="text-gray-600 mt-1">
            {activeTab === "current" 
              ? "Manage currently active placement drives" 
              : "View completed and expired placement drives"}
          </p>
        </div>

        {/* Drives List */}
        {drives && drives.length > 0 ? (
          <div className="space-y-4">
            {drives.map((drive) => {
              const isPast = isDeadlinePassed(drive.deadline);
              
              return (
                <div
                  key={drive._id}
                  className={`bg-white border rounded-lg p-6 hover:shadow-md transition ${
                    isPast ? 'border-gray-300 opacity-90' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-800">
                          {drive.companyName}
                        </h2>
                        {isPast && (
                          <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded">
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Created: {new Date(drive.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        drive.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {drive.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className={`p-3 rounded ${isPast ? 'bg-gray-50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-600 font-semibold mb-1">
                        Deadline
                      </p>
                      <p className={`text-sm font-semibold ${isPast ? 'text-red-600' : 'text-slate-800'}`}>
                        {new Date(drive.deadline).toLocaleDateString()}
                        {isPast && (
                          <span className="block text-xs text-red-500 mt-1">
                            Expired {Math.floor((new Date() - new Date(drive.deadline)) / (1000 * 60 * 60 * 24))} days ago
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 font-semibold mb-1">
                        Eligible Courses
                      </p>
                      <p className="text-sm text-slate-800">
                        {drive.eligibleCourses.join(", ")}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-gray-600 font-semibold mb-1">
                        Total Registrations
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        {drive.registrations.length} students
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-600 font-semibold mb-2">
                      Process Stages:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {drive.statuses.map((status, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/drive-details/${drive._id}`)
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                    >
                      View Details
                    </button>
                    
                    <button
                      onClick={() => navigate(`/admin/edit-drive/${drive._id}`)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteDrive(drive._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg mb-4">
              {activeTab === "current" 
                ? "No current placement drives available" 
                : "No past placement drives found"}
            </p>
            {activeTab === "current" && (
              <button
                onClick={() => navigate("/admin/create-drive")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Create First Drive
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;