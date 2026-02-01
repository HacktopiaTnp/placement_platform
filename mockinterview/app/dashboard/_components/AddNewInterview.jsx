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
      console.log("API Response:", data);
      
      if (data.success) {
        setResumeText(data.text);
        console.log("Resume parsed successfully");
        toast.success("Resume uploaded and parsed successfully!", { id: "resume-upload" });
      } else {
        console.error("Parse failed:", data.error);
        toast.error(data.error || "Failed to parse resume", { id: "resume-upload" });
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
      toast.error("Error uploading resume: " + error.message, { id: "resume-upload" });
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
        className="group relative p-10 rounded-xl border-2 border-dashed border-border/50 bg-gradient-to-br from-background to-accent/30 hover:scale-105 hover:shadow-xl transition-all cursor-pointer overflow-hidden animate-scale-in"
        onClick={() => setOpenDialog(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            +
          </div>
          <h2 className="text-lg font-semibold gradient-text">Add New Interview</h2>
          <p className="text-sm text-muted-foreground">Create a new mock interview</p>
        </div>
      </div>
      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass border-2 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold gradient-text">
              Tell us more about your job interviewing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div className="my-3">
                  <h2 className="text-base text-muted-foreground">
                    Add Details about your job position, job description and
                    years of experience
                  </h2>

                  {/* Interview Type Selection */}
                  <div className="mt-7 my-5">
                    <label className="text-foreground font-semibold block mb-3">
                      Interview Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setInterviewType("technical")}
                        className={`group p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                          interviewType === "technical"
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg"
                            : "border-border bg-card hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            interviewType === "technical" ? "bg-blue-500" : "bg-muted"
                          }`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          </div>
                          <p className="font-semibold">Technical</p>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          Questions on skills & tech stack
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInterviewType("behavioral")}
                        className={`group p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex flex-col items-start ${
                          interviewType === "behavioral"
                            ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-lg"
                            : "border-border bg-card hover:border-purple-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            interviewType === "behavioral" ? "bg-purple-500" : "bg-muted"
                          }`}>
                            <Video className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-semibold">Behavioral</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          One-on-one with video analysis
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="mt-7 my-3">
                    <label className="text-foreground font-medium block mb-2">Job Role/Job Position</label>
                    <Input
                      className="mt-1 bg-input-background border-border focus:border-blue-500 transition-colors"
                      placeholder="Ex. Full Stack Developer"
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-foreground font-medium block mb-2">
                      Job Description/ Tech Stack (In Short)
                    </label>
                    <Textarea
                      className="bg-input-background border-border focus:border-blue-500 transition-colors placeholder-opacity-50"
                      placeholder="Ex. React, Angular, Node.js, MySQL, NoSQL, Python"
                      required
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-foreground font-medium block mb-2">Years of Experience</label>
                    <Input
                      className="mt-1 bg-input-background border-border focus:border-blue-500 transition-colors"
                      placeholder="Ex. 5"
                      max="50"
                      type="number"
                      required
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>

                  <div className="my-5">
                    <label className="text-foreground font-medium block mb-2">
                      📄 Upload Resume (Optional - PDF only)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-blue-400 hover:bg-accent/30 transition-all bg-card/50">
                      <Input
                        type="file"
                        accept=".pdf"
                        className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white file:font-medium hover:file:from-blue-600 hover:file:to-purple-700 file:transition-all"
                        onChange={handleResumeUpload}
                        id="resume-upload"
                      />
                      {resumeFile && (
                        <div className="mt-3 text-sm flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-3 rounded-lg border border-green-200 dark:border-green-800 animate-scale-in">
                          <FileText className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <span className="font-medium text-green-700 dark:text-green-400">{resumeFile.name}</span>
                            <span className="text-xs text-green-600 dark:text-green-500 ml-2">({(resumeFile.size / 1024).toFixed(0)} KB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Upload your resume to get personalized questions based on your experience
                    </p>
                  </div>

                  {interviewType === "behavioral" && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800 rounded-xl text-sm animate-scale-in">
                      <p className="text-purple-900 dark:text-purple-100">
                        <strong>💡 Tip:</strong> Behavioral interviews assess soft
                        skills with video analysis. You&apos;ll be asked situational
                        questions where we analyze your communication, confidence,
                        and body language.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-end mt-6 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-6 hover:bg-accent/50 transition-all"
                    onClick={() => {
                      setOpenDialog(false);
                      setInterviewType("technical");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" />
                        Generating From AI
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start Interview
                      </>
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
