/**
 * Server calculation service for computing total marks, percentages, grades, and pass/fail status.
 */

const DEFAULT_GRADING_RULES = [
  { minPercentage: 90, maxPercentage: 100, grade: 'A+' },
  { minPercentage: 80, maxPercentage: 89.99, grade: 'A' },
  { minPercentage: 70, maxPercentage: 79.99, grade: 'B+' },
  { minPercentage: 60, maxPercentage: 69.99, grade: 'B' },
  { minPercentage: 50, maxPercentage: 59.99, grade: 'C' },
  { minPercentage: 40, maxPercentage: 49.99, grade: 'D' },
  { minPercentage: 0, maxPercentage: 39.99, grade: 'F' },
];

export const getGradeFromPercentage = (pct, rules = DEFAULT_GRADING_RULES) => {
  const roundedPct = Math.round(pct * 100) / 100;
  for (const r of rules) {
    if (roundedPct >= r.minPercentage && roundedPct <= (r.maxPercentage || 100)) {
      return r.grade;
    }
  }
  if (roundedPct >= 90) return 'A+';
  if (roundedPct >= 80) return 'A';
  if (roundedPct >= 70) return 'B+';
  if (roundedPct >= 60) return 'B';
  if (roundedPct >= 50) return 'C';
  if (roundedPct >= 40) return 'D';
  return 'F';
};

export const calculateResultData = (rawSubjects = [], options = {}) => {
  const passMarkPct = options.passMarkPct || 33;
  const gradingRules = options.gradingRules || DEFAULT_GRADING_RULES;

  let totalMax = 0;
  let totalObtained = 0;
  let hasFailedSubject = false;

  const processedSubjects = rawSubjects.map((sub) => {
    const maxMarks = Number(sub.maximumMarks) || 100;
    const obtainedMarks = Math.min(Math.max(Number(sub.obtainedMarks) || 0, 0), maxMarks);
    const percentage = Number(((obtainedMarks / maxMarks) * 100).toFixed(2));
    const grade = getGradeFromPercentage(percentage, gradingRules);
    const isSubjectPass = percentage >= passMarkPct;

    if (!isSubjectPass) {
      hasFailedSubject = true;
    }

    totalMax += maxMarks;
    totalObtained += obtainedMarks;

    return {
      subjectName: sub.subjectName || 'Subject',
      maximumMarks: maxMarks,
      obtainedMarks: obtainedMarks,
      percentage: percentage,
      grade: grade,
      status: isSubjectPass ? 'PASS' : 'FAIL',
    };
  });

  const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
  const overallGrade = getGradeFromPercentage(overallPercentage, gradingRules);
  const resultStatus = (!hasFailedSubject && overallPercentage >= passMarkPct) ? 'PASS' : 'FAIL';

  return {
    subjects: processedSubjects,
    totalMarks: totalMax,
    obtainedMarks: totalObtained,
    percentage: overallPercentage,
    grade: overallGrade,
    resultStatus: resultStatus,
  };
};
