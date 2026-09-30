export const POST_TYPES = [
  { value: "UPDATE", label: "Learning update" },
  { value: "QUESTION", label: "Question" },
  { value: "SKILL_OFFER", label: "Skill offer" },
  { value: "EXCHANGE_REQUEST", label: "Exchange request" },
  { value: "ACHIEVEMENT", label: "Achievement" },
  { value: "PROJECT", label: "Project" },
  { value: "TIP", label: "Helpful tip" },
] as const;

export const REACTIONS = [
  { value: "HELPFUL", label: "Helpful" },
  { value: "INSPIRING", label: "Inspiring" },
  { value: "NICE_PROGRESS", label: "Nice progress" },
  { value: "CAN_HELP", label: "I can help" },
  { value: "WANT_TO_LEARN", label: "I want to learn this" },
] as const;

export const SKILL_KINDS = {
  TEACH: "Can teach",
  LEARN: "Wants to learn",
  CURRENT: "Currently learning",
} as const;
