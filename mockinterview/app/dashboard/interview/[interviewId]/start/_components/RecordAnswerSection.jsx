"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { analyzeBehavioralVideo } from "@/utils/BehavioralAnalysis";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import VideoRecorder from "./VideoRecorder";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onAnswerSaved,
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleVideoSubmit = async (videoBlob, videoDuration, realtimeTranscript) => {
    try {
      setLoading(true);
      console.log("🎬 Processing video submission...");
      console.log("📹 Video duration:", videoDuration, "seconds");
      console.log("📝 Received transcript:", realtimeTranscript?.substring(0, 100));

      // Use the real-time transcript captured during recording
      let finalTranscript = realtimeTranscript || "";
      
      // Validate transcript
      if (!finalTranscript || finalTranscript.trim().length < 10) {
        console.warn("⚠️ Transcript too short or empty");
        toast.error("No speech detected. Please ensure your microphone is working and you speak clearly.");
        finalTranscript = `[${videoDuration} second video response - no speech detected. Please check microphone permissions.]`;
      } else {
        console.log("✅ Transcription successful:", finalTranscript.substring(0, 150));
        toast.success(`Transcription complete! (${finalTranscript.split(' ').length} words captured)`);
      }

      console.log("📄 Final transcript for analysis:", finalTranscript.substring(0, 200));

      // Step 2: Send TRANSCRIPT to Gemini for intelligent feedback
      toast("Analyzing your response quality...");
      
      const feedbackPrompt = `
Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}
User Answer: ${finalTranscript}
Response Duration: ${videoDuration} seconds

Based on the question and user's transcribed answer, please provide:
1. A rating from 1-10 for the answer quality
2. Detailed feedback with areas of improvement (3-5 lines)
3. Key strengths demonstrated
4. Specific recommendations

Respond in JSON format with "rating", "feedback", "strengths", and "recommendations" fields.`;

      const result = await chatSession.sendMessage(feedbackPrompt);
      let MockJsonResp = result.response.text();

      MockJsonResp = MockJsonResp.replace("```json", "").replace("```", "").trim();

      let jsonFeedbackResp;
      try {
        jsonFeedbackResp = JSON.parse(MockJsonResp);
        console.log("✅ AI Feedback:", jsonFeedbackResp);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        jsonFeedbackResp = {
          feedback: "Response recorded successfully. Continue practicing your interview skills.",
          rating: "7",
          strengths: "Completed the response",
          recommendations: "Keep practicing"
        };
      }

      // Step 3: Analyze behavioral metrics
      toast("Analyzing behavioral patterns...");
      
      const behavioralAnalysis = await analyzeBehavioralVideo(
        videoBlob,
        mockInterviewQuestion[activeQuestionIndex]?.Question,
        videoDuration,
        finalTranscript
      );
      
      const behavioralData = behavioralAnalysis.data;

      // Step 4: Convert video blob to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(videoBlob);
      reader.onloadend = async () => {
        const videoBase64 = reader.result;

        // Step 5: Save to database
        const response = await fetch("/api/user-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mockIdRef: interviewData?.mockId,
            question: mockInterviewQuestion[activeQuestionIndex]?.Question,
            correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
            userAns: finalTranscript,
            feedback: jsonFeedbackResp?.feedback,
            rating: jsonFeedbackResp?.rating,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format("YYYY-MM-DD"),
            // Video data
            videoUrl: videoBase64,
            videoDuration: videoDuration.toString(),
            bodyLanguageScore: behavioralData?.bodyLanguageScore?.toString() || "7",
            eyeContactScore: behavioralData?.eyeContactScore?.toString() || "7",
            confidenceScore: behavioralData?.confidenceScore?.toString() || "7",
            pacingScore: behavioralData?.pacingScore?.toString() || "7",
            engagementScore: behavioralData?.engagementScore?.toString() || "7",
            behavioralFeedback: behavioralData?.behavioralFeedback || "Video recorded",
            overallVideoBehaviorScore: behavioralData?.overallVideoBehaviorScore?.toString() || "7",
          }),
        });

        const apiResult = await response.json();

        if (apiResult.success) {
          toast("Answer saved successfully!");
          if (onAnswerSaved) {
            onAnswerSaved();
          }
        } else {
          toast("Failed to save answer. Please try again.");
          console.error("API Error:", apiResult.error);
        }
        setLoading(false);
      };
    } catch (error) {
      console.error("Error processing video:", error);
      toast("An error occurred while processing your video response");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-md">
        <VideoRecorder onVideoSubmit={handleVideoSubmit} isLoading={loading} />
      </div>
    </div>
  );
};

export default RecordAnswerSection;
