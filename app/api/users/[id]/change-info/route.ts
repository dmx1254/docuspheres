import { User } from "@/app/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

connectDB();
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    const newData = Object.fromEntries(
      Object.entries(data).filter(([_, val]) => !!val)
    );

    await User.findByIdAndUpdate(id, newData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json("success", { status: 200 });

    // const data = await User.find
  } catch (error) {
    return NextResponse.json(error);
  }
}
