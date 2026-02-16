import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { DEFAULT_TEMPLATES } from "@/lib/defaultTemplates";

export async function POST(request: Request) {
  try {
    const { clerkUserId, email, name, imageUrl } = await request.json();

    if (!clerkUserId || !email) {
      return NextResponse.json(
        { error: "clerkUserId and email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ✅ upsert user
    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { clerkUserId, email, name, imageUrl },
      { new: true, upsert: true }
    );

    if (!user) throw new Error("User upsert failed");

    /* ===============================
       Seed templates if missing
    =============================== */
    if (!user.templates || user.templates.length === 0) {
      user.templates = DEFAULT_TEMPLATES;
      await user.save();
      console.log("✅ Default templates seeded");
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("NEWUSER API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create or update user" },
      { status: 500 }
    );
  }
}