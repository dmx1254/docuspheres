import { User } from "@/app/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

connectDB();
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { newPassword } = await req.json();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json("success", {
      status: 200,
    });

    // const data = await User.find
  } catch (error) {
    return NextResponse.json(error);
  }
}
