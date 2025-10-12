import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        alert("Registration failed. Try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error during registration");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
          Registration
        </h2>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input name="email" placeholder="Email" onChange={handleChange} className="input" />
          <input name="collegeEmail" placeholder="College Email ID" onChange={handleChange} className="input" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input" />
          <input name="name" placeholder="Full Name" onChange={handleChange} className="input" />
          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} className="input" />
          <input name="rollNo" placeholder="Roll Number" onChange={handleChange} className="input" />
          <input name="regNo" placeholder="Registration Number" onChange={handleChange} className="input" />

          <select name="collegeName" onChange={handleChange} className="input">
            <option value="">Select College</option>
            <option value="GHRCEM">GH Raisoni College of Engineering and Management Pune</option>
          </select>

          <select name="specialization" onChange={handleChange} className="input">
            <option value="">Current Specialization</option>
            <option value="B.Tech">B.Tech</option>
            <option value="B.Sc">B.Sc</option>
            <option value="M.Tech">M.Tech</option>
          </select>

          <input name="branch" placeholder="Branch/Department" onChange={handleChange} className="input" />

          <select name="year" onChange={handleChange} className="input">
            <option value="">Current Year</option>
            <option value="1st">1st Year</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
          </select>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 hover:bg-blue-600">
            Register
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
