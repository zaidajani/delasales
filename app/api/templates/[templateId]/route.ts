import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ templateId: string }> }
) {
  try {
    const { userId } = await auth();

    const { templateId } = await context.params; // ✅ FIX

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const template = user.templates.find(
      (t) => t._id.toString() === templateId
    );

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    template.name = body.name ?? template.name;
    template.subject = body.subject ?? template.subject;
    template.body = body.body ?? template.body;
    template.updatedAt = new Date();

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Template PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}