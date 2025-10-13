import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SPECIALIZATIONS } from "../config/constants";

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading drive details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">
              Edit Placement Drive
            </h1>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Edit Form */}
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Google, Microsoft, TCS"
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Application Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Eligible Courses */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Eligible Courses * (Select at least one)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {SPECIALIZATIONS.map((course) => (
                  <label
                    key={course}
                    className={`cursor-pointer px-4 py-2 rounded-lg border-2 text-center transition ${
                      formData.eligibleCourses.includes(course)
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                        : "border-gray-300 hover:border-gray-400"
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

            {/* Process Stages/Statuses */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addStatus}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                >
                  + Add
                </button>
              </div>

              {/* Display current statuses */}
              <div className="space-y-2">
                {formData.statuses.length > 0 ? (
                  formData.statuses.map((status, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
                    >
                      <span className="text-gray-700">{status}</span>
                      <button
                        type="button"
                        onClick={() => removeStatus(status)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
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
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                Drive is Active (visible to students)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Updating..." : "Update Drive"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc ml-5">
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