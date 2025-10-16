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

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

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

  const getUniqueValues = (key) => {
    if (!drive || !drive.registrations) return [];
    const values = [...new Set(drive.registrations.map((reg) => reg[key]))].filter(Boolean).sort();
    return values;
  };

  const statuses = drive?.statuses || [];

  const filteredRegistrations = drive
    ? drive.registrations.filter((reg) => {
        const statusMatch = filters.status === "All" || reg.status === filters.status;
        const specializationMatch = filters.specialization === "All" || reg.userSpecialization === filters.specialization;
        const branchMatch = filters.branch === "All" || reg.userBranch === filters.branch;
        const yearMatch = filters.year === "All" || reg.userYear === filters.year;

        return statusMatch && specializationMatch && branchMatch && yearMatch;
      })
    : [];

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

  const exportToCSV = () => {
    if (!filteredRegistrations.length) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Sr No",
      "Name",
      "Email",
      "Reg No",
      "Mobile",
      "Course",
      "Branch",
      "Year",
      "Passout Year",
      "Status",
      "Registration Date",
      "Registration Time"
    ];

    const csvData = filteredRegistrations.map((reg, index) => [
      index + 1,
      reg.userName,
      reg.userEmail,
      reg.userRegNo || 'N/A',
      reg.userMobile || 'N/A',
      reg.userSpecialization,
      reg.userBranch,
      reg.userYear,
      reg.userPassoutYear || 'N/A',
      reg.status,
      new Date(reg.timestamp).toLocaleDateString(),
      new Date(reg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${drive.companyName}_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const isPastDrive = isDeadlinePassed(drive.deadline);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-gray-600 hover:text-gray-900 text-lg"
          >
            ←
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">
                {drive.companyName} - Student Registrations
              </h1>
              {isPastDrive && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  DRIVE ENDED
                </span>
              )}
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold"
          >
            📥 Export CSV
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className={`rounded-lg shadow-md p-6 mb-6 ${isPastDrive ? 'bg-gray-50 border-2 border-gray-300' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Company</p>
              <p className="text-lg font-bold text-slate-800">{drive.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Deadline</p>
              <p className={`text-lg font-bold ${isPastDrive ? 'text-red-600' : 'text-slate-800'}`}>
                {new Date(drive.deadline).toLocaleDateString()}
              </p>
              {isPastDrive && (
                <p className="text-xs text-red-500 mt-1">
                  Expired {Math.floor((new Date() - new Date(drive.deadline)) / (1000 * 60 * 60 * 24))} days ago
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Total Registrations</p>
              <p className="text-lg font-bold text-blue-600">{drive.registrations.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Eligible Courses</p>
              <p className="text-lg font-bold text-slate-800">{drive.eligibleCourses.join(", ")}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-semibold mb-3">Registration Status Summary:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {statuses.map((status) => (
                <div key={status} className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{status}</p>
                  <p className="text-xl font-bold text-blue-600">{stats.status[status] || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Filter Registrations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch/Department</label>
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Year</label>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Showing <span className="font-bold">{filteredRegistrations.length}</span> of{" "}
            <span className="font-bold">{drive.registrations.length}</span> registrations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Sr</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Reg No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Passout</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-xs text-slate-800 whitespace-nowrap">{index + 1}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-800 whitespace-nowrap">{reg.userName}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{reg.userEmail}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{reg.userRegNo || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{reg.userMobile || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{reg.userSpecialization}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{reg.userBranch}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{reg.userYear}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{reg.userPassoutYear || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full font-semibold text-xs ${getStatusColor(reg.status)}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                        <div>{new Date(reg.timestamp).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          {new Date(reg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No registrations match the selected filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveDetails;