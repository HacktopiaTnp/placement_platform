import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
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
        .from(MockInterview)
        .where(eq(MockInterview.mockId, mockId));
      return NextResponse.json({ success: true, data: result });
    }

    if (createdBy) {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, createdBy))
        .orderBy(desc(MockInterview.id));
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { mockId, jsonMockResp, jobPosition, jobDesc, jobExperience, createdBy, createdAt, interviewType, resumeText } = body;

    console.log("Creating interview with data:", { mockId, jobPosition, interviewType, hasResume: !!resumeText });

    const resp = await db
      .insert(MockInterview)
      .values({
        mockId,
        jsonMockResp,
        jobPosition,
        jobDesc,
        jobExperience,
        createdBy,
        createdAt,
        interviewType: interviewType || 'Technical', // Default to Technical if not provided
        resumeText: resumeText || null,
      })
      .returning({ mockId: MockInterview.mockId });

    console.log("Interview created successfully:", resp);
    return NextResponse.json({ success: true, data: resp });
  } catch (error) {
    console.error("Error inserting interview:", error);
    console.error("Error details:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
