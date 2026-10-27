import Result from '../models/Result.js';
import Student from '../models/Student.js';
import { initialResults, initialStudents } from '../utils/seedData.js';

// @desc Get main Dashboard KPIs and chart analytics
// @route GET /api/analytics/dashboard
export const getDashboardAnalytics = async (req, res) => {
  try {
    let students = [];
    let results = [];

    try {
      students = await Student.find();
      results = await Result.find().sort({ generatedAt: -1 });
    } catch {
      students = initialStudents;
      results = initialResults;
    }

    if (!students || students.length === 0) students = initialStudents;
    if (!results || results.length === 0) results = initialResults;

    const totalStudents = students.length;
    const totalResultsGenerated = results.length;

    // Calculate Average Percentage
    const avgPercentage =
      results.length > 0
        ? Number((results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length).toFixed(1))
        : 0;

    // Calculate Pass Percentage
    const passCount = results.filter((r) => r.resultStatus === 'PASS').length;
    const failCount = results.length - passCount;
    const passPercentage =
      results.length > 0 ? Number(((passCount / results.length) * 100).toFixed(1)) : 0;

    // Students needing improvement (percentage < 60 or Status === FAIL)
    const needingImprovementList = results
      .filter((r) => r.percentage < 60 || r.resultStatus === 'FAIL')
      .map((r) => ({
        studentId: r.studentId,
        studentName: r.studentDetails?.name || 'Student',
        rollNumber: r.studentDetails?.rollNumber || 'N/A',
        class: r.class,
        section: r.section,
        percentage: r.percentage,
        grade: r.grade,
        resultStatus: r.resultStatus,
        weakSubjectCount: (r.weaknesses || []).length,
      }));

    // Top Performing Students
    const topPerformers = [...results]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)
      .map((r) => ({
        studentId: r.studentId,
        studentName: r.studentDetails?.name || 'Student',
        rollNumber: r.studentDetails?.rollNumber || 'N/A',
        class: r.class,
        percentage: r.percentage,
        grade: r.grade,
      }));

    // Subject-wise average percentage calculation across all results
    const subjectTotals = {};
    const subjectCounts = {};
    results.forEach((r) => {
      (r.subjects || []).forEach((sub) => {
        const name = sub.subjectName;
        if (!subjectTotals[name]) {
          subjectTotals[name] = 0;
          subjectCounts[name] = 0;
        }
        subjectTotals[name] += sub.percentage || 0;
        subjectCounts[name] += 1;
      });
    });

    const averageBySubject = Object.keys(subjectTotals).map((name) => ({
      subject: name,
      averagePercentage: Number((subjectTotals[name] / (subjectCounts[name] || 1)).toFixed(1)),
    }));

    // Grade Distribution count
    const gradeCounts = { 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, D: 0, F: 0 };
    results.forEach((r) => {
      const g = r.grade || 'F';
      if (gradeCounts[g] !== undefined) {
        gradeCounts[g] += 1;
      } else {
        gradeCounts[g] = 1;
      }
    });

    const gradeDistribution = Object.keys(gradeCounts).map((g) => ({
      grade: g,
      count: gradeCounts[g],
    }));

    // Pass vs Fail distribution
    const passVsFail = [
      { status: 'Passed', count: passCount, color: '#10B981' },
      { status: 'Failed / Needs Support', count: failCount, color: '#EF4444' },
    ];

    // Recent 5 results table
    const recentResults = results.slice(0, 7).map((r) => ({
      id: r._id || r.resultId,
      resultId: r.resultId,
      studentName: r.studentDetails?.name || 'Student',
      rollNumber: r.studentDetails?.rollNumber || 'N/A',
      class: `${r.class} - ${r.section}`,
      percentage: r.percentage,
      grade: r.grade,
      resultStatus: r.resultStatus,
      generatedDate: new Date(r.generatedAt || r.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }));

    res.json({
      success: true,
      kpis: {
        totalStudents,
        totalResultsGenerated,
        avgPercentage,
        passPercentage,
        needingImprovementCount: needingImprovementList.length,
      },
      charts: {
        averageBySubject,
        passVsFail,
        gradeDistribution,
        topPerformers,
        needingImprovementList,
      },
      recentResults,
    });
  } catch (error) {
    console.error('[getDashboardAnalytics Error]', error);
    res.status(500).json({ success: false, message: 'Error compiling dashboard analytics' });
  }
};

// @desc Get comparative analytics across classes and subjects
// @route GET /api/analytics/comparative
export const getComparativeAnalytics = async (req, res) => {
  try {
    let results = [];
    try {
      results = await Result.find();
    } catch {
      results = initialResults;
    }
    if (!results || results.length === 0) results = initialResults;

    // Class average comparison
    const classMap = {};
    results.forEach((r) => {
      const cls = r.class || 'Class 10';
      if (!classMap[cls]) classMap[cls] = { totalPct: 0, count: 0, passCount: 0 };
      classMap[cls].totalPct += r.percentage;
      classMap[cls].count += 1;
      if (r.resultStatus === 'PASS') classMap[cls].passCount += 1;
    });

    const classComparison = Object.keys(classMap).map((cls) => ({
      className: cls,
      averagePercentage: Number((classMap[cls].totalPct / classMap[cls].count).toFixed(1)),
      passRate: Number(((classMap[cls].passCount / classMap[cls].count) * 100).toFixed(1)),
      studentCount: classMap[cls].count,
    }));

    res.json({
      success: true,
      classComparison,
    });
  } catch (error) {
    console.error('[getComparativeAnalytics Error]', error);
    res.status(500).json({ success: false, message: 'Failed to generate comparative analytics' });
  }
};
