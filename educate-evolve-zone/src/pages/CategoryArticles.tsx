import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  views: number;
}

interface Category {
  name: string;
  description: string;
  icon: string;
}

const CategoryArticles = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndArticles();
    }
  }, [slug]);

  const fetchCategoryAndArticles = async () => {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("name, description, icon")
      .eq("slug", slug)
      .single();

    if (categoryData) {
      setCategory(categoryData);

      const { data: articlesData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, created_at, views, category_id, categories!inner(slug)")
        .eq("categories.slug", slug)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (articlesData) setArticles(articlesData);
    }
  };

  if (!category) {
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
        <Link to="/categories">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>

        <div className="mb-8">
          <div className="text-5xl mb-4">{category.icon}</div>
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/articles/${article.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
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
            <p className="text-muted-foreground">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryArticles;