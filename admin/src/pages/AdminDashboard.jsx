import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  Clock,
  Users,
  LogOut,
  Plus,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle,
  XCircle,
  Archive,
  Briefcase
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [allDrives, setAllDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // Helper function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const res = await fetch("http://localhost:5000/api/placement/admin/all-drives", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAllDrives(data);
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          setError("Failed to load drives");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading drives");
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/placement/admin/delete-drive/${driveId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setAllDrives(allDrives.filter((d) => d._id !== driveId));
        // You could add a toast notification here instead of alert
      } else {
        setError("Failed to delete drive");
      }
    } catch (err) {
      setError("Error deleting drive");
    }
  };

  // Separate drives into current and past
  const currentDrives = allDrives.filter(drive => !isDeadlinePassed(drive.deadline));
  const pastDrives = allDrives.filter(drive => isDeadlinePassed(drive.deadline));

  const drives = activeTab === "current" ? currentDrives : pastDrives;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">T&P Cell Admin</h1>
              <p className="text-sm text-muted-foreground">Training & Placement Management</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="self-start sm:self-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={activeTab === "current" ? "default" : "outline"}
            onClick={() => setActiveTab("current")}
            className="flex-1 sm:flex-none"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Current Drives
            <Badge variant="secondary" className="ml-2">
              {currentDrives.length}
            </Badge>
          </Button>

          <Button
            variant={activeTab === "past" ? "default" : "outline"}
            onClick={() => setActiveTab("past")}
            className="flex-1 sm:flex-none"
          >
            <Archive className="mr-2 h-4 w-4" />
            Past Drives
            <Badge variant="secondary" className="ml-2">
              {pastDrives.length}
            </Badge>
          </Button>

          <Button
            onClick={() => navigate("/admin/create-drive")}
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Drive
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/admin/overview")}
            className="flex-1 sm:flex-none"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tab Header */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {activeTab === "current" ? "Active Placement Drives" : "Past Placement Drives"}
          </h2>
          <p className="text-muted-foreground">
            {activeTab === "current"
              ? "Manage currently active placement drives"
              : "View completed and expired placement drives"}
          </p>
        </div>

        {/* Drives List */}
        {drives && drives.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {drives.map((drive) => {
              const isPast = isDeadlinePassed(drive.deadline);
              const daysSinceExpiry = isPast ? Math.floor((new Date() - new Date(drive.deadline)) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <Card key={drive._id} className={`hover:shadow-lg transition-shadow ${isPast ? 'opacity-90' : ''}`}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-xl sm:text-2xl">{drive.companyName}</CardTitle>
                            {isPast && (
                              <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created: {new Date(drive.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={drive.isActive ? "default" : "secondary"}>
                        {drive.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-6">
                      {/* Drive Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className={`${isPast ? 'bg-muted/50' : 'bg-muted/50'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                            </div>
                            <p className={`font-semibold ${isPast ? 'text-destructive' : 'text-foreground'}`}>
                              {new Date(drive.deadline).toLocaleDateString()}
                            </p>
                            {isPast && (
                              <p className="text-xs text-destructive mt-1">
                                Expired {daysSinceExpiry} days ago
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm font-medium text-muted-foreground">Eligible Courses</p>
                            </div>
                            <p className="font-semibold truncate">
                              {drive.eligibleCourses.join(", ")}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20 sm:col-span-2 lg:col-span-1">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="w-4 h-4 text-primary" />
                              <p className="text-sm font-medium text-muted-foreground">Registrations</p>
                            </div>
                            <p className="font-bold text-primary text-lg">
                              {drive.registrations.length} students
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Process Stages */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-foreground">Process Stages</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {drive.statuses.map((status, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {status}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => navigate(`/admin/drive-details/${drive._id}`)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => navigate(`/admin/edit-drive/${drive._id}`)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteDrive(drive._id)}
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  {activeTab === "current" ? (
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Archive className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === "current"
                      ? "No Current Drives"
                      : "No Past Drives"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "current"
                      ? "No current placement drives available"
                      : "No past placement drives found"}
                  </p>
                  {activeTab === "current" && (
                    <Button
                      onClick={() => navigate("/admin/create-drive")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Drive
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;