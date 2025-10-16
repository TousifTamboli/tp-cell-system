import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  Clock,
  User,
  LogOut,
  Briefcase,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  GraduationCap,
  Menu,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentDrives, setCurrentDrives] = useState([]);
  const [pastDrives, setPastDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          navigate("/login");
          return;
        }

        setUser(JSON.parse(storedUser));

        // Fetch all drives for user's specialization
        const res = await fetch("http://localhost:5000/api/placement/get-drives", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();

          // Separate drives into current and past based on deadline
          const current = data.filter(drive => !isDeadlinePassed(drive.deadline));
          const past = data.filter(drive => isDeadlinePassed(drive.deadline));

          setCurrentDrives(current);
          setPastDrives(past);
          setError("");
        } else if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load placement drives");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleStatusUpdate = async (driveId, status, deadline) => {
    if (isDeadlinePassed(deadline)) {
      setError("This drive has ended. You cannot update your status.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/placement/update-status", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driveId,
          status,
          userId: user.id,
        }),
      });

      if (res.ok) {
        setError("");
        window.location.reload();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      setError("Error updating status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-card border-r border-border shadow-lg
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full p-6">
            {/* Header with close button for mobile */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">T&P Cell</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile Card */}
            {user && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                      <CardDescription className="text-sm truncate">{user.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              <Button
                variant={activeTab === "current" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("current");
                  setSidebarOpen(false);
                }}
                className="w-full justify-start h-12"
              >
                <Briefcase className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Current Drives</span>
                <Badge variant="secondary" className="ml-auto flex-shrink-0">
                  {currentDrives.length}
                </Badge>
              </Button>

              <Button
                variant={activeTab === "past" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("past");
                  setSidebarOpen(false);
                }}
                className="w-full justify-start h-12"
              >
                <Archive className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Past Drives</span>
                <Badge variant="secondary" className="ml-auto flex-shrink-0">
                  {pastDrives.length}
                </Badge>
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/profile");
                  setSidebarOpen(false);
                }}
                className="w-full justify-start h-12"
              >
                <User className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">My Profile</span>
              </Button>

              <Separator className="my-4" />

              <Button
                variant="ghost"
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Logout</span>
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold text-foreground">T&P Cell</h1>
              </div>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {activeTab === "current" ? "Current Placement Drives" : "Past Placement Drives"}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {activeTab === "current"
                  ? "See the drives below and select the latest status that belong to you."
                  : "View your previous placement drive history"}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Current Drives Tab */}
            {activeTab === "current" && (
              <div>
                {currentDrives && currentDrives.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {currentDrives.map((drive) => (
                      <Card key={drive._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-lg sm:text-xl truncate">{drive.companyName}</CardTitle>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Status Options (Click on the current status that you have acheived):
                              </p>
                              {drive.statuses && drive.statuses.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {drive.statuses.map((status, idx) => (
                                    <Button
                                      key={idx}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(drive._id, status, drive.deadline)}
                                      className="text-xs flex-shrink-0"
                                    >
                                      {status}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-sm">No statuses available</p>
                              )}
                            </div>

                            {drive.deadline && (
                              <div className="pt-3 border-t">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-8 sm:py-12">
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
                          <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold">No Current Drives</h3>
                          <p className="text-muted-foreground text-sm sm:text-base max-w-md">
                            No placement drives available for your specialization at the moment
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Past Drives Tab */}
            {activeTab === "past" && (
              <div>
                {pastDrives && pastDrives.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {pastDrives.map((drive) => {
                      const userRegistration = drive.registrations?.find(
                        reg => reg.userId.toString() === user.id
                      );

                      return (
                        <Card key={drive._id} className="opacity-90">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <CardTitle className="text-lg sm:text-xl truncate">{drive.companyName}</CardTitle>
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Ended
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {userRegistration ? (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">Your Status:</p>
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  </div>
                                  <p className="font-semibold truncate">{userRegistration.status}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Updated: {new Date(userRegistration.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                    <p className="text-sm">You did not participate in this drive</p>
                                  </div>
                                </div>
                              )}

                              {drive.deadline && (
                                <div className="pt-3 border-t">
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="text-center py-8 sm:py-12">
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
                          <Archive className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold">No Past Drives</h3>
                          <p className="text-muted-foreground text-sm sm:text-base">
                            No past placement drives found
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;