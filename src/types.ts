// src/types.ts
export interface TriviaQuestion {
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
}
