import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { mockIdRef, question, correctAns, userAns, feedback, rating, userEmail, createdAt } = body;

    const resp = await db
      .insert(UserAnswer)
      .values({
        mockIdRef,
        question,
        correctAns,
        userAns,
        feedback,
        rating,
        userEmail,
        createdAt,
      });

    return NextResponse.json({ success: true, data: resp });
  } catch (error) {
    console.error("Error inserting user answer:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
