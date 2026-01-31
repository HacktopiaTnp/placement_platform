"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const page = ({ params }) => {
  const [questionData, setQuestionData] = useState();

  useEffect(() => {
    console.log(params.pyqId);
    getQuestionDetails();
  }, []);

  const getQuestionDetails = async () => {
    const response = await fetch(`/api/question?mockId=${params.pyqId}`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const questionData = JSON.parse(result.data[0].MockQuestionJsonResp);
      setQuestionData(questionData);
    }
    // console.log("data", questionData);
  };



  return (
    questionData && (
    <div className="p-10 my-5">
      <Accordion type="single" collapsible>
        {questionData &&
          questionData.map((item, index) => (
            <AccordionItem value={`item-${index + 1}`} key={index} className="mb-5"  >
              <AccordionTrigger>{item?.Question}?</AccordionTrigger>
              <AccordionContent>{item?.Answer}</AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </div>
    )
  );
};

export default page;
