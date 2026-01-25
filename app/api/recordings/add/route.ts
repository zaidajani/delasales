import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import User from "../../models/user";

export async function POST(request: Request) {
  try {
    const {
      clerkUserId,
      title,
      audioUrl,
      dateTime,
      durationMinutes,
      participants,
    } = await request.json();

    if (!clerkUserId || !title || !audioUrl || !dateTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /* ---------------------------------
       1. Fetch audio from Supabase
    --------------------------------- */
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      throw new Error("Failed to fetch audio file");
    }

    const audioBlob = await audioResponse.blob();

    /* ---------------------------------
       2. Send Blob to Lemonfox
    --------------------------------- */
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.mp3");
    formData.append("language", "english");
    formData.append("response_format", "json");

    const transcriptionRes = await fetch(
      "https://api.lemonfox.ai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
        },
        body: formData,
      },
    );

    const transcriptionData = await transcriptionRes.json();

    if (!transcriptionData?.text) {
      throw new Error("Transcription failed");
    }

    /* ---------------------------------
       3. Build recording object
    --------------------------------- */
    const recording = {
      title,
      audioUrl,
      dateTime,
      durationMinutes,
      participants,
      transcript: transcriptionData.text,
      status: "completed",
    };

    /* ---------------------------------
       4. Save recording in MongoDB
    --------------------------------- */
    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { $push: { recordings: recording } },
      { new: true },
    );

    if (!user || !user.recordings.length) {
      return NextResponse.json(
        { error: "User not found or recording failed" },
        { status: 404 },
      );
    }

    // ✅ Get the ACTUAL saved recording (with _id)
    const savedRecording = user.recordings[user.recordings.length - 1];

    return NextResponse.json(
      {
        message: "Recording added and transcription saved",
        recording: savedRecording,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ADD RECORDING ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add recording" },
      { status: 500 },
    );
  }
}