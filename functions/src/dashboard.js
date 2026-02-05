const admin = require("firebase-admin");

/**
 * Helper function to count values in an array
 */
function countBy(array, key) {
  return array.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Get dashboard metrics
 * GET /api/dashboard
 */
async function getDashboard(req, res) {
  try {
    const uid = req.user.uid;

    // Get all decisions for this user
    const snap = await admin
      .firestore()
      .collection("decisions")
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc")
      .get();

    const decisions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Calculate metrics
    const totalDecisions = decisions.length;
    const timeSavedTotal = decisions.reduce(
      (acc, d) => acc + (d.timeSavedMinutes || 0),
      0
    );

    // Communication breakdown
    const communicationCounts = countBy(decisions, "communicationType");

    // Urgency, tone, sensitivity distributions
    const urgencyCounts = countBy(decisions, "urgency");
    const toneCounts = countBy(decisions, "tone");
    const sensitivityCounts = countBy(decisions, "sensitivity");

    // Time saved by day (last 30 days)
    const nowMs = Date.now();
    const thirtyDaysAgo = nowMs - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = nowMs - 60 * 24 * 60 * 60 * 1000;
    const recentDecisions = decisions.filter(
      (d) => d.timestamp && d.timestamp >= thirtyDaysAgo
    );
    const previous30Decisions = decisions.filter(
      (d) =>
        d.timestamp &&
        d.timestamp >= sixtyDaysAgo &&
        d.timestamp < thirtyDaysAgo
    );

    const last30Days = {
      decisionCount: recentDecisions.length,
      timeSavedMinutes: recentDecisions.reduce(
        (acc, d) => acc + (d.timeSavedMinutes || 0),
        0
      ),
    };
    const previous30Days = {
      decisionCount: previous30Decisions.length,
      timeSavedMinutes: previous30Decisions.reduce(
        (acc, d) => acc + (d.timeSavedMinutes || 0),
        0
      ),
    };
    const last30Trend =
      previous30Days.timeSavedMinutes === 0
        ? (last30Days.timeSavedMinutes > 0 ? "up" : "stable")
        : last30Days.timeSavedMinutes > previous30Days.timeSavedMinutes
        ? "up"
        : last30Days.timeSavedMinutes < previous30Days.timeSavedMinutes
        ? "down"
        : "stable";

    const timeSavedByDay = {};
    recentDecisions.forEach((d) => {
      if (d.timestamp) {
        const ts = typeof d.timestamp.toDate === "function" ? d.timestamp.toDate().getTime() : d.timestamp;
        const date = new Date(ts).toISOString().split("T")[0];
        timeSavedByDay[date] = (timeSavedByDay[date] || 0) + (d.timeSavedMinutes || 0);
      }
    });

    // Calculate weekly metrics
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekTimestamp = startOfWeek.getTime();

    const thisWeekDecisions = decisions.filter(
      (d) => d.timestamp && d.timestamp >= startOfWeekTimestamp
    );
    const decisionsThisWeek = thisWeekDecisions.length;
    const timeSavedThisWeek = thisWeekDecisions.reduce(
      (acc, d) => acc + (d.timeSavedMinutes || 0),
      0
    );

    // Calculate last week
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(startOfWeek);
    const lastWeekStartTimestamp = lastWeekStart.getTime();
    const lastWeekEndTimestamp = lastWeekEnd.getTime();

    const lastWeekDecisions = decisions.filter(
      (d) =>
        d.timestamp &&
        d.timestamp >= lastWeekStartTimestamp &&
        d.timestamp < lastWeekEndTimestamp
    );
    const decisionsLastWeek = lastWeekDecisions.length;
    const timeSavedLastWeek = lastWeekDecisions.reduce(
      (acc, d) => acc + (d.timeSavedMinutes || 0),
      0
    );

    // Calculate efficiency trend
    const thisWeekAvg =
      decisionsThisWeek > 0 ? timeSavedThisWeek / decisionsThisWeek : 0;
    const lastWeekAvg =
      decisionsLastWeek > 0 ? timeSavedLastWeek / decisionsLastWeek : 0;
    const efficiencyTrend =
      thisWeekAvg > lastWeekAvg
        ? "up"
        : thisWeekAvg < lastWeekAvg
        ? "down"
        : "stable";

    // Calculate streaks
    const sortedByDate = decisions
      .filter((d) => d.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    sortedByDate.forEach((d) => {
      const date = new Date(d.timestamp).toDateString();
      if (date !== lastDate) {
        if (lastDate) {
          const daysDiff = Math.floor(
            (new Date(lastDate) - new Date(date)) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        lastDate = date;
      }
    });
    longestStreak = Math.max(longestStreak, tempStreak);
    currentStreak = tempStreak;

    res.json({
      totalDecisions,
      timeSavedTotal,
      timeSavedByDay,
      communicationBreakdown: communicationCounts,
      urgencyDistribution: urgencyCounts,
      toneDistribution: toneCounts,
      sensitivityDistribution: sensitivityCounts,
      currentStreak,
      longestStreak,
      weeklyMetrics: {
        decisionsThisWeek,
        timeSavedThisWeek,
        decisionsLastWeek,
        timeSavedLastWeek,
        efficiencyTrend,
      },
      decisions: decisions.slice(0, 20), // Last 20 for activity timeline
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard data",
      message: error.message,
    });
  }
}

/**
 * Get dashboard insights (AI-generated)
 * GET /api/dashboard/insights
 */
async function getDashboardInsights(req, res) {
  try {
    const uid = req.user.uid;

    // Get decisions for analysis
    const snap = await admin
      .firestore()
      .collection("decisions")
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const decisions = snap.docs.map((d) => d.data());

    if (decisions.length === 0) {
      return res.json({
        insights: ["Start making decisions to see insights!"],
      });
    }

    // Calculate basic stats for prompt
    const total = decisions.length;
    const meetings = decisions.filter((d) => d.communicationType === "meeting").length;
    const emails = decisions.filter((d) => d.communicationType === "email").length;
    const async = decisions.filter((d) => d.communicationType === "async_message").length;
    const timeSaved = decisions.reduce((acc, d) => acc + (d.timeSavedMinutes || 0), 0);

    // For now, return deterministic insights based on data
    // In production, this would call Claude API
    const insights = [];

    if (meetings > 0) {
      const meetingPct = Math.round((meetings / total) * 100);
      insights.push(
        `You've scheduled ${meetings} meeting${meetings > 1 ? "s" : ""} (${meetingPct}% of decisions).`
      );
    }

    if (emails > 0) {
      const emailPct = Math.round((emails / total) * 100);
      insights.push(
        `You've recommended ${emails} email${emails > 1 ? "s" : ""} (${emailPct}% of decisions).`
      );
    }

    if (async > 0) {
      const asyncPct = Math.round((async / total) * 100);
      insights.push(
        `You've avoided ${async} unnecessary meeting${async > 1 ? "s" : ""} by choosing async communication (${asyncPct}% of decisions).`
      );
    }

    if (timeSaved > 0) {
      const hours = Math.round(timeSaved / 60);
      insights.push(`You've saved approximately ${hours} hour${hours > 1 ? "s" : ""} by making intentional communication decisions.`);
    }

    if (insights.length === 0) {
      insights.push("Keep making decisions to see personalized insights!");
    }

    res.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    res.status(500).json({
      error: "Failed to generate insights",
      message: error.message,
    });
  }
}

/**
 * Get streaks
 * GET /api/dashboard/streaks
 */
async function getStreaks(req, res) {
  try {
    const uid = req.user.uid;

    const snap = await admin
      .firestore()
      .collection("decisions")
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc")
      .get();

    const decisions = snap.docs
      .map((d) => d.data())
      .filter((d) => d.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    decisions.forEach((d) => {
      const date = new Date(d.timestamp).toDateString();
      if (date !== lastDate) {
        if (lastDate) {
          const daysDiff = Math.floor(
            (new Date(lastDate) - new Date(date)) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        lastDate = date;
      }
    });
    longestStreak = Math.max(longestStreak, tempStreak);
    currentStreak = tempStreak;

    res.json({
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    console.error("Streaks error:", error);
    res.status(500).json({
      error: "Failed to fetch streaks",
      message: error.message,
    });
  }
}

module.exports = { getDashboard, getDashboardInsights, getStreaks };
