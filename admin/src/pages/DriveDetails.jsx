import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DriveDetails = () => {
  const navigate = useNavigate();
  const { driveId } = useParams();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchDrive = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/placement/admin/drive/${driveId}`,
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
          setDrive(data);
        } else if (res.status === 401 || res.status === 403) {
          navigate("/admin/login");
        } else {
          setError("Failed to load drive details");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading drive details");
      } finally {
        setLoading(false);
      }
    };

    fetchDrive();
  }, [driveId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading drive details...</p>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          {error || "Drive not found"}
        </div>
      </div>
    );
  }

  const filteredRegistrations =
    filterStatus === "All"
      ? drive.registrations
      : drive.registrations.filter((reg) => reg.status === filterStatus);

  const getStatusColor = (status) => {
    const colors = {
      "Registration Done": "bg-blue-100 text-blue-800",
      "Test Given": "bg-purple-100 text-purple-800",
      "Interview": "bg-amber-100 text-amber-800",
      "Selected": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-gray-600 hover:text-gray-900 text-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            {drive.companyName} - Student Registrations
          </h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Drive Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Company</p>
              <p className="text-lg font-bold text-slate-800">{drive.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Deadline</p>
              <p className="text-lg font-bold text-slate-800">
                {new Date(drive.deadline).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">
                Total Registrations
              </p>
              <p className="text-lg font-bold text-blue-600">
                {drive.registrations.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">
                Eligible Courses
              </p>
              <p className="text-lg font-bold text-slate-800">
                {drive.eligibleCourses.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Filter by Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Filter by Status:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("All")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All ({drive.registrations.length})
            </button>
            {drive.statuses.map((status) => {
              const count = drive.registrations.filter(
                (reg) => reg.status === status
              ).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Sr No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg, index) => (
                    <tr
                      key={reg._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-slate-800">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {reg.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {reg.userEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {reg.userSpecialization}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {reg.userBranch}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {reg.userYear}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full font-semibold text-xs ${getStatusColor(
                            reg.status
                          )}`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(reg.timestamp).toLocaleDateString()} at{" "}
                        {new Date(reg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No students registered with this status yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveDetails;