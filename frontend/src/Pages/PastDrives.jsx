import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Archive,
  Trophy,
  Target
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PastDrives = () => {
  const navigate = useNavigate();
  const [pastDrives, setPastDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPastDrives = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch all past drives with user's participation history
        const res = await fetch("http://localhost:5000/api/placement/past-drives", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Sort by date (newest first)
          const sorted = data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setPastDrives(sorted);
          setError("");
        } else if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load past drives");
        }
      } catch (err) {
        console.error("Error fetching past drives:", err);
        setError("Error loading past drives");
      } finally {
        setLoading(false);
      }
    };

    fetchPastDrives();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading past drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Archive className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                Past Placement Drives
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                View your complete participation history
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Past Drives List */}
        {pastDrives && pastDrives.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {pastDrives.map((drive, index) => (
              <Card key={drive._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl">
                          {index + 1}. {drive.companyName}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Created on {new Date(drive.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="self-start">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {/* Drive Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                              Deadline
                            </p>
                          </div>
                          <p className="text-lg font-semibold">
                            {drive.deadline
                              ? new Date(drive.deadline).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                              Eligible Courses
                            </p>
                          </div>
                          <p className="text-lg font-semibold truncate">
                            {drive.eligibleCourses && drive.eligibleCourses.length > 0
                              ? drive.eligibleCourses.join(", ")
                              : "N/A"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/50 sm:col-span-2 lg:col-span-1">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                              Process Stages
                            </p>
                          </div>
                          <p className="text-lg font-semibold">
                            {drive.statuses ? drive.statuses.length : 0} Stages
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Process Stages */}
                    {drive.statuses && drive.statuses.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Trophy className="w-4 h-4 text-primary" />
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
                    )}

                    {/* User's Participation */}
                    {drive.registrations && drive.registrations.length > 0 ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <h3 className="font-semibold text-foreground">Your Participation</h3>
                        </div>
                        <Card className="bg-green-500/10 border-green-500/20">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {drive.registrations.map((reg, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                  <Badge variant="secondary" className="self-start">
                                    {reg.status}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(reg.timestamp).toLocaleDateString()} at{" "}
                                    {new Date(reg.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <h3 className="font-semibold text-foreground">Participation Status</h3>
                        </div>
                        <Card className="bg-yellow-500/10 border-yellow-500/20">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                              You did not participate in this drive
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Archive className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Past Drives</h3>
                  <p className="text-muted-foreground">
                    No past placement drives found
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PastDrives;