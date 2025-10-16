import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Plus, Trash2, AlertCircle, Loader2, Building2, Calendar, Users, Settings } from "lucide-react";
import { SPECIALIZATIONS, PASSOUT_YEARS } from "../config/constants";

const EditDrive = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    deadline: "",
    eligibleCourses: [],
    eligiblePassoutYears: [],
    statuses: [],
    isActive: true,
  });

  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchDriveDetails();
  }, [driveId]);

  const fetchDriveDetails = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/placement/admin/drive/${driveId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const drive = await res.json();

        // Format date for input field (YYYY-MM-DD format)
        const formattedDate = new Date(drive.deadline).toISOString().split('T')[0];

        setFormData({
          companyName: drive.companyName,
          deadline: formattedDate,
          eligibleCourses: drive.eligibleCourses,
          eligiblePassoutYears: drive.eligiblePassoutYears || [],
          statuses: drive.statuses,
          isActive: drive.isActive,
        });
      } else if (res.status === 404) {
        setError("Drive not found");
      } else {
        setError("Failed to load drive details");
      }
    } catch (err) {
      console.error("Error fetching drive:", err);
      setError("Error loading drive details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCourseToggle = (course) => {
    setFormData(prev => ({
      ...prev,
      eligibleCourses: prev.eligibleCourses.includes(course)
        ? prev.eligibleCourses.filter(c => c !== course)
        : [...prev.eligibleCourses, course]
    }));
  };

  const handlePassoutYearToggle = (year) => {
    setFormData(prev => ({
      ...prev,
      eligiblePassoutYears: prev.eligiblePassoutYears.includes(year)
        ? prev.eligiblePassoutYears.filter(y => y !== year)
        : [...prev.eligiblePassoutYears, year]
    }));
  };

  const addStatus = () => {
    if (newStatus.trim() && !formData.statuses.includes(newStatus.trim())) {
      setFormData(prev => ({
        ...prev,
        statuses: [...prev.statuses, newStatus.trim()]
      }));
      setNewStatus("");
    }
  };

  const removeStatus = (statusToRemove) => {
    setFormData(prev => ({
      ...prev,
      statuses: prev.statuses.filter(s => s !== statusToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    if (!formData.deadline) {
      setError("Deadline is required");
      return;
    }

    if (formData.eligibleCourses.length === 0) {
      setError("Select at least one eligible course");
      return;
    }

    if (formData.eligiblePassoutYears.length === 0) {
      setError("Select at least one eligible passout year");
      return;
    }

    if (formData.statuses.length === 0) {
      setError("Add at least one status option");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/placement/admin/update-drive/${driveId}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Drive updated successfully!");
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Failed to update drive");
      }
    } catch (err) {
      console.error("Error updating drive:", err);
      setError("Error updating drive. Please try again.");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Edit Placement Drive
              </h1>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg font-semibold transition flex items-center self-start sm:self-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Edit Form */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition"
                placeholder="e.g., Google, Microsoft, TCS"
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Application Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
            </div>

            {/* Eligible Courses */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Eligible Courses * (Select at least one)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {SPECIALIZATIONS.map((course) => (
                  <label
                    key={course}
                    className={`cursor-pointer px-3 py-2 rounded-lg border-2 text-center text-sm transition ${formData.eligibleCourses.includes(course)
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border hover:border-primary/50 text-foreground"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.eligibleCourses.includes(course)}
                      onChange={() => handleCourseToggle(course)}
                    />
                    {course}
                  </label>
                ))}
              </div>
            </div>

            {/* Eligible Passout Years */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Eligible Passout Years * (Select at least one)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {PASSOUT_YEARS.map((year) => (
                  <label
                    key={year}
                    className={`cursor-pointer px-3 py-2 rounded-lg border-2 text-center text-sm transition font-medium ${formData.eligiblePassoutYears.includes(year)
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border hover:border-primary/50 text-foreground"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.eligiblePassoutYears.includes(year)}
                      onChange={() => handlePassoutYearToggle(year)}
                    />
                    {year}
                  </label>
                ))}
              </div>
            </div>

            {/* Process Stages/Statuses */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Process Stages * (Students will select from these)
              </label>

              {/* Add new status */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addStatus();
                    }
                  }}
                  placeholder="e.g., Registration Done, Test Given, Interview Scheduled"
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={addStatus}
                  className="px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>

              {/* Display current statuses */}
              <div className="space-y-2">
                {formData.statuses.length > 0 ? (
                  formData.statuses.map((status, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-lg border border-border"
                    >
                      <span className="text-foreground">{status}</span>
                      <button
                        type="button"
                        onClick={() => removeStatus(status)}
                        className="text-destructive hover:text-destructive/80 font-semibold text-sm flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">
                    No stages added yet. Add at least one stage.
                  </p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-foreground">
                Drive is Active (visible to students)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Drive
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-lg font-semibold transition flex items-center justify-center"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Important Notes:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-5">
              <li>Changes will be immediately visible to eligible students</li>
              <li>Existing student registrations will NOT be affected</li>
              <li>Students who already applied can still update their status</li>
              <li>Unchecking "Drive is Active" will hide it from student dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDrive;