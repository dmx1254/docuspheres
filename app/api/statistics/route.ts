import { File } from "@/app/models/File";
import { Folder } from "@/app/models/Folder";
import { History } from "@/app/models/History";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/option";

connectDB();

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les statistiques globales
    const [
      totalFiles,
      totalFolders,
      totalStorage,
      fileTypes,
      userStorage,
      activeUsers,
    ] = await Promise.all([
      File.countDocuments(),
      Folder.countDocuments(),
      File.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }]),
      File.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      File.aggregate([
        { $group: { _id: "$owner._id", storage: { $sum: "$size" } } },
      ]),
      History.distinct("user._id", {
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Calculer le pourcentage d'utilisation du stockage
    const storageLimit = 175 * 1024 * 1024; // 175 MB par exemple
    const totalStorageBytes = totalStorage[0]?.total || 0;
    const storageUsagePercentage = (totalStorageBytes / storageLimit) * 100;

    // Formater les types de fichiers
    const fileTypesMap = fileTypes.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    // Formater le stockage par utilisateur
    const userStorageMap = userStorage.reduce((acc, { _id, storage }) => {
      acc[_id] = storage;
      return acc;
    }, {});

    return NextResponse.json({
      totalFiles,
      totalFolders,
      totalStorage: totalStorageBytes,
      storageLimit,
      storageUsagePercentage,
      fileTypes: fileTypesMap,
      userStorage: userStorageMap,
      activeUsers: activeUsers.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
