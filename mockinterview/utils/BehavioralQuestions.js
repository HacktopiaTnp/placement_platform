import { chatSession } from "@/utils/GeminiAIModal";

/**
 * Generate behavioral/situational interview questions based on job details
 * These are designed for video-based interviews
 */
export const generateBehavioralQuestions = async (
  jobPosition,
  jobDescription,
  jobExperience,
  numberOfQuestions = 5
) => {
  try {
    const prompt = `Generate ${numberOfQuestions} behavioral and situational interview questions for the following position. These questions should be suitable for a one-on-one video interview format and require 1-3 minute answers.

Job Position: ${jobPosition}
Job Description: ${jobDescription}
Required Experience: ${jobExperience}

Guidelines for questions:
1. Use STAR method compatible questions (Situation, Task, Action, Result)
2. Focus on real-world scenarios and challenges
3. Questions should assess: communication, problem-solving, teamwork, leadership, adaptability
4. Include behavioral patterns that can be observed in video
5. Questions should take 1-3 minutes to answer properly
6. Include both technical and soft skills assessment

Please provide exactly ${numberOfQuestions} questions in the following JSON format:
{
  "questions": [
    {
      "question": "<actual question text>",
      "category": "<Communication|Leadership|Problem-Solving|Teamwork|Adaptability|Technical>",
      "difficulty": "<easy|medium|hard>",
      "expectedAnswerPoints": ["<point1>", "<point2>", "<point3>"],
      "evaluationCriteria": "<what to look for in answer>",
      "sampleAnswer": "<brief sample of good answer>"
    }
  ],
  "description": "One-on-One Behavioral Interview"
}`;

    const result = await chatSession.sendMessage(prompt);
    let responseText = result.response.text();

    // Clean JSON
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    const jsonResponse = JSON.parse(responseText);

    return {
      success: true,
      data: jsonResponse.questions.map((q) => ({
        Question: q.question,
        Answer: q.evaluationCriteria,
        Category: q.category,
        Difficulty: q.difficulty,
        ExpectedPoints: q.expectedAnswerPoints,
        SampleAnswer: q.sampleAnswer,
      })),
    };
  } catch (error) {
    console.error("Error generating behavioral questions:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Behavioral question templates for quick selection
 */
export const behavioralQuestionTemplates = {
  Communication: [
    "Tell me about a time when you had to explain a complex concept to a non-technical person. How did you ensure they understood?",
    "Describe a situation where you had to communicate bad news to your team or manager. How did you handle it?",
    "Give an example of when you had to present your ideas in front of a large group. How did you prepare?",
    "Tell me about a time when you had to give constructive feedback to a colleague. How did you approach it?",
  ],
  Leadership: [
    "Tell me about a time when you had to lead a project or initiative. What challenges did you face and how did you overcome them?",
    "Describe a situation where you had to motivate a demotivated team member. What approach did you take?",
    "Give an example of when you had to make a difficult decision that affected your team. How did you decide?",
    "Tell me about a time when you had to take ownership of a failing project. How did you turn it around?",
  ],
  ProblemSolving: [
    "Tell me about a challenging problem you solved at work. Walk me through your approach.",
    "Describe a time when you had to debug or fix a critical issue. What was your methodology?",
    "Give an example of when your initial solution didn't work. How did you adapt?",
    "Tell me about a time when you had to learn something new quickly to solve a problem.",
  ],
  Teamwork: [
    "Describe a time when you had to work with a difficult team member. How did you handle it?",
    "Tell me about a successful project where you collaborated with people from different departments.",
    "Give an example of when you had to compromise on your idea for the team's benefit.",
    "Describe a time when a team member didn't pull their weight. How did you address it?",
  ],
  Adaptability: [
    "Tell me about a time when priorities changed suddenly. How did you adapt?",
    "Describe a situation where you had to work outside your comfort zone. What did you learn?",
    "Give an example of when you had to pivot your strategy due to unforeseen circumstances.",
    "Tell me about a time when you failed at something. How did you recover?",
  ],
  Conflict: [
    "Describe a conflict you had with a colleague or manager. How did you resolve it?",
    "Tell me about a time when you disagreed with a decision made by your manager. How did you handle it?",
    "Give an example of when you had to mediate between two conflicting parties.",
    "Describe a situation where you had to stand up for something you believed in at work.",
  ],
};

/**
 * Get sample behavioral questions for different job levels
 */
export const getSampleBehavioralQuestions = (level = "mid") => {
  const baseQuestions = [
    {
      Question: "Tell me about a time when you had to solve a problem without having all the information. How did you approach it?",
      Answer: "Look for: resourcefulness, critical thinking, decision-making under uncertainty, communication",
      Category: "Problem-Solving",
    },
    {
      Question: "Describe a situation where you had to work with someone you found difficult. How did you handle it?",
      Answer: "Look for: emotional intelligence, communication skills, conflict resolution, collaboration",
      Category: "Teamwork",
    },
    {
      Question: "Tell me about a time when you failed. What did you learn from it?",
      Answer: "Look for: growth mindset, self-awareness, resilience, accountability",
      Category: "Adaptability",
    },
    {
      Question: "Give an example of when you took initiative beyond your job description. What was the outcome?",
      Answer: "Look for: proactivity, ownership, impact thinking, motivation",
      Category: "Leadership",
    },
    {
      Question: "Describe a time when you had to deliver results under tight deadlines. How did you manage it?",
      Answer: "Look for: time management, prioritization, stress management, focus",
      Category: "Problem-Solving",
    },
  ];

  if (level === "junior") {
    return baseQuestions.slice(0, 3);
  } else if (level === "senior") {
    return [
      ...baseQuestions,
      {
        Question: "Tell me about your biggest career achievement. What made you proud about it?",
        Answer: "Look for: impact, vision, strategic thinking, leadership impact",
        Category: "Leadership",
      },
      {
        Question: "Describe how you've helped develop junior team members.",
        Answer: "Look for: mentoring ability, investment in others, leadership maturity",
        Category: "Leadership",
      },
    ];
  }

  return baseQuestions;
};

/**
 * Get evaluation rubric for behavioral answers
 */
export const getBehavioralRubric = () => {
  return {
    "STAR Method Completion": {
      Excellent: "Clear Situation, Task, Action, and Result",
      Good: "Has most STAR elements",
      Fair: "Missing 1-2 STAR elements",
      Poor: "Lacks multiple STAR elements",
    },
    "Communication Clarity": {
      Excellent: "Crystal clear, well-organized narrative",
      Good: "Clear and mostly organized",
      Fair: "Somewhat unclear, needs focus",
      Poor: "Disorganized or hard to follow",
    },
    "Relevance to Role": {
      Excellent: "Directly applicable to the position",
      Good: "Mostly relevant",
      Fair: "Somewhat relevant",
      Poor: "Not relevant to the role",
    },
    "Problem-Solving Approach": {
      Excellent: "Logical, innovative, well-thought approach",
      Good: "Logical approach with minor gaps",
      Fair: "Basic approach with some gaps",
      Poor: "No clear approach",
    },
    "Ownership & Accountability": {
      Excellent: "Takes clear ownership of actions and results",
      Good: "Generally takes ownership",
      Fair: "Some ownership shown",
      Poor: "Blames others or lacks accountability",
    },
    "Business Impact": {
      Excellent: "Clear positive business impact",
      Good: "Demonstrates positive impact",
      Fair: "Minor impact mentioned",
      Poor: "No clear impact",
    },
  };
};

/**
 * Generate assessment summary from behavioral answers
 */
export const generateBehavioralAssessment = (answers, questionCategories) => {
  const categoryScores = {};
  const overallScore = answers.reduce((acc, curr) => {
    const score = parseInt(curr.rating) || 5;
    const category = questionCategories[answers.indexOf(curr)];
    if (category) {
      categoryScores[category] = (categoryScores[category] || 0) + score;
    }
    return acc + score;
  }, 0);

  return {
    overallScore: (overallScore / answers.length).toFixed(1),
    categoryScores: Object.keys(categoryScores).reduce((acc, key) => {
      acc[key] = (categoryScores[key] / Math.floor(answers.length / Object.keys(categoryScores).length)).toFixed(1);
      return acc;
    }, {}),
    assessment: generateAssessmentNarrative(overallScore / answers.length),
  };
};

/**
 * Generate narrative assessment
 */
const generateAssessmentNarrative = (score) => {
  if (score >= 9) {
    return "Exceptional behavioral fit. Demonstrates excellent problem-solving, communication, and leadership qualities.";
  } else if (score >= 7) {
    return "Strong behavioral fit. Shows good competency in most areas with some room for development.";
  } else if (score >= 5) {
    return "Adequate behavioral fit. Meets baseline expectations but has areas needing improvement.";
  } else {
    return "Development needed. Would benefit from strengthening behavioral competencies before role.";
  }
};
