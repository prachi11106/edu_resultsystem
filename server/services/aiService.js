/**
 * AI Performance Analysis Service
 * Supports modular API connection via process.env.AI_API_KEY,
 * with a rule-based fallback engine for offline/demo operation.
 */

export const generateAIAnalysis = async ({ studentName, percentage, subjects = [], grade, resultStatus }) => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      // If AI_API_KEY is available, we call an external LLM API (e.g. OpenAI / Gemini)
      // Here we implement an HTTP request structure to the API
      const prompt = `Analyze academic performance for student "${studentName}" with overall score ${percentage}% (Grade: ${grade}, Status: ${resultStatus}).
Subject Breakdown:
${subjects.map((s) => `- ${s.subjectName}: ${s.obtainedMarks}/${s.maximumMarks} (${s.percentage}%)`).join('\n')}

Provide JSON output with key fields:
"overallRemark": String,
"strengths": Array of Strings,
"weaknesses": Array of Strings,
"aiSuggestions": Array of Strings.`;

      // Example fetch call if API key provided (OpenAI example endpoint fallback)
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices[0]?.message?.content;
        try {
          const parsed = JSON.parse(content);
          return {
            overallRemark: parsed.overallRemark,
            strengths: parsed.strengths,
            weaknesses: parsed.weaknesses,
            aiSuggestions: parsed.aiSuggestions,
            source: 'API_LLM',
          };
        } catch {
          // If response isn't raw JSON, parse standard text
        }
      }
    } catch (err) {
      console.warn('[AI Service] API key provided but fetch failed. Falling back to Rule Engine:', err.message);
    }
  }

  // Smart Rule-Based Engine (Fallback & Default Demo Mode)
  return generateRuleBasedAnalysis({ studentName, percentage, subjects, grade, resultStatus });
};

export const generateRuleBasedAnalysis = ({ studentName, percentage, subjects = [], grade, resultStatus }) => {
  const name = studentName || 'the student';
  const strengths = [];
  const weaknesses = [];
  const aiSuggestions = [];

  // Sort subjects by percentage
  const sortedSubjects = [...subjects].sort((a, b) => b.percentage - a.percentage);
  const topSubjects = sortedSubjects.filter((s) => s.percentage >= 75);
  const weakSubjects = sortedSubjects.filter((s) => s.percentage < 60);
  const failedSubjects = sortedSubjects.filter((s) => s.status === 'FAIL');

  // Overall Remark Generation
  let overallRemark = '';
  if (percentage >= 90) {
    overallRemark = `Outstanding overall academic performance by ${name}! Demonstrates thorough mastery, critical problem-solving skills, and exemplary understanding across subjects.`;
  } else if (percentage >= 80) {
    overallRemark = `Very strong academic performance by ${name}. Shows high comprehension and subject knowledge with consistent effort.`;
  } else if (percentage >= 70) {
    overallRemark = `Good academic effort by ${name}. Understands core subject concepts well, with potential to reach top-tier grades with targeted revision.`;
  } else if (percentage >= 60) {
    overallRemark = `Satisfactory performance by ${name}. Comprehends foundational concepts but requires systematic practice in specific challenging areas.`;
  } else if (percentage >= 50) {
    overallRemark = `Passable performance by ${name}, but shows significant conceptual gaps. Needs consistent study habits and regular guidance.`;
  } else {
    overallRemark = `Critical academic attention required for ${name}. Performance is below threshold and requires an immediate intervention strategy and parent-teacher alignment.`;
  }

  // Strengths identification
  if (topSubjects.length > 0) {
    topSubjects.forEach((sub) => {
      if (sub.percentage >= 90) {
        strengths.push(`Exceptional command in ${sub.subjectName} (${sub.percentage}% - Grade ${sub.grade})`);
      } else {
        strengths.push(`Strong understanding and solid performance in ${sub.subjectName} (${sub.percentage}%)`);
      }
    });
  } else if (sortedSubjects.length > 0) {
    const highest = sortedSubjects[0];
    strengths.push(`Relatively best performance in ${highest.subjectName} (${highest.percentage}%)`);
  }

  if (resultStatus === 'PASS') {
    strengths.push('Passed all mandatory subjects and met school criteria.');
  }

  // Check subject performance balance
  const maxPct = sortedSubjects[0]?.percentage || 0;
  const minPct = sortedSubjects[sortedSubjects.length - 1]?.percentage || 0;
  if (maxPct - minPct <= 15 && subjects.length > 1) {
    strengths.push('Consistent performance across all registered subjects.');
  } else if (maxPct - minPct > 30) {
    weaknesses.push(`High performance disparity (${maxPct}% in ${sortedSubjects[0]?.subjectName} vs ${minPct}% in ${sortedSubjects[sortedSubjects.length - 1]?.subjectName})`);
  }

  // Weaknesses identification
  if (failedSubjects.length > 0) {
    failedSubjects.forEach((sub) => {
      weaknesses.push(`Unsatisfactory score in ${sub.subjectName} (${sub.percentage}%) - Failed pass mark cutoff.`);
    });
  }

  if (weakSubjects.length > 0) {
    weakSubjects.forEach((sub) => {
      if (sub.status !== 'FAIL') {
        weaknesses.push(`Scope for improvement in ${sub.subjectName} (${sub.percentage}%) - Needs concept revision.`);
      }
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push('Minor speed and answer depth optimizations during exam writing.');
  }

  // Actionable Study Recommendations
  if (failedSubjects.length > 0) {
    failedSubjects.forEach((sub) => {
      aiSuggestions.push(`Schedule 45 minutes daily dedicated remedial study for ${sub.subjectName} covering core textbook exercises.`);
    });
  }

  if (weakSubjects.length > 0) {
    weakSubjects.forEach((sub) => {
      aiSuggestions.push(`Create mind maps and flashcards for fundamental topics in ${sub.subjectName}.`);
    });
  }

  if (topSubjects.length > 0) {
    aiSuggestions.push(`Maintain momentum in ${topSubjects[0].subjectName} by attempting advanced problem sets and olympiad-level questions.`);
  }

  aiSuggestions.push('Practice solving previous year exam papers under timed conditions to improve exam time management.');
  aiSuggestions.push('Conduct weekly self-assessment tests and review wrong answers with class teachers.');

  return {
    overallRemark,
    strengths,
    weaknesses,
    aiSuggestions,
    source: 'RULE_ENGINE',
  };
};
