type Urgency = 'none' | 'low' | 'medium' | 'high' | 'critical';
type Complexity = 'simple' | 'moderate' | 'complex' | 'highly_complex';
type DecisionType = 'inform' | 'align' | 'decide' | 'escalate' | 'unblock' | 'update' | 'brainstorm';

export interface WizardFormData {
  urgency?: Urgency;
  complexity?: Complexity;
  decisionTypes?: DecisionType[];
  stakeholderCount?: string; // e.g. "1–2", "3–5", "6–10", "10+"
  crossTeamDependencies?: boolean;
  emotionalRisk?: 'none' | 'low' | 'medium' | 'high';
  changeImpact?: 'none' | 'low' | 'medium' | 'high';
  // recurrence details used for cadence calculation
  is_recurring?: boolean;
  recurring_type?: 'project' | 'team' | 'company';
  project_length?: '1-3_months' | '3-6_months' | '6-12_months' | '12+_months';
  // allow extra fields -- engine should be resilient
  [key: string]: any;
}

export interface RulesResult {
  recommendation: 'meeting' | 'email' | 'async_message' | 'cancel_meeting' | 'no_action';
  confidence_score: number; // 0-100
  rationale: string;
  meeting_length: number; // minutes
  meeting_cadence: string;
  participants: string[];
  time_saved_minutes: number;
  best_practices: string;
  scores: {
    meeting: number;
    email: number;
    async: number;
  };
}

export default class RulesEngine {
  run(formData: WizardFormData): RulesResult {
    const {
      urgency = 'none',
      complexity = 'simple',
      decisionTypes = [],
      stakeholderCount = '1–2',
      crossTeamDependencies = false,
      emotionalRisk = 'none',
      changeImpact = 'none',
      is_recurring = false,
      recurring_type,
      project_length,
    } = formData || {};

    const urgencyWeights: Record<Urgency, number> = {
      none: 0,
      low: 1,
      medium: 2,
      high: 3,
      critical: 5,
    };

    const complexityWeights: Record<Complexity, number> = {
      simple: 0,
      moderate: 1,
      complex: 3,
      highly_complex: 5,
    };

    const stakeholderWeights: Record<string, number> = {
      '1–2': 0,
      '3–5': 2,
      '6–10': 4,
      '10+': 6,
    };

    const emotionalWeights: Record<string, number> = {
      none: 0,
      low: 1,
      medium: 2,
      high: 4,
    };

    const changeImpactWeights = emotionalWeights;

    const decisionTypeInfluence = {
      meeting: {
        inform: 0,
        align: 3,
        decide: 4,
        escalate: 4,
        unblock: 1,
        update: 0,
        brainstorm: 4,
      },
      email: {
        inform: 2,
        align: 1,
        decide: 0,
        escalate: 0,
        unblock: 0,
        update: 3,
        brainstorm: 0,
      },
      async: {
        inform: 2,
        align: 0,
        decide: 0,
        escalate: 0,
        unblock: 3,
        update: 1,
        brainstorm: 0,
      },
    } as const;

    // base contributions
    const u = urgencyWeights[urgency];
    const c = complexityWeights[complexity];
    const s = stakeholderWeights[stakeholderCount] ?? 0;
    const e = emotionalWeights[emotionalRisk] ?? 0;
    const ch = changeImpactWeights[changeImpact] ?? 0;

    // sum decision type influences
    let dtMeeting = 0;
    let dtEmail = 0;
    let dtAsync = 0;
    for (const dt of decisionTypes || []) {
      if (decisionTypeInfluence.meeting[dt] != null) dtMeeting += decisionTypeInfluence.meeting[dt] as number;
      if (decisionTypeInfluence.email[dt] != null) dtEmail += decisionTypeInfluence.email[dt] as number;
      if (decisionTypeInfluence.async[dt] != null) dtAsync += decisionTypeInfluence.async[dt] as number;
    }

    const crossTeamBonus = crossTeamDependencies ? 3 : 0;

    // raw scores (un-normalized)
    let meetingScore = u * 1.6 + c * 1.4 + dtMeeting * 2 + s * 1.2 + crossTeamBonus + e * 1.5 + ch * 1.5;
    let emailScore = u * 0.9 + c * 0.4 + dtEmail * 1.6 + ch * 0.6;
    let asyncScore = u * 0.7 + c * 0.5 + dtAsync * 1.8 + s * 0.3;

    // small floor to avoid zeros
    meetingScore = Math.max(0, meetingScore);
    emailScore = Math.max(0, emailScore);
    asyncScore = Math.max(0, asyncScore);

    // Normalization to 0-100 relative scoring
    const sum = meetingScore + emailScore + asyncScore || 1;
    const meetingPct = (meetingScore / sum) * 100;
    const emailPct = (emailScore / sum) * 100;
    const asyncPct = (asyncScore / sum) * 100;

    // Decide recommendation
    let recommendation: RulesResult['recommendation'] = 'no_action';
    // if nothing significant
    if (meetingPct < 15 && emailPct < 15 && asyncPct < 15) {
      recommendation = 'no_action';
    } else {
      const scores: [string, number][] = [ ['meeting', meetingPct], ['email', emailPct], ['async', asyncPct] ];
      scores.sort((a, b) => b[1] - a[1]);
      const top = scores[0][0];
      const topVal = scores[0][1];
      const secondVal = scores[1][1];

      if (top === 'meeting') {
        // special-case: if driving factor is only "inform"/"update" and low urgency, cancel meeting
        const onlyInformOrUpdate = decisionTypes.length > 0 && decisionTypes.every(dt => dt === 'inform' || dt === 'update');
        if ((urgency === 'none' || urgency === 'low') && onlyInformOrUpdate && topVal < 50) {
          recommendation = 'cancel_meeting';
        } else {
          recommendation = 'meeting';
        }
      } else if (top === 'email') {
        recommendation = 'email';
      } else {
        recommendation = 'async_message';
      }
    }

    // meeting length estimation - based solely on complexity band
    let meeting_length = 0;
    if (recommendation === 'meeting') {
      switch (complexity) {
        case 'highly_complex':
          // 60–90 minutes -> choose midpoint
          meeting_length = 75;
          break;
        case 'complex':
          // 45–60 minutes
          meeting_length = 50;
          break;
        case 'moderate':
          // 30–45 minutes
          meeting_length = 35;
          break;
        case 'simple':
        default:
          // 15–30 minutes
          meeting_length = 20;
          break;
      }
    }

    // meeting cadence - driven by recurrence fields
    let meeting_cadence = 'One-time meeting (no regular cadence)';
    if (recommendation === 'meeting') {
      if (!is_recurring) {
        meeting_cadence = 'One-time meeting (no regular cadence)';
      } else if (recurring_type === 'project') {
        switch (project_length) {
          case '1-3_months':
            meeting_cadence = 'Weekly standup (15 min) + Bi-weekly planning (45 min) + Kick-off & Retro';
            break;
          case '3-6_months':
            meeting_cadence = 'Weekly standup + Weekly planning (30 min) + Monthly review (60 min)';
            break;
          case '6-12_months':
            meeting_cadence = 'Daily standup + Weekly planning (45 min) + Bi-weekly stakeholder sync + Monthly retro';
            break;
          case '12+_months':
          default:
            meeting_cadence = 'Daily standup + Weekly planning + Bi-weekly stakeholder sync + Monthly retro + Quarterly review (90 min)';
            break;
        }
      } else if (recurring_type === 'team') {
        meeting_cadence = 'Weekly team sync (30–45 min)';
      } else if (recurring_type === 'company') {
        meeting_cadence = 'Monthly all-hands (45–60 min)';
      }
    }

    // participants recommendation (simple, deterministic)
    const participants: string[] = [];
    participants.push('Decision owner');
    const stakeholderEstimate = (() => {
      switch (stakeholderCount) {
        case '1–2': return 2;
        case '3–5': return 4;
        case '6–10': return 8;
        default: return 12;
      }
    })();
    participants.push(`Core stakeholders (${stakeholderEstimate})`);
    if (crossTeamDependencies) participants.push('Representatives from dependent teams');
    if (emotionalRisk === 'high') participants.push('HR or people lead (optional)');
    if (complexity !== 'simple') participants.push('Subject matter experts');

    // time saved estimate: compare meeting vs async/email using a simple baseline
    const estimatedAsyncTime = 10; // minutes to draft an async update or email
    let time_saved_minutes = 0;
    if (recommendation === 'async_message' || recommendation === 'email') {
      // estimate that replacing a meeting saves the baseline meeting time minus async time
      const baselineMeeting = (() => {
        switch (complexity) {
          case 'highly_complex':
            return 80; // slightly above our recommendation midpoint
          case 'complex':
            return 60;
          case 'moderate':
            return 45;
          case 'simple':
          default:
            return 30;
        }
      })();
      const hypotheticalMeeting = baselineMeeting;
      time_saved_minutes = Math.max(0, hypotheticalMeeting - estimatedAsyncTime);
    } else if (recommendation === 'cancel_meeting') {
      const hypotheticalMeeting = (() => {
        switch (complexity) {
          case 'highly_complex':
            return 80;
          case 'complex':
            return 60;
          case 'moderate':
            return 45;
          case 'simple':
          default:
            return 30;
        }
      })();
      time_saved_minutes = hypotheticalMeeting;
    } else {
      time_saved_minutes = 0;
    }

    // confidence score: bucketed by gap between top two options
    const topVal = Math.max(meetingPct, emailPct, asyncPct);
    const sortedScores = [meetingPct, emailPct, asyncPct].sort((a, b) => b - a);
    const secondVal = sortedScores[1] ?? 0;
    const gap = topVal - secondVal;
    let confidence_score: number;
    if (gap > 30) {
      confidence_score = 95;
    } else if (gap > 20) {
      confidence_score = 85;
    } else if (gap > 10) {
      confidence_score = 75;
    } else if (gap > 5) {
      confidence_score = 65;
    } else {
      confidence_score = 55;
    }

    // rationale and best_practices are deterministic strings built from inputs
    const rationale = `Scores -> meeting: ${meetingPct.toFixed(1)}, email: ${emailPct.toFixed(1)}, async: ${asyncPct.toFixed(1)}. Key drivers: urgency=${urgency}, complexity=${complexity}, decisionTypes=[${decisionTypes.join(',')}], stakeholders=${stakeholderCount}, crossTeam=${crossTeamDependencies}, emotionalRisk=${emotionalRisk}, changeImpact=${changeImpact}.`;

    const best_practices = (() => {
      const pts: string[] = [];
      pts.push('Clarify desired outcome before choosing a channel.');
      if (recommendation === 'meeting') {
        pts.push('Share agenda in advance and timebox the meeting.');
        pts.push('Invite only core stakeholders and decision owner.');
      } else if (recommendation === 'email') {
        pts.push('Use a concise subject and call out required action and deadline.');
      } else if (recommendation === 'async_message') {
        pts.push('Provide context, decision-needed line, and clear next steps in the message.');
      }
      if (emotionalRisk === 'high') pts.push('Prepare a mitigation plan for emotional risk and allow private feedback channels.');
      if (crossTeamDependencies) pts.push('Document dependencies and owners in a visible place (e.g., shared doc).');
      return pts.join('\n');
    })();

    return {
      recommendation,
      confidence_score,
      rationale,
      meeting_length,
      meeting_cadence,
      participants,
      time_saved_minutes,
      best_practices,
      scores: {
        meeting: Number(meetingPct.toFixed(1)),
        email: Number(emailPct.toFixed(1)),
        async: Number(asyncPct.toFixed(1)),
      },
    } as RulesResult;
  }
}
