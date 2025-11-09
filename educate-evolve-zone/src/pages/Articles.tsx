import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  views: number;
  categories: { name: string; slug: string } | null;
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
    fetchArticles(search || "");
  }, [searchParams]);

  const fetchArticles = async (search: string) => {
    let query = supabase
      .from("articles")
      .select("*, categories(name, slug)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data } = await query;
    if (data) setArticles(data);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    fetchArticles(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">All Articles</h1>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/articles/${article.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  {article.categories && (
                    <div className="text-sm text-muted-foreground mb-2">
                      {article.categories.name}
                    </div>
                  )}
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    <span>{article.views} views</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;