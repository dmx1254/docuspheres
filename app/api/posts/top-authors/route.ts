// app/api/posts/top-authors/route.ts
import { Post } from "@/app/models/Post";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const topAuthors = await Post.aggregate([
      {
        $group: {
          _id: "$author._id",
          author: { $first: "$author" },
          totalPosts: { $sum: 1 },
          totalLikes: {
            $sum: {
              $cond: [{ $isArray: "$likes" }, { $size: "$likes" }, 0],
            },
          },
          totalComments: {
            $sum: {
              $cond: [{ $isArray: "$comments" }, { $size: "$comments" }, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: "$author.name",
          avatar: "$author.avatar",
          totalPosts: 1,
          totalLikes: 1,
          totalComments: 1,
          engagementScore: {
            $add: [
              "$totalPosts",
              { $multiply: ["$totalLikes", 0.5] },
              { $multiply: ["$totalComments", 0.3] },
            ],
          },
        },
      },
      { $sort: { engagementScore: -1 } },
      { $limit: 5 },
    ]);

    const formattedAuthors = topAuthors.map((author) => ({
      _id: author._id ? author._id.toString() : "",
      name: author.name || "Utilisateur inconnu",
      avatar: author.avatar || "/ava.jpg",
      totalPosts: author.totalPosts || 0,
      totalLikes: author.totalLikes || 0,
      totalComments: author.totalComments || 0,
      engagementScore: Math.round((author.engagementScore || 0) * 100) / 100,
    }));

    return NextResponse.json(formattedAuthors);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des meilleurs auteurs:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
