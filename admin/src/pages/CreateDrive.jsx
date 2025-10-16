import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Loader2, AlertCircle } from "lucide-react";
import { SPECIALIZATIONS, PASSOUT_YEARS } from "../config/constants";

const CreateDrive = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    deadline: "",
    eligibleCourses: [],
    eligiblePassoutYears: [],
    statuses: [],
  });
  const [statusInput, setStatusInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleCourseToggle = (course) => {
    setFormData((prev) => ({
      ...prev,
      eligibleCourses: prev.eligibleCourses.includes(course)
        ? prev.eligibleCourses.filter((c) => c !== course)
        : [...prev.eligibleCourses, course],
    }));
  };

  const handlePassoutYearToggle = (year) => {
    setFormData((prev) => ({
      ...prev,
      eligiblePassoutYears: prev.eligiblePassoutYears.includes(year)
        ? prev.eligiblePassoutYears.filter((y) => y !== year)
        : [...prev.eligiblePassoutYears, year],
    }));
  };

  const addStatus = () => {
    if (statusInput.trim() === "") {
      setError("Status cannot be empty");
      return;
    }

    if (formData.statuses.includes(statusInput.trim())) {
      setError("This status already exists");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      statuses: [...prev.statuses, statusInput.trim()],
    }));
    setStatusInput("");
    setError("");
  };

  const removeStatus = (index) => {
    setFormData((prev) => ({
      ...prev,
      statuses: prev.statuses.filter((_, i) => i !== index),
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
      setError("Please select at least one eligible course");
      return;
    }

    if (formData.eligiblePassoutYears.length === 0) {
      setError("Please select at least one eligible passout year");
      return;
    }

    if (formData.statuses.length === 0) {
      setError("Please add at least one status/stage");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch("http://localhost:5000/api/placement/create-drive", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Placement drive created successfully!");
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Failed to create drive");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-muted-foreground hover:text-foreground text-lg flex items-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Create New Drive</h1>
        </div>
      </nav>

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
              <label className="block text-sm font-semibold text-foreground mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., Google, Microsoft, Amazon"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Registration Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
            </div>

            {/* Eligible Courses */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Eligible Courses
              </label>
              <div className="space-y-2">
                {SPECIALIZATIONS.map((course) => (
                  <label
                    key={course}
                    className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.eligibleCourses.includes(course)}
                      onChange={() => handleCourseToggle(course)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="ml-3 text-foreground font-medium">{course}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Eligible Passout Years */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Eligible Passout Years
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {PASSOUT_YEARS.map((year) => (
                  <label
                    key={year}
                    className={`cursor-pointer px-3 py-2 rounded-lg border-2 text-center transition font-medium ${formData.eligiblePassoutYears.includes(year)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-foreground hover:bg-muted/50"
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
              <label className="block text-sm font-semibold text-foreground mb-3">
                Process Stages (Status Options for Students)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStatus()}
                  placeholder="e.g., Registration Done, Test Given, Interview"
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={addStatus}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-semibold transition flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>

              {/* Added Statuses */}
              <div className="space-y-2">
                {formData.statuses.length > 0 ? (
                  formData.statuses.map((status, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-primary/10 p-3 rounded-lg border border-primary/20"
                    >
                      <span className="text-foreground font-medium">{status}</span>
                      <button
                        type="button"
                        onClick={() => removeStatus(index)}
                        className="text-destructive hover:text-destructive/80 font-bold flex items-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    No stages added yet
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-2 rounded-lg font-semibold transition flex items-center justify-center ${loading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Drive
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDrive;