import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

interface Suggestion {
  id: string;
  suggestion_text: string;
  status: string;
  created_at: string;
  articles: {
    title: string;
    slug: string;
  };
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchUserSuggestions();
    }
  }, [user, loading, navigate]);

  const fetchUserSuggestions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("suggestions")
      .select("*, articles(title, slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setSuggestions(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>My Suggestions</CardTitle>
            <CardDescription>
              Track your suggestions for article improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="text-muted-foreground">
                You haven't submitted any suggestions yet.
              </p>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {suggestion.articles.title}
                          </CardTitle>
                          <CardDescription>
                            {new Date(suggestion.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(suggestion.status)}>
                          {suggestion.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{suggestion.suggestion_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;