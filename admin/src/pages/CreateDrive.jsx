import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateDrive = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    deadline: "",
    eligibleCourses: [],
    statuses: [],
  });
  const [statusInput, setStatusInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const courseOptions = ["B.Tech", "B.Sc", "M.Tech"];

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

    if (formData.statuses.length === 0) {
      setError("Please add at least one status/stage");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/placement/create-drive`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-gray-600 hover:text-gray-900 text-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Create New Drive</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., Google, Microsoft, Amazon"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Registration Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Eligible Courses */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Eligible Courses
              </label>
              <div className="space-y-2">
                {courseOptions.map((course) => (
                  <label
                    key={course}
                    className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.eligibleCourses.includes(course)}
                      onChange={() => handleCourseToggle(course)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-slate-700 font-medium">{course}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Process Stages/Statuses */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Process Stages (Status Options for Students)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addStatus()}
                  placeholder="e.g., Registration Done, Test Given, Interview"
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={addStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Add
                </button>
              </div>

              {/* Added Statuses */}
              <div className="space-y-2">
                {formData.statuses.length > 0 ? (
                  formData.statuses.map((status, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
                    >
                      <span className="text-slate-800 font-medium">{status}</span>
                      <button
                        type="button"
                        onClick={() => removeStatus(index)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No stages added yet
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 text-white px-6 py-2 rounded-lg font-semibold transition ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Creating..." : "Create Drive"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDrive;