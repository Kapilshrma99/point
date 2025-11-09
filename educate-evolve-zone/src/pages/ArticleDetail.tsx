import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Article {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  views: number;
  categories: { name: string; slug: string } | null;
  profiles: { username: string } | null;
}

const ArticleDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*, categories(name, slug), profiles(username)")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (data) {
      setArticle(data);
      // Increment view count
      await supabase
        .from("articles")
        .update({ views: data.views + 1 })
        .eq("id", data.id);
    }
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit suggestions.",
        variant: "destructive",
      });
      return;
    }

    if (!suggestion.trim()) {
      toast({
        title: "Empty suggestion",
        description: "Please enter your suggestion.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("suggestions").insert({
      article_id: article?.id,
      user_id: user.id,
      suggestion_text: suggestion.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your suggestion has been submitted.",
      });
      setSuggestion("");
    }

    setSubmitting(false);
  };

  if (!article) {
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
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/articles">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        <header className="mb-8">
          {article.categories && (
            <Link to={`/categories/${article.categories.slug}`}>
              <Badge variant="secondary" className="mb-4">
                {article.categories.name}
              </Badge>
            </Link>
          )}
          
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(article.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views} views
            </div>
            {article.profiles && (
              <div>By {article.profiles.username}</div>
            )}
          </div>
        </header>

        <Card className="mb-8">
          <CardContent className="prose prose-slate dark:prose-invert max-w-none pt-6">
            <div className="whitespace-pre-wrap">{article.content}</div>
          </CardContent>
        </Card>

        {/* Suggestion Form */}
        <Card>
          <CardHeader>
            <CardTitle>Suggest Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                <Textarea
                  placeholder="Share your suggestions to improve this article..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={4}
                />
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Suggestion"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Sign in to suggest improvements to this article
                </p>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </article>
    </div>
  );
};

export default ArticleDetail;