import { useState } from "react";
import api from "../services/api";

export default function CompanyBlock({ drive }) {
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleConfirm = async () => {
    await api.post("/placement/update-status", {
      driveId: drive._id,
      status: selectedStatus,
    });
    alert("Status updated successfully!");
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-lg">{drive.companyName}</h3>
      <select
        className="w-full border mt-3 p-2 rounded-md"
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="">Select Status</option>
        {drive.statuses.map((status, idx) => (
          <option key={idx} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        onClick={handleConfirm}
        className="w-full bg-green-600 text-white p-2 mt-3 rounded-md hover:bg-green-700"
      >
        Confirm
      </button>
    </div>
  );
}
