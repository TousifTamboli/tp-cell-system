import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    collegeEmail: "",
    name: "",
    mobile: "",
    rollNumber: "",
    registrationNumber: "",
    collegeName: "",
    specialization: "",
    department: "",
    currentYear: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/student-login", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-8 rounded-xl w-[400px]"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Student Login
        </h2>

        {Object.keys(formData).map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            value={formData[key]}
            onChange={handleChange}
            placeholder={key.replace(/([A-Z])/g, " $1")}
            className="w-full border p-2 mb-3 rounded-md text-sm"
          />
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
