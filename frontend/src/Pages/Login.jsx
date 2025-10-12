import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Store JWT token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials!");
      }
    } catch (error) {
      console.error(error);
      setError("Error during login. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-md border max-w-4xl w-full grid md:grid-cols-2 gap-6 p-6">
        {/* Left Side - Login Form */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2">
            Applicant Login Here
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 text-white py-2 rounded transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Logging in..." : "Login Here"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                New Registration
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Instructions */}
        <div className="bg-gray-100 border p-4">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">
            Instructions
          </h3>
          <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
            <li>Enter your registered email</li>
            <li>Enter your password correctly</li>
            <li>Click on <b>Login Here</b> to continue</li>
            <li>Use <b>New Registration</b> if you don't have an account</li>
            <li>Your session will remain valid for 7 days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;