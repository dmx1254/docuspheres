// components/TopAuthors.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface TopAuthor {
  _id: string;
  name: string;
  avatar: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  engagementScore: number;
}

export function TopAuthors() {
  const [authors, setAuthors] = useState<TopAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopAuthors = async () => {
      try {
        const response = await fetch("/api/posts/top-authors");
        if (!response.ok) throw new Error("Erreur de chargement");
        const data = await response.json();
        setAuthors(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAuthors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-4 p-1">
          {authors.map((author, index) => (
            <div key={author._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <Avatar>
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>{author.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {author.totalPosts} publications
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{author.engagementScore}</p>
                <p className="text-xs text-muted-foreground">
                  Score d'engagement
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
