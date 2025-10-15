import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CreateDrive from "./pages/CreateDrive";
import DriveDetails from "./pages/DriveDetails";
import EditDrive from "./pages/EditDrive";
import AdminOverview from "./pages/AdminOverview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-drive" element={<CreateDrive />} />
        <Route path="/admin/drive-details/:driveId" element={<DriveDetails />} />
        <Route path="/admin/edit-drive/:driveId" element={<EditDrive />} />
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;