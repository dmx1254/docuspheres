// app/api/login-history/chart/route.ts
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/option";
import { LoginHistory } from "@/app/models/LoginHistory";
import { DayData, LocationEntry } from "@/lib/utils";

connectDB();



export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Données des tentatives de connexion avec pays par défaut
    const loginAttempts = await LoginHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $addFields: {
          country: {
            $cond: [
              { $eq: [{ $ifNull: ["$country", null] }, null] },
              "Sénégal",
              "$country",
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            success: "$success",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          successful: {
            $sum: {
              $cond: [{ $eq: ["$_id.success", true] }, "$count", 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ["$_id.success", false] }, "$count", 0],
            },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          successful: 1,
          failed: 1,
          total: { $add: ["$successful", "$failed"] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Statistiques des navigateurs
    const browserStats = await LoginHistory.aggregate([
      {
        $match: {
          success: true,
          browser: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$browser",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          browser: "$_id",
          value: 1,
          _id: 0,
        },
      },
      { $sort: { value: -1 } },
      { $limit: 5 },
    ]);

    // Données de localisation avec Sénégal par défaut
    const locationData = await LoginHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $addFields: {
          country: {
            $cond: [
              { $eq: [{ $ifNull: ["$country", null] }, null] },
              "Sénégal",
              "$country",
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            country: "$country",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          locations: {
            $push: {
              country: "$_id.country",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calcul des métriques de sécurité avec pays par défaut
    const totalLogins = await LoginHistory.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const successfulLogins = await LoginHistory.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      success: true,
    });

    const uniqueLocations = await LoginHistory.distinct("country", {
      createdAt: { $gte: sevenDaysAgo },
    }).then((locations) => locations.map((loc) => loc || "Sénégal"));

    const uniqueDevices = await LoginHistory.distinct("device", {
      createdAt: { $gte: sevenDaysAgo },
      success: true,
    });

    // Transformer les données de localisation en format empilé
    const locationsSet = new Set<string>();
    locationData.forEach((day) => {
      day.locations.forEach((location: LocationEntry) => {
        locationsSet.add(location.country);
      });
    });
    const locations = Array.from(locationsSet);
    const formattedLocationData = locationData.map((day: DayData) => {
      const total = day.locations.reduce(
        (sum, loc: LocationEntry) => sum + loc.count,
        0
      );
      return {
        date: day._id,
        ...Object.fromEntries(
          locations.map((country) => {
            const location = day.locations.find((l) => l.country === country);
            return [country, location ? location.count / total : 0];
          })
        ),
      };
    });

    return NextResponse.json({
      loginAttempts,
      browserStats,
      locationData: formattedLocationData,
      locations,
      successRate: (successfulLogins / totalLogins) * 100,
      locationDiversity: Math.min((uniqueLocations.length / 10) * 100, 100),
      verifiedDevices: Math.min((uniqueDevices.length / 5) * 100, 100),
      securityScore: 85,
      twoFactorUsage: 70,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de connexion:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
