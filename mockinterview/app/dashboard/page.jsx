import { UserButton } from "@clerk/nextjs";
import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="p-6 md:p-10 animate-fade-in">
        <div className="mb-8">
          <h2 className="font-bold text-4xl mb-2 gradient-text">Dashboard</h2>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Create and start your AI Mock Interview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8" >
          <AddNewInterview/>
        </div>

        <InterviewList/>
      </div>
    </div>
  );
};

export default Dashboard;
