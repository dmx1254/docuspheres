import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { startOfMonth, subMonths } from "date-fns";
import { File } from "@/app/models/File";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/option";

connectDB();

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisation du stockage sur les 12 derniers mois
    const today = new Date();
    const storageData = await Promise.all(
      Array.from({ length: 12 }).map(async (_, i) => {
        const date = startOfMonth(subMonths(today, 11 - i));
        const nextDate = startOfMonth(subMonths(today, 10 - i));

        const result = await File.aggregate([
          {
            $match: {
              createdAt: {
                $gte: date,
                $lt: nextDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSize: { $sum: "$size" },
            },
          },
        ]);

        return {
          month: date.toLocaleDateString("fr-FR", { month: "short" }),
          storage: Math.round(
            (result[0]?.totalSize || 0) / (1024 * 1024 * 1024)
          ), // Convertir en GB
        };
      })
    );

    return NextResponse.json(storageData);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de stockage:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données de stockage" },
      { status: 500 }
    );
  }
}
