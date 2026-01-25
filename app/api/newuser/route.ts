import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/db";
import User from "../models/user";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { clerkUserId, email, name, imageUrl } = body;

    // Validate required fields
    if (!clerkUserId || !email) {
      return NextResponse.json(
        { error: "clerkUserId and email are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Create or update user (upsert)
    const user = await User.findOneAndUpdate(
      { clerkUserId },
      {
        clerkUserId,
        email,
        name,
        imageUrl,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // Success response
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    // Log the REAL error so we can debug
    console.error("NEWUSER API ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create or update user" },
      { status: 500 }
    );
  }
}
