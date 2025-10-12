import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PastDrives = () => {
  const navigate = useNavigate();
  const [pastDrives, setPastDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPastDrives = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch all past drives with user's participation history
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/placement/past-drives`,
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
          // Sort by date (newest first)
          const sorted = data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setPastDrives(sorted);
          setError("");
        } else if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load past drives");
        }
      } catch (err) {
        console.error("Error fetching past drives:", err);
        setError("Error loading past drives");
      } finally {
        setLoading(false);
      }
    };

    fetchPastDrives();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading past drives...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-gray-800">Past Placement Drives</h1>
        <p className="text-gray-600 mt-2">
          View your complete participation history
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Past Drives List */}
      {pastDrives && pastDrives.length > 0 ? (
        <div className="space-y-4">
          {pastDrives.map((drive, index) => (
            <div
              key={drive._id}
              className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-600 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {index + 1}. {drive.companyName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(drive.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Completed
                </span>
              </div>

              {/* Drive Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                    Deadline
                  </p>
                  <p className="text-lg text-gray-800">
                    {drive.deadline
                      ? new Date(drive.deadline).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                    Eligible Courses
                  </p>
                  <p className="text-lg text-gray-800">
                    {drive.eligibleCourses && drive.eligibleCourses.length > 0
                      ? drive.eligibleCourses.join(", ")
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                    Status Options
                  </p>
                  <p className="text-lg text-gray-800">
                    {drive.statuses && drive.statuses.length}
                  </p>
                </div>
              </div>

              {/* Statuses Available */}
              <div className="bg-blue-50 p-4 rounded mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Process Stages:
                </p>
                <div className="flex flex-wrap gap-2">
                  {drive.statuses && drive.statuses.length > 0 ? (
                    drive.statuses.map((status, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {status}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No statuses available</p>
                  )}
                </div>
              </div>

              {/* User's Registrations */}
              {drive.registrations && drive.registrations.length > 0 && (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Your Participation:
                  </p>
                  <div className="space-y-2">
                    {drive.registrations.map((reg, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-800 font-semibold">
                          {reg.status}
                        </span>
                        <span className="text-gray-600">
                          {new Date(reg.timestamp).toLocaleDateString()} at{" "}
                          {new Date(reg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">
            No past placement drives yet
          </p>
        </div>
      )}
    </div>
  );
};

export default PastDrives;