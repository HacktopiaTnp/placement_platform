"use client";
import React, { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { generateBehavioralQuestions } from "@/utils/BehavioralQuestions";
import { LoaderCircle, Video, FileText, Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

const AddNewInterview = () => {
  const [openDailog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const [interviewType, setInterviewType] = useState("technical"); // 'technical' or 'behavioral'
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const { user } = useUser();
  const router = useRouter();

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File size should be less than 5MB");
      return;
    }

    setResumeFile(file);
    toast.loading("Parsing resume...", { id: "resume-upload" });

    // Extract text from PDF
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResumeText(data.text);
        console.log("Resume parsed successfully");
        toast.success("Resume uploaded and parsed successfully!", { id: "resume-upload" });
      } else {
        toast.error("Failed to parse resume", { id: "resume-upload" });
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
      toast.error("Error uploading resume", { id: "resume-upload" });
    }
  };

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDesc, jobExperience, interviewType);

    let MockJsonResp;

    if (interviewType === "behavioral") {
      // Generate behavioral interview questions
      const result = await generateBehavioralQuestions(
        jobPosition,
        jobDesc,
        jobExperience,
        5
      );

      if (result.success) {
        const formattedQuestions = {
          questions: result.data.map((q) => ({
            Question: q.Question,
            Answer: q.Answer,
            Category: q.Category,
            Difficulty: q.Difficulty,
          })),
        };
        MockJsonResp = JSON.stringify(formattedQuestions.questions);
      } else {
        console.error("Error generating behavioral questions");
        setLoading(false);
        return;
      }
    } else {
      // Generate technical interview questions (original logic)
      const InputPrompt = `
  Job Positions: ${jobPosition}, 
  Job Description: ${jobDesc}, 
  Years of Experience: ${jobExperience}.
  ${resumeText ? `Resume Summary: ${resumeText.substring(0, 2000)}` : ''}
  Based on this information${resumeText ? ' and the candidate\'s resume' : ''}, please provide 5 technical interview questions with answers in JSON format, ensuring "Question" and "Answer" are fields in the JSON.
`;

      const result = await chatSession.sendMessage(InputPrompt);
      console.log(result);
      MockJsonResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "")
        .trim();
    }

    console.log("Raw AI response:", MockJsonResp);
    
    // Clean up the response more thoroughly
    let cleanedResponse = MockJsonResp;
    
    // Remove any markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json/g, '').replace(/```/g, '');
    
    // Try to extract JSON if there's extra text
    const jsonMatch = cleanedResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    cleanedResponse = cleanedResponse.trim();
    
    console.log("Cleaned response:", cleanedResponse);
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedResponse);
      console.log("Parsed JSON:", parsedJson);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed to parse:", cleanedResponse.substring(0, 500));
      setLoading(false);
      toast.error("Failed to generate questions. Please try again.");
      return;
    }
    
    setJsonResponse(cleanedResponse);

    if (cleanedResponse) {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mockId: uuidv4(),
          jsonMockResp: cleanedResponse,
          jobPosition: jobPosition,
          jobDesc: jobDesc,
          jobExperience: jobExperience,
          interviewType: interviewType,
          resumeText: resumeText,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DD"),
        }),
      });

      const result = await response.json();
      console.log("Inserted ID:", result);

      if (result.success) {
        setOpenDialog(false);
        router.push("/dashboard/interview/" + result.data[0]?.mockId);
      }
    } else {
      console.log("ERROR");
    }
    setLoading(false);
  };

  return (
    <div>
      <div
        className="p-10 rounded-lg border bg-secondary hover:scale-105 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className=" text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job interviewing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div className="my-3">
                  <h2>
                    Add Details about your job position, job description and
                    years of experience
                  </h2>

                  {/* Interview Type Selection */}
                  <div className="mt-7 my-5">
                    <label className="text-black font-semibold block mb-3">
                      Interview Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setInterviewType("technical")}
                        className={`p-4 rounded-lg border-2 transition ${
                          interviewType === "technical"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <p className="font-semibold text-sm">Technical</p>
                        <p className="text-xs text-gray-600">
                          Questions on skills & tech stack
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInterviewType("behavioral")}
                        className={`p-4 rounded-lg border-2 transition flex flex-col items-start ${
                          interviewType === "behavioral"
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <p className="font-semibold text-sm">Behavioral</p>
                        </div>
                        <p className="text-xs text-gray-600">
                          One-on-one with video analysis
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="mt-7 my-3">
                    <label className="text-black">Job Role/job Position</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. Full stack Developer"
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-black">
                      Job Description/ Tech stack (In Short)
                    </label>
                    <Textarea
                      className="placeholder-opacity-50"
                      placeholder="Ex. React, Angular, Nodejs, Mysql, Nosql, Python"
                      required
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-black">Years of Experience</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. 5"
                      max="50"
                      type="number"
                      required
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>

                  <div className="my-5">
                    <label className="text-black block mb-2 font-medium">
                      📄 Upload Resume (Optional - PDF only)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition">
                      <Input
                        type="file"
                        accept=".pdf"
                        className="cursor-pointer"
                        onChange={handleResumeUpload}
                        id="resume-upload"
                      />
                      {resumeFile && (
                        <div className="mt-2 text-sm text-green-600 flex items-center gap-2 bg-green-50 p-2 rounded">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{resumeFile.name}</span>
                          <span className="text-xs">({(resumeFile.size / 1024).toFixed(0)} KB)</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Upload your resume to get personalized questions based on your experience
                    </p>
                  </div>

                  {interviewType === "behavioral" && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                      <p className="text-purple-900">
                        <strong>💡 Tip:</strong> Behavioral interviews assess soft
                        skills with video analysis. You&apos;ll be asked situational
                        questions where we analyze your communication, confidence,
                        and body language.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenDialog(false);
                      setInterviewType("technical");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Generating From AI
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
