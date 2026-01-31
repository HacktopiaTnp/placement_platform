import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req) {
  try {
    const { audioBase64, question, duration } = await req.json();

    if (!audioBase64) {
      return NextResponse.json(
        { success: false, error: "No audio data provided" },
        { status: 400 }
      );
    }

    console.log("========================================");
    console.log("📥 Received audio data for analysis");
    console.log("Audio size:", audioBase64.length, "bytes");
    console.log("Question:", question);
    console.log("Duration:", duration, "seconds");
    console.log("========================================");

    const prompt = `
You are an expert behavioral interview analyst. Analyze this audio recording of an interview response.

Interview Question: "${question}"
Response Duration: ${duration} seconds

IMPORTANT: Listen to the actual audio and analyze:

1. CONTENT ANALYSIS:
   - What did the candidate say?
   - How well does it answer the question?
   - Does it follow STAR method (Situation, Task, Action, Result)?
   - Specificity and clarity of examples
   - Relevance to the question

2. DELIVERY ANALYSIS (from audio):
   - Speaking pace and clarity
   - Confidence level in voice
   - Hesitations, filler words (um, uh, like)
   - Voice tone and energy
   - Professional communication

3. BEHAVIORAL INDICATORS (from audio):
   - Enthusiasm and engagement
   - Articulation and pronunciation
   - Pauses and thinking time
   - Overall presentation quality

CRITICAL: You MUST respond with ONLY valid JSON, no other text. Use this exact format:
{
  "transcription": "word-for-word transcription of what was said",
  "contentRating": 8,
  "contentFeedback": "3-5 lines about answer quality and content",
  "deliveryRating": 7,
  "deliveryFeedback": "feedback on speaking style and delivery",
  "bodyLanguageScore": 7,
  "eyeContactScore": 7,
  "confidenceScore": 8,
  "pacingScore": 7,
  "engagementScore": 8,
  "overallScore": 8,
  "behavioralFeedback": "comprehensive behavioral feedback",
  "strengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2"],
  "recommendedActions": "specific actions to improve"
}
`;

    console.log("🎤 Sending audio to Gemini for comprehensive analysis...");

    // Try Gemini 1.5 Flash first (faster and more stable)
    let result;
    let modelUsed = '';
    
    try {
      const model15Flash = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      result = await model15Flash.generateContent([
        {
          inlineData: {
            mimeType: "video/webm",
            data: audioBase64,
          },
        },
        prompt,
      ]);
      modelUsed = "gemini-1.5-flash";
      console.log("✅ Used gemini-1.5-flash model");
    } catch (flashError) {
      console.log("⚠️ gemini-1.5-flash failed:", flashError.message);
      console.log("Trying gemini-1.5-pro...");
      
      // Fallback to 1.5 Pro
      try {
        const model15Pro = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
        });
        result = await model15Pro.generateContent([
          {
            inlineData: {
              mimeType: "video/webm",
              data: audioBase64,
            },
          },
          prompt,
        ]);
        modelUsed = "gemini-1.5-pro";
        console.log("✅ Used gemini-1.5-pro model");
      } catch (proError) {
        console.error("❌ Both models failed");
        console.error("Flash error:", flashError.message);
        console.error("Pro error:", proError.message);
        
        // Return fallback response instead of throwing
        return NextResponse.json({
          success: false,
          error: "Audio analysis models temporarily unavailable",
          fallback: true,
          details: `Flash: ${flashError.message}, Pro: ${proError.message}`
        }, { status: 200 }); // Return 200 for graceful fallback
      }
    }

    const response = await result.response;
    const analysisText = response.text();

    console.log("✅ Analysis successful!");
    console.log("Response preview:", analysisText.substring(0, 300));

    // Parse JSON response
    let analysis;
    try {
      const cleanedText = analysisText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      
      // Try to extract JSON if there's extra text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;
      
      analysis = JSON.parse(jsonString);
      console.log("✅ JSON parsed successfully");
      console.log("Transcription preview:", analysis.transcription?.substring(0, 100));
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.error("Response was:", analysisText.substring(0, 500));
      
      // Return a structured error response that can be used as fallback
      return NextResponse.json({
        success: false,
        error: "Failed to parse AI response",
        fallback: true,
        rawResponse: analysisText.substring(0, 500),
      }, { status: 200 }); // Return 200 so client can handle gracefully
    }

    console.log("========================================");

    return NextResponse.json({
      success: true,
      analysis: analysis,
    });
  } catch (error) {
    console.error("❌ Audio analysis error:", error);
    console.error("Error details:", error.message);
    
    // Check for specific error types
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { success: false, error: "Invalid API key configuration" },
        { status: 401 }
      );
    }
    
    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { success: false, error: "API quota exceeded" },
        { status: 429 }
      );
    }

    if (error.message?.includes("model")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Audio model not available. Using fallback analysis.",
          fallback: true 
        },
        { status: 200 } // Changed to 200 for graceful fallback
      );
    }

    // Return fallback for any other errors
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Transcription failed",
        details: error.toString(),
        fallback: true // Allow graceful fallback
      },
      { status: 200 } // Changed to 200 for graceful fallback
    );
  }
}
