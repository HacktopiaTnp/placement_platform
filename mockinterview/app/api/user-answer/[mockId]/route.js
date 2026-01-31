import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
  try {
    const { mockId } = params;
    
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, mockId))
      .orderBy(UserAnswer.id);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching user answers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
