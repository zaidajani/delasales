import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/app/api/models/user";
import { auth } from "@clerk/nextjs/server";

/* =========================================================
   GET — Load templates
========================================================= */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ templates: [] });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json({ templates: [] });
    }

    // 🔥 Normalize templates (ObjectId → string)
    const templates = user.templates.map((t: any) => ({
      _id: t._id.toString(),
      name: t.name,
      subject: t.subject,
      body: t.body,
      isDefault: t.isDefault,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({ templates });
  } catch (err) {
    console.error("Templates GET error:", err);
    return NextResponse.json({ templates: [] });
  }
}

/* =========================================================
   POST — Create new template
========================================================= */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, subject, body: html } = body || {};

    if (!name) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const newTemplate = {
      name,
      subject: subject || "",
      body: html || "<p>Start writing…</p>",
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.templates.push(newTemplate);
    await user.save();

    // 🔥 Return normalized template
    const created = user.templates[user.templates.length - 1];

    return NextResponse.json({
      template: {
        _id: created._id.toString(),
        name: created.name,
        subject: created.subject,
        body: created.body,
        isDefault: created.isDefault,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    });
  } catch (err) {
    console.error("Templates POST error:", err);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}