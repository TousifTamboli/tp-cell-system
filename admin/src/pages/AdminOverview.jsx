import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Building, LogOut, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { COLLEGES, SPECIALIZATIONS, BRANCHES, YEARS, PASSOUT_YEARS } from "../config/constants";

const AdminOverview = () => {
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    regNo: "",
    mobile: "",
    specialization: "All",
    branch: "All",
    year: "All",
    passoutYear: "All",
  });

  const [collegeStats, setCollegeStats] = useState({});

  useEffect(() => {
    fetchCollegeStats();
  }, []);

  const fetchCollegeStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/college-stats`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCollegeStats(data);
      }
    } catch (err) {
      console.error("Error fetching college stats:", err);
    }
  };

  const fetchStudentsByCollege = async (college) => {
    setLoading(true);
    setError("");
    setSelectedCollege(college);

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/students-by-college/${college}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        setError("Failed to load students");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  // Apply filters
  const filteredStudents = students.filter((student) => {
    const nameMatch = student.name.toLowerCase().includes(filters.name.toLowerCase());
    const emailMatch = student.email.toLowerCase().includes(filters.email.toLowerCase());
    const regNoMatch = student.regNo.toLowerCase().includes(filters.regNo.toLowerCase());
    const mobileMatch = student.mobile.includes(filters.mobile);
    const specializationMatch = filters.specialization === "All" || student.specialization === filters.specialization;
    const branchMatch = filters.branch === "All" || student.branch === filters.branch;
    const yearMatch = filters.year === "All" || student.year === filters.year;
    const passoutYearMatch = filters.passoutYear === "All" || student.passoutYear === filters.passoutYear;

    return nameMatch && emailMatch && regNoMatch && mobileMatch &&
      specializationMatch && branchMatch && yearMatch && passoutYearMatch;
  });

  const resetFilters = () => {
    setFilters({
      name: "",
      email: "",
      regNo: "",
      mobile: "",
      specialization: "All",
      branch: "All",
      year: "All",
      passoutYear: "All",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-muted-foreground hover:text-foreground text-lg flex items-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg font-semibold transition flex items-center self-start sm:self-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {!selectedCollege ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Select College</h2>
              <p className="text-muted-foreground mb-8">Choose a college to view student details</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {COLLEGES.map((college) => (
                <div
                  key={college}
                  onClick={() => fetchStudentsByCollege(college)}
                  className="bg-card p-6 rounded-lg shadow-lg border border-border cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-200 hover:scale-105"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 truncate">{college}</h3>
                    <p className="text-3xl font-bold text-primary mb-1">
                      {collegeStats[college] || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Students</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {selectedCollege}
                </h2>
                <p className="text-muted-foreground">All registered students</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCollege(null);
                  setStudents([]);
                  resetFilters();
                }}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg font-semibold transition flex items-center self-start sm:self-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Colleges
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Filters Section */}
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border mb-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Filter Students</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by name"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />

                <input
                  type="text"
                  placeholder="Search by email"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />

                <input
                  type="text"
                  placeholder="Search by reg no"
                  value={filters.regNo}
                  onChange={(e) => setFilters({ ...filters, regNo: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />

                <input
                  type="text"
                  placeholder="Search by mobile"
                  value={filters.mobile}
                  onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />

                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="All" className="bg-background text-foreground">All Specializations</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec} className="bg-background text-foreground">{spec}</option>
                  ))}
                </select>

                <select
                  value={filters.branch}
                  onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="All" className="bg-background text-foreground">All Branches</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch} className="bg-background text-foreground">{branch}</option>
                  ))}
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="All" className="bg-background text-foreground">All Years</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year} className="bg-background text-foreground">{year} Year</option>
                  ))}
                </select>

                <select
                  value={filters.passoutYear}
                  onChange={(e) => setFilters({ ...filters, passoutYear: e.target.value })}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="All" className="bg-background text-foreground">All Passout Years</option>
                  {PASSOUT_YEARS.map((year) => (
                    <option key={year} value={year} className="bg-background text-foreground">{year}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg font-semibold transition flex items-center"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Filters
              </button>
            </div>

            {/* Results Summary */}
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-foreground font-semibold">
                  Showing <span className="text-primary">{filteredStudents.length}</span> of <span className="text-primary">{students.length}</span> students
                </p>
              </div>
            </div>

            {/* Students Table */}
            {loading ? (
              <div className="bg-card p-12 rounded-lg shadow-lg border border-border text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
                {filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
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
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {filteredStudents.map((student, index) => (
                          <tr key={student._id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{index + 1}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{student.name}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.email}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.regNo}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.mobile}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.specialization}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.branch}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.year}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.passoutYear}</td>
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
                        <h3 className="text-xl font-bold text-foreground mb-2">No Students Found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;