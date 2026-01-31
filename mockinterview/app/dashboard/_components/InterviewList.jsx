"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

import InterviewItemCard from "./InterviewItemCard";
import { Skeleton } from "@/components/ui/skeleton"


const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    const response = await fetch(`/api/interview?createdBy=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress)}`);
    const result = await response.json();

    console.log(result);
    if (result.success) {
      setInterviewList(result.data);
    }
  };
  return (
    <div>
      <h2 className="font-medium text-xl">Previous Mock Interview</h2>
  
      {interviewList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {interviewList.map((interview, index) => (
            <InterviewItemCard key={index} interview={interview} />
          ))}
        </div>
      ) : (
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      )}
    </div>
  );
};

export default InterviewList;
