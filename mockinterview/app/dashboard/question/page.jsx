import { UserButton } from "@clerk/nextjs";
import React from "react";
import AddQuestions from "../_components/AddQuestions";
import QuestionList from "../_components/QuestionList";

const Questions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="p-6 md:p-10 animate-fade-in">
        <div className="mb-8">
          <h2 className="font-bold text-4xl mb-2 gradient-text">Master Your Interviews</h2>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Comprehensive Question Preparation with AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
          <AddQuestions/>
        </div>

        <QuestionList/>
      </div>
    </div>
  );
};

export default Questions;