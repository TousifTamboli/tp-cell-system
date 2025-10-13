import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SPECIALIZATIONS, BRANCHES, YEARS, COLLEGES } from "../config/constants";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    collegeEmail: "",
    password: "",
    name: "",
    mobile: "",
    rollNo: "",
    regNo: "",
    collegeName: "",
    specialization: "",
    branch: "",
    year: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    // Check if all fields are filled
    if (
      !formData.name ||
      !formData.email ||
      !formData.collegeEmail ||
      !formData.password ||
      !formData.mobile ||
      !formData.rollNo ||
      !formData.regNo ||
      !formData.collegeName ||
      !formData.specialization ||
      !formData.branch ||
      !formData.year
    ) {
      setError("All fields are required");
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check college email ends with raisoni.net
    if (!formData.collegeEmail.toLowerCase().endsWith("raisoni.net")) {
      setError("College email must end with raisoni.net");
      return false;
    }

    // Check mobile number is exactly 10 digits
    if (!/^\d{10}$/.test(formData.mobile)) {
      setError("Mobile number must be exactly 10 digits");
      return false;
    }

    // Check password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form before sending
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Registration successful! Redirecting to login...");
        navigate("/login");
      } else {
        // Show specific error message from backend
        if (data.message === 'Email already registered') {
          setError('This email is already registered. Please login or use a different email.');
        } else if (data.message === 'Registration number already exists') {
          setError('This registration number is already registered.');
        } else {
          setError(data.message || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error(error);
      setError("Error during registration. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
          Student Registration
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="collegeEmail"
            type="email"
            placeholder="College Email (must end with @raisoni.net)"
            value={formData.collegeEmail}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
            minLength="6"
          />

          <input
            name="mobile"
            placeholder="Mobile Number (10 digits)"
            value={formData.mobile}
            onChange={handleChange}
            className="input"
            required
            maxLength="10"
            pattern="\d{10}"
            title="Mobile number must be exactly 10 digits"
          />

          <input
            name="rollNo"
            placeholder="Roll Number"
            value={formData.rollNo}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="regNo"
            placeholder="Registration Number"
            value={formData.regNo}
            onChange={handleChange}
            className="input"
            required
          />

          <select
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select College</option>
            {COLLEGES.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>

          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Current Specialization</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Branch/Department</option>
            {BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Current Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y} Year
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;