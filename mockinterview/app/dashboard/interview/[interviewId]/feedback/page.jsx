"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, Video, TrendingUp, Award } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const BehaviorScoreBar = ({ score, label }) => {
  const numScore = parseInt(score) || 0;
  const percentage = (numScore / 10) * 100;
  const getColor = (s) => {
    if (s >= 8) return "bg-green-500";
    if (s >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{score}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getColor(numScore)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const VideoAnalysisCard = ({ answer }) => {
  const [showVideo, setShowVideo] = useState(false);

  if (!answer.videoUrl) {
    return null;
  }

  const videoScore =
    (parseInt(answer.bodyLanguageScore || 0) +
      parseInt(answer.eyeContactScore || 0) +
      parseInt(answer.confidenceScore || 0) +
      parseInt(answer.pacingScore || 0) +
      parseInt(answer.engagementScore || 0)) /
    5;

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg text-purple-900">
          Behavioral Analysis
        </h3>
      </div>

      {/* Video Player */}
      <div className="mb-4">
        <button
          onClick={() => setShowVideo(!showVideo)}
          className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
        >
          {showVideo ? "Hide Video" : "Watch Your Response"}
        </button>
        {showVideo && (
          <div className="mt-3 bg-black rounded-lg overflow-hidden">
            <video
              src={answer.videoUrl}
              controls
              className="w-full aspect-video"
            />
            {answer.videoDuration && (
              <p className="text-xs text-gray-400 p-2">
                Duration: {answer.videoDuration} seconds
              </p>
            )}
          </div>
        )}
      </div>

      {/* Behavioral Scores */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-3">
            Behavioral Metrics
          </h4>
          <BehaviorScoreBar
            score={answer.bodyLanguageScore || "7"}
            label="Body Language"
          />
          <BehaviorScoreBar
            score={answer.eyeContactScore || "7"}
            label="Eye Contact"
          />
          <BehaviorScoreBar
            score={answer.confidenceScore || "7"}
            label="Confidence"
          />
          <BehaviorScoreBar
            score={answer.pacingScore || "7"}
            label="Speaking Pace"
          />
          <BehaviorScoreBar
            score={answer.engagementScore || "7"}
            label="Engagement"
          />
        </div>

        {/* Overall Video Score */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              Overall Behavioral Score
            </span>
            <span className="text-2xl font-bold text-purple-600">
              {videoScore.toFixed(1)}/10
            </span>
          </div>
        </div>

        {/* Behavioral Feedback */}
        {answer.behavioralFeedback && (
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700">
              <strong>Feedback:</strong> {answer.behavioralFeedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Feedback = ({ params }) => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    const response = await fetch(`/api/user-answer/${params.interviewId}`);
    const result = await response.json();

    console.log(result);
    if (result.success) {
      setFeedbackList(result.data);
    }
  };

  const overallRating = useMemo(() => {
    if (feedbackList && feedbackList.length > 0) {
      const totalRating = feedbackList.reduce(
        (sum, item) => sum + Number(item.rating),
        0
      );
      return (totalRating / feedbackList.length).toFixed(1);
    }
    return 0;
  }, [feedbackList]);

  const overallBehavioralScore = useMemo(() => {
    if (feedbackList && feedbackList.length > 0) {
      const totalScore = feedbackList.reduce((sum, item) => {
        const score =
          (parseInt(item.bodyLanguageScore || 0) +
            parseInt(item.eyeContactScore || 0) +
            parseInt(item.confidenceScore || 0) +
            parseInt(item.pacingScore || 0) +
            parseInt(item.engagementScore || 0)) /
          5;
        return sum + score;
      }, 0);
      return (totalScore / feedbackList.length).toFixed(1);
    }
    return 0;
  }, [feedbackList]);

  const hasVideoAnalysis = feedbackList.some((item) => item.videoUrl);

  return (
    <div className="p-10">
      {feedbackList?.length == 0 ? (
        <h2 className="font-bold text-xl text-gray-500 my-5">
          No Interview feedback Record Found
        </h2>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-green-500">Congratulations</h2>
          <h2 className="font-bold text-2xl">Here is your interview feedback</h2>

          {/* Overall Scores Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {/* Content Score */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Content Rating</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {overallRating}
                  </p>
                  <p className="text-xs text-gray-500">/10</p>
                </div>
                <Award className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Based on your answer quality and relevance
              </p>
            </div>

            {/* Behavioral Score */}
            {hasVideoAnalysis && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Behavioral Score</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {overallBehavioralScore}
                    </p>
                    <p className="text-xs text-gray-500">/10</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-500 opacity-50" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Based on body language, eye contact, confidence & more
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          {hasVideoAnalysis && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedTab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Feedback
              </button>
              <button
                onClick={() => setSelectedTab("behavioral")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedTab === "behavioral"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Behavioral Analysis Only
              </button>
            </div>
          )}

          <h2 className="text-sm text-gray-500 my-4">
            Find below interview question with correct answer, your answer,
            behavioral analysis and feedback for improvement
          </h2>

          {feedbackList &&
            feedbackList.map((item, index) => (
              <Collapsible key={index} className="mt-7">
                <CollapsibleTrigger className="p-2 bg-secondary rounded-lg my-2 text-left flex justify-between gap-7 w-full hover:bg-gray-200">
                  <span className="flex-1">{item.question}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2 mt-3">
                    {/* Text-based Rating */}
                    <h2 className="text-red-500 p-2 border rounded-lg font-semibold">
                      <strong>Rating: </strong>
                      <span className="text-lg">{item.rating}/10</span>
                    </h2>

                    {/* User Answer */}
                    <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-red-900">
                      <strong>Your Answer: </strong>
                      <p className="mt-1">{item.userAns}</p>
                    </h2>

                    {/* Correct Answer */}
                    <h2 className="p-2 border rounded-lg bg-green-50 text-sm text-green-900">
                      <strong>Expected Answer: </strong>
                      <p className="mt-1">{item.correctAns}</p>
                    </h2>

                    {/* Text Feedback */}
                    <h2 className="p-2 border rounded-lg bg-blue-50 text-sm text-blue-900">
                      <strong>Content Feedback: </strong>
                      <p className="mt-1">{item.feedback}</p>
                    </h2>

                    {/* Video Analysis */}
                    {item.videoUrl && (
                      <VideoAnalysisCard answer={item} />
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      )}

      <Button onClick={() => router.replace("/dashboard")} className="mt-8">
        Go Home
      </Button>
    </div>
  );
};

export default Feedback;
