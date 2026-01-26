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
        { status: 400 }
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

    const audioFile = new File([audioBlob], "recording.mp3", {
      type: audioBlob.type || "audio/mpeg",
    });

    /* ---------------------------------
       2. Send audio to Lemonfox (DIARIZATION)
    --------------------------------- */
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("language", "english");
    formData.append("speaker_labels", "true");
    formData.append("response_format", "verbose_json");

    const transcriptionRes = await fetch(
      "https://api.lemonfox.ai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!transcriptionRes.ok) {
      const errText = await transcriptionRes.text();
      console.error("LEMONFOX ERROR:", errText);
      throw new Error("Lemonfox transcription failed");
    }

    const transcriptionData = await transcriptionRes.json();

    if (!transcriptionData?.segments?.length) {
      throw new Error("Diarization failed (no segments)");
    }

    /* ---------------------------------
       3. Build speaker-labeled transcript
    --------------------------------- */
    const transcript = transcriptionData.segments
      .map((seg: any) => `${seg.speaker}: ${seg.text}`)
      .join("\n");

    /* ---------------------------------
       4. Build recording object
    --------------------------------- */
    const recording = {
      title,
      audioUrl,
      dateTime,
      durationMinutes,
      participants,
      transcript,
      diarization: transcriptionData.segments, // optional but powerful
      status: "completed",
    };

    /* ---------------------------------
       5. Save recording in MongoDB
    --------------------------------- */
    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { $push: { recordings: recording } },
      { new: true }
    );

    if (!user || !user.recordings.length) {
      return NextResponse.json(
        { error: "User not found or recording save failed" },
        { status: 404 }
      );
    }

    const savedRecording = user.recordings[user.recordings.length - 1];

    return NextResponse.json(
      {
        message: "Recording added with diarized transcript",
        recording: savedRecording,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD RECORDING ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add recording" },
      { status: 500 }
    );
  }
}
