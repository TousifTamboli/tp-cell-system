import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setError("");
        } else if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error loading profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Profile not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navbar */}
      <div className="bg-white shadow-md p-4 mb-6 rounded-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">My Profile</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="mb-8 pb-6 border-b-2">
          <h2 className="text-3xl font-bold text-blue-800 mb-2">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
              <p className="text-lg text-gray-800">{user.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">College Email</p>
              <p className="text-lg text-gray-800">{user.collegeEmail}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Mobile Number</p>
              <p className="text-lg text-gray-800">{user.mobile}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Roll Number</p>
              <p className="text-lg text-gray-800">{user.rollNo}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Registration Number</p>
              <p className="text-lg text-gray-800">{user.regNo}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">College Name</p>
              <p className="text-lg text-gray-800">{user.collegeName}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Specialization</p>
              <p className="text-lg text-gray-800">{user.specialization}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Branch/Department</p>
              <p className="text-lg text-gray-800">{user.branch}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Current Year</p>
              <p className="text-lg text-gray-800">{user.year}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="text-sm font-semibold text-gray-600 mb-1">Current Year</p>
              <p className="text-lg text-gray-800">{user.year}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="text-sm font-semibold text-gray-600 mb-1">Expected Passout Year</p>
              <p className="text-lg text-gray-800">{user.passoutYear}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="text-sm font-semibold text-gray-600 mb-1">Member Since</p>
              <p className="text-lg text-gray-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t-2 flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;