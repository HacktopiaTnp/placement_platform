import { db } from "@/utils/db";
import { Question } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get('createdBy');
    const mockId = searchParams.get('mockId');

    if (mockId) {
      const result = await db
        .select()
        .from(Question)
        .where(eq(Question.mockId, mockId));
      return NextResponse.json({ success: true, data: result });
    }

    if (createdBy) {
      const result = await db
        .select()
        .from(Question)
        .where(eq(Question.createdBy, createdBy))
        .orderBy(desc(Question.id));
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { mockId, MockQuestionJsonResp, jobPosition, jobDesc, jobExperience, typeQuestion, company, createdBy, createdAt } = body;

    const resp = await db
      .insert(Question)
      .values({
        mockId,
        MockQuestionJsonResp,
        jobPosition,
        jobDesc,
        jobExperience,
        typeQuestion,
        company,
        createdBy,
        createdAt,
      })
      .returning({ mockId: Question.mockId });

    return NextResponse.json({ success: true, data: resp });
  } catch (error) {
    console.error("Error inserting question:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
