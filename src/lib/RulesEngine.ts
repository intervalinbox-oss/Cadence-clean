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
      const scores = [ ['meeting', meetingPct], ['email', emailPct], ['async', asyncPct] ] as const;
      scores.sort((a,b) => b[1] - a[1]);
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

    // meeting length estimation
    let meeting_length = 0;
    if (recommendation === 'meeting') {
      const base = 15;
      const complexityAdd = c * 10; // moderate +10, complex +30
      const stakeholderAdd = s * 5; // 3-5 -> +10 etc.
      const decisionTypeAdd = dtMeeting >= 4 ? 20 : dtMeeting >= 2 ? 10 : 0;
      meeting_length = Math.min(180, Math.round(base + complexityAdd + stakeholderAdd + decisionTypeAdd));
    }

    // meeting cadence
    let meeting_cadence = 'one_off';
    if (decisionTypes.includes('decide') || decisionTypes.includes('align') || decisionTypes.includes('brainstorm')) {
      meeting_cadence = crossTeamDependencies ? 'weekly' : 'one_off';
    }
    if (decisionTypes.includes('escalate')) meeting_cadence = 'weekly';
    if (decisionTypes.includes('update') && (stakeholderCount === '10+' || crossTeamDependencies)) meeting_cadence = 'biweekly';

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

    // time saved estimate: compare meeting vs async/email
    const estimatedAsyncTime = 10; // minutes to draft an async update or email
    let time_saved_minutes = 0;
    if (recommendation === 'async_message' || recommendation === 'email') {
      // estimate that replacing a meeting saves the meeting_length - async time
      const hypotheticalMeeting = meeting_length || Math.min(60, Math.round(15 + c * 12 + s * 4));
      time_saved_minutes = Math.max(0, hypotheticalMeeting - estimatedAsyncTime);
    } else if (recommendation === 'cancel_meeting') {
      const hypotheticalMeeting = Math.min(60, Math.round(15 + c * 12 + s * 4));
      time_saved_minutes = hypotheticalMeeting;
    } else {
      time_saved_minutes = 0;
    }

    // confidence score: based on margin between top two and absolute top
    const topVal = Math.max(meetingPct, emailPct, asyncPct);
    const secondVal = [meetingPct, emailPct, asyncPct].sort((a,b) => b-a)[1];
    const margin = topVal - secondVal;
    let confidence_score = Math.round(Math.min(100, Math.max(10, 20 + margin * 0.8 + topVal * 0.2)));

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
      return pts.join(' ');
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
