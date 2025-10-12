import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Login successful!");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid credentials!");
      }
    } catch (error) {
      console.error(error);
      alert("Error during login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-md border rounded-lg max-w-4xl w-full grid md:grid-cols-2 gap-6 p-6">
        {/* Left Side - Login Form */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2">
            Applicant Login Here
          </h2>

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

            <div className="flex justify-between">
              <button type="submit" className="btn-success">
                Login Here
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="btn-primary"
              >
                New Registration
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Instructions */}
        <div className="bg-gray-100 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">
            Instructions
          </h3>
          <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
            <li>Enter your registered email</li>
            <li>Enter your password correctly</li>
            <li>Click on <b>Login Here</b> to continue</li>
            <li>Use <b>New Registration</b> if you don’t have an account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
