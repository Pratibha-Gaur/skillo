import "server-only";

export type ExchangeSuggestion = {
  sessionCount: number;
  durationMinutes: number;
  note: string;
};

export type PlanItemSuggestion = {
  week: number;
  title: string;
  description: string;
  side: "BOTH" | "PROPOSER" | "RECIPIENT";
};

/**
 * AI boundary for Skillo. The MVP uses deterministic, editable suggestions so the
 * core exchange loop remains available without sending user data to a provider.
 * A provider can be added here using the server-only AI_API_KEY.
 */
export async function generateExchangeProposal(
  teachSkill: string,
  learnSkill: string,
): Promise<ExchangeSuggestion> {
  return {
    sessionCount: 4,
    durationMinutes: 45,
    note: `Alternate practical ${teachSkill} and ${learnSkill} sessions. End each one with a small activity to try before the next meeting.`,
  };
}

export async function generateLearningPlan(
  teachSkill: string,
  learnSkill: string,
): Promise<PlanItemSuggestion[]> {
  return [
    {
      week: 1,
      title: "Build shared foundations",
      description: `Cover one useful foundation in ${teachSkill} and ${learnSkill}, then agree on what a good first step looks like.`,
      side: "BOTH",
    },
    {
      week: 2,
      title: "Practice with feedback",
      description: `Try one focused exercise in each skill. Give specific, kind feedback and choose one thing to repeat.`,
      side: "BOTH",
    },
    {
      week: 3,
      title: "Make something small",
      description: `Use ${teachSkill} and ${learnSkill} in small real-world projects that can be reviewed together.`,
      side: "BOTH",
    },
    {
      week: 4,
      title: "Review and choose what is next",
      description:
        "Teach back one idea, revisit a difficult part, and agree on the next independent step.",
      side: "BOTH",
    },
  ];
}

export function analyzeSkill(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return {
    name: normalized,
    slug: normalized
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  };
}

export function suggestNextStep(completed: number, total: number) {
  if (completed === 0) return "Choose one small task to begin together.";
  if (completed >= total)
    return "Review what changed and decide what you want to keep practicing.";
  return "Finish the task already in progress before adding another one.";
}

export function recommendMatches<T extends { score: number }>(
  matches: T[],
  limit = 3,
) {
  return [...matches].sort((a, b) => b.score - a.score).slice(0, limit);
}

export function findSkillChains<T extends { position: number }>(members: T[]) {
  return [...members].sort((a, b) => a.position - b.position);
}
