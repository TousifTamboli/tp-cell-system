import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Users, Calendar, Building2, AlertCircle, Loader2, RotateCcw, Filter } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading drive details...</p>
        </div>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-background p-6">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-4 text-primary hover:text-primary/80 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error || "Drive not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const isPastDrive = isDeadlinePassed(drive.deadline);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-muted-foreground hover:text-foreground flex items-center self-start"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {drive.companyName} - Student Registrations
              </h1>
              {isPastDrive && (
                <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm font-semibold rounded-full border border-destructive/20 self-start">
                  DRIVE ENDED
                </span>
              )}
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center self-start sm:self-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className={`rounded-lg shadow-lg p-6 mb-6 border ${isPastDrive ? 'bg-muted/50 border-destructive/20' : 'bg-card border-border'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Company</p>
                <p className="text-lg font-bold text-foreground truncate">{drive.companyName}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Deadline</p>
                <p className={`text-lg font-bold ${isPastDrive ? 'text-destructive' : 'text-foreground'}`}>
                  {new Date(drive.deadline).toLocaleDateString()}
                </p>
                {isPastDrive && (
                  <p className="text-xs text-destructive mt-1">
                    Expired {Math.floor((new Date() - new Date(drive.deadline)) / (1000 * 60 * 60 * 24))} days ago
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Total Registrations</p>
                <p className="text-lg font-bold text-primary">{drive.registrations.length}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Eligible Courses</p>
                <p className="text-lg font-bold text-foreground">{drive.eligibleCourses.join(", ")}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground font-semibold mb-3">Registration Status Summary:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {statuses.map((status) => (
                <div key={status} className="bg-background p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1 truncate">{status}</p>
                  <p className="text-xl font-bold text-primary">{stats.status[status] || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Filter Registrations</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                <option value="All" className="bg-background text-foreground">All ({drive.registrations.length})</option>
                {statuses.map((status) => (
                  <option key={status} value={status} className="bg-background text-foreground">
                    {status} ({stats.status[status] || 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Specialization</label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                <option value="All" className="bg-background text-foreground">All ({drive.registrations.length})</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec} className="bg-background text-foreground">
                    {spec} ({stats.specialization[spec] || 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Branch/Department</label>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                <option value="All" className="bg-background text-foreground">All ({drive.registrations.length})</option>
                {BRANCHES.map((branch) => {
                  const count = drive.registrations.filter((reg) => reg.userBranch === branch).length;
                  return count > 0 ? (
                    <option key={branch} value={branch} className="bg-background text-foreground">
                      {branch} ({count})
                    </option>
                  ) : null;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Current Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                <option value="All" className="bg-background text-foreground">All ({drive.registrations.length})</option>
                {YEARS.map((year) => {
                  const count = drive.registrations.filter((reg) => reg.userYear === year).length;
                  return count > 0 ? (
                    <option key={year} value={year} className="bg-background text-foreground">
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
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg font-semibold transition flex items-center"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </button>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-foreground font-semibold">
              Showing <span className="text-primary">{filteredRegistrations.length}</span> of <span className="text-primary">{drive.registrations.length}</span> registrations
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          {filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">#</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Email</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Reg No</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Mobile</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Course</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Branch</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Year</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Passout</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{reg.userName}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.userEmail}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.userRegNo || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.userMobile || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.userSpecialization}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.userBranch}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.userYear}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.userPassoutYear || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full font-semibold text-xs ${getStatusColor(reg.status)}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div>{new Date(reg.timestamp).toLocaleDateString()}</div>
                        <div className="text-muted-foreground/70">
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
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No Registrations Found</h3>
                  <p className="text-muted-foreground">No registrations match the selected filters</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveDetails;