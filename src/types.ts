// src/types.ts
export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface GameState {
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  gameStarted: boolean;
  lifelinesUsed: {
    fiftyFifty: boolean;
    phoneFriend: boolean;
    askAudience: boolean;
  };
  timeLeft: number;
  difficulty?: string; // Add difficulty to state
  category?: number; // Add category to state
}
