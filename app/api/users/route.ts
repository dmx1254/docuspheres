import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { User } from "@/app/models/User";
import { options } from "../auth/[...nextauth]/option";

connectDB();

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session || session?.user.role !== "Admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const users = await User.find().select("-password");

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session || session?.user.role !== "Admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        name
      )}`,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
