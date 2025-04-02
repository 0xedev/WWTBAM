// src/constants.ts
export const PRIZE_LADDER = [
  100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000,
  250000, 500000, 1000000,
];

export const SAFE_HAVENS = [5, 10, 13]; // Question numbers for safe havens ($1,000, $32,000, $250,000)

export const ANIMATION_DURATIONS = {
  answerSelect: 1000, // 1 second
  answerReveal: 2000, // 2 seconds
  phoneRinging: 2000, // 2 seconds
  phoneMessage: 1500, // 1.5 seconds
};

export const PHONE_FRIEND_CORRECT_PROBABILITY = 0.7;

export const AUDIENCE_VOTE_CORRECT_PERCENTAGE = 60;

export const QUESTION_TIMER_SECONDS = 30;

export const OPTION_LABELS = ["A", "B", "C", "D"];
