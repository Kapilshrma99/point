import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { FileText, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Article {
  id: string;
  title: string;
  slug: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface GroupedArticles {
  [categoryId: string]: {
    category: Category;
    articles: Article[];
  };
}

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [groupedArticles, setGroupedArticles] = useState<GroupedArticles>({});
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchArticlesAndCategories();
  }, []);

  const fetchArticlesAndCategories = async () => {
    const [{ data: articles }, { data: categories }] = await Promise.all([
      supabase
        .from("articles")
        .select("id, title, slug, category_id")
        .eq("status", "published")
        .order("title"),
      supabase.from("categories").select("*").order("name"),
    ]);

    if (articles && categories) {
      const grouped: GroupedArticles = {};
      const openCats = new Set<string>();

      categories.forEach((category) => {
        grouped[category.id] = {
          category,
          articles: articles.filter((a) => a.category_id === category.id),
        };
      });

      // Auto-open category containing current article
      const currentArticle = articles.find(
        (a) => location.pathname === `/articles/${a.slug}`
      );
      if (currentArticle?.category_id) {
        openCats.add(currentArticle.category_id);
      }

      setGroupedArticles(grouped);
      setOpenCategories(openCats);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const isActive = (slug: string) => location.pathname === `/articles/${slug}`;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Topics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.values(groupedArticles).map(({ category, articles }) => (
                <Collapsible
                  key={category.id}
                  open={openCategories.has(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full">
                        <span className="text-lg">{category.icon}</span>
                        {open && (
                          <>
                            <span className="flex-1 text-left">
                              {category.name}
                            </span>
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${
                                openCategories.has(category.id)
                                  ? "rotate-90"
                                  : ""
                              }`}
                            />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {open && (
                      <CollapsibleContent className="ml-4 mt-1 space-y-1">
                        {articles.map((article) => (
                          <SidebarMenuItem key={article.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(article.slug)}
                            >
                              <Link
                                to={`/articles/${article.slug}`}
                                className="text-sm"
                              >
                                <FileText className="h-3 w-3" />
                                <span>{article.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
