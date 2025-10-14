import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SPECIALIZATIONS, BRANCHES, YEARS } from "../config/constants";

const DriveDetails = () => {
  const navigate = useNavigate();
  const { driveId } = useParams();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [filters, setFilters] = useState({
    status: "All",
    specialization: "All",
    branch: "All",
    year: "All",
  });

  useEffect(() => {
    fetchDrive();
  }, [driveId, navigate]);

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

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    if (!drive || !drive.registrations) return [];
    const values = [...new Set(drive.registrations.map((reg) => reg[key]))].filter(Boolean).sort();
    return values;
  };

  const branches = getUniqueValues("userBranch");
  const years = getUniqueValues("userYear");
  const statuses = drive?.statuses || [];

  // Apply filters
  const filteredRegistrations = drive
    ? drive.registrations.filter((reg) => {
        const statusMatch = filters.status === "All" || reg.status === filters.status;
        const specializationMatch = filters.specialization === "All" || reg.userSpecialization === filters.specialization;
        const branchMatch = filters.branch === "All" || reg.userBranch === filters.branch;
        const yearMatch = filters.year === "All" || reg.userYear === filters.year;

        return statusMatch && specializationMatch && branchMatch && yearMatch;
      })
    : [];

  // Get filter statistics
  const getFilterStats = () => {
    const stats = {
      status: {},
      specialization: {},
      branch: {},
      year: {},
    };

    drive?.registrations.forEach((reg) => {
      stats.status[reg.status] = (stats.status[reg.status] || 0) + 1;
      stats.specialization[reg.userSpecialization] = (stats.specialization[reg.userSpecialization] || 0) + 1;
      stats.branch[reg.userBranch] = (stats.branch[reg.userBranch] || 0) + 1;
      stats.year[reg.userYear] = (stats.year[reg.userYear] || 0) + 1;
    });

    return stats;
  };

  const stats = getFilterStats();

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

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Filter Registrations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All ({drive.registrations.length})</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status} ({stats.status[status] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Specialization Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specialization
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All ({drive.registrations.length})</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec} ({stats.specialization[spec] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Branch/Department
              </label>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All ({drive.registrations.length})</option>
                {BRANCHES.map((branch) => {
                  const count = drive.registrations.filter((reg) => reg.userBranch === branch).length;
                  return count > 0 ? (
                    <option key={branch} value={branch}>
                      {branch} ({count})
                    </option>
                  ) : null;
                })}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All ({drive.registrations.length})</option>
                {YEARS.map((year) => {
                  const count = drive.registrations.filter((reg) => reg.userYear === year).length;
                  return count > 0 ? (
                    <option key={year} value={year}>
                      {year} ({count})
                    </option>
                  ) : null;
                })}
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={() =>
              setFilters({
                status: "All",
                specialization: "All",
                branch: "All",
                year: "All",
              })
            }
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Reset Filters
          </button>
        </div>

        {/* Results Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Showing <span className="font-bold">{filteredRegistrations.length}</span> of{" "}
            <span className="font-bold">{drive.registrations.length}</span> registrations
          </p>
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
                      Reg Number
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Mobile
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
                      Passout Year
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
                    <tr key={reg._id} className="hover:bg-gray-50 transition">
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
                No registrations match the selected filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveDetails;