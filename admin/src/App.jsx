// admin/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CreateDrive from "./pages/CreateDrive";
import EditDrive from "./pages/EditDrive"; // Add this import
import DriveDetails from "./pages/DriveDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-drive" element={<CreateDrive />} />
        <Route path="/admin/edit-drive/:driveId" element={<EditDrive />} /> {/* Add this route */}
        <Route path="/admin/drive-details/:driveId" element={<DriveDetails />} />
      </Routes>
    </Router>
  );
}

export default App;