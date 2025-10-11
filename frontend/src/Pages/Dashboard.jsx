import { useEffect, useState } from "react";
import api from "../services/api";
import CompanyBlock from "../components/CompanyBlock";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [drives, setDrives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrives = async () => {
      const res = await api.get("/placement/get-drives");
      setDrives(res.data);
    };
    fetchDrives();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-5">
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <button
          onClick={() => navigate("/profile")}
          className="block mb-2 text-left w-full"
        >
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="block mb-2 text-left w-full text-red-400"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Current Placement Drives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.map((drive) => (
            <CompanyBlock key={drive._id} drive={drive} />
          ))}
        </div>
      </main>
    </div>
  );
}
