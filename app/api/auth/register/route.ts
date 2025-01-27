import { connectDB } from "@/lib/mongodb";
import { User } from "@/app/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

connectDB();

export async function POST(req: Request) {
  console.log("Début de la requête d'inscription");

  try {
    // Vérifier que le body est bien un JSON valide

    const body = await req.json();
    try {
      console.log("Body reçu:", body);
    } catch (e) {
      console.error("Erreur de parsing JSON:", e);
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Validation des champs
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      console.log("Validation échouée - champs manquants");
      return NextResponse.json(
        {
          error: "Tous les champs sont requis",
          details: {
            name: !name?.trim() ? "Le nom est requis" : null,
            email: !email?.trim() ? "L'email est requis" : null,
            password: !password?.trim() ? "Le mot de passe est requis" : null,
          },
        },
        { status: 400 }
      );
    }

    console.log("Tentative de connexion à MongoDB");
    console.log("Connexion MongoDB réussie");

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("Email déjà utilisé:", email);
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    console.log("Création de l'utilisateur");
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "Viewer",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        name
      )}`,
    });

    console.log("Utilisateur créé avec succès");

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur détaillée lors de l'inscription:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: Object.fromEntries(
            Object.entries(error.errors).map(([key, value]) => [
              key,
              value.message,
            ])
          ),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur lors de l'inscription",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
