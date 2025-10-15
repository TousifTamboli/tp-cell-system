import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/college-stats`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-gray-600 hover:text-gray-900 text-lg"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {!selectedCollege ? (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Select College</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLLEGES.map((college) => (
                <div
                  key={college}
                  onClick={() => fetchStudentsByCollege(college)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{college}</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {collegeStats[college] || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Students</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedCollege} - All Students
              </h2>
              <button
                onClick={() => {
                  setSelectedCollege(null);
                  setStudents([]);
                  resetFilters();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                Back to Colleges
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Filter Students</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by Name"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder="Search by Email"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder="Search by Reg No"
                  value={filters.regNo}
                  onChange={(e) => setFilters({ ...filters, regNo: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder="Search by Mobile"
                  value={filters.mobile}
                  onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Courses</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>

                <select
                  value={filters.branch}
                  onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Branches</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Years</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={filters.passoutYear}
                  onChange={(e) => setFilters({ ...filters, passoutYear: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Passout Years</option>
                  {PASSOUT_YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Reset Filters
              </button>
            </div>

            {/* Results Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Showing <span className="font-bold">{filteredStudents.length}</span> of{" "}
                <span className="font-bold">{students.length}</span> students
              </p>
            </div>

            {/* Students Table */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {filteredStudents.length > 0 ? (
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStudents.map((student, index) => (
                          <tr key={student._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-xs text-slate-800 whitespace-nowrap">{index + 1}</td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-800 whitespace-nowrap">{student.name}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{student.email}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{student.regNo}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{student.mobile}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{student.specialization}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{student.branch}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{student.year}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{student.passoutYear}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No students found</p>
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