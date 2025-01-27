import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/option";
import { History } from "@/app/models/History";

connectDB();

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les activités des 7 derniers jours
    const today = startOfDay(new Date());
    const activityData = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = subDays(today, 6 - i);
        const nextDate = subDays(today, 5 - i);

        const [uploads, downloads] = await Promise.all([
          History.countDocuments({
            actionType: "upload",
            createdAt: {
              $gte: date,
              $lt: nextDate,
            },
          }),
          History.countDocuments({
            actionType: "download",
            createdAt: {
              $gte: date,
              $lt: nextDate,
            },
          }),
        ]);

        return {
          date: date.toLocaleDateString("fr-FR", { weekday: "short" }),
          uploads,
          downloads,
        };
      })
    );

    return NextResponse.json(activityData);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données d'activité:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données d'activité" },
      { status: 500 }
    );
  }
}
