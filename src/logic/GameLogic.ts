import { GameState } from "../utils/types";
import { fetchQuestions } from "./Api";
import { updatePrizeLadder } from "../components/PrizeLadder";
import { updateAnswers } from "../components/GameUI";
import {
  PRIZE_LADDER,
  SAFE_HAVENS,
  QUESTION_TIMER_SECONDS,
} from "../utils/constants";
import { playSound } from "../utils/sound";

let state: GameState = {
  questions: [],
  currentQuestionIndex: 0,
  gameStarted: false,
  lifelinesUsed: { fiftyFifty: false, phoneFriend: false, askAudience: false },
  timeLeft: QUESTION_TIMER_SECONDS,
};

let timer: number | null = null;

export function saveGame() {
  localStorage.setItem("wwtbam-game-state", JSON.stringify(state));
}

export function loadGame(): GameState | null {
  const savedState = localStorage.getItem("wwtbam-game-state");
  return savedState ? JSON.parse(savedState) : null;
}

export function clearGame() {
  localStorage.removeItem("wwtbam-game-state");
}

export function startGame(
  difficulty: "easy" | "medium" | "hard",
  category?: number
) {
  console.log(
    "startGame called with difficulty:",
    difficulty,
    "category:",
    category
  );
  if (state.gameStarted) return;
  state.gameStarted = true;

  const gameUi = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelection = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;

  if (!gameUi || !difficultySelection) {
    console.error(
      "DOM elements not found: gameUi:",
      gameUi,
      "difficultySelection:",
      difficultySelection
    );
    state.questions = [
      {
        question: "What is 2 + 2?",
        correct_answer: "4",
        incorrect_answers: ["3", "5", "22"],
        category: "",
        type: "",
        difficulty: "",
      },
    ];
  }

  console.log("Hiding difficulty selection, showing game UI");
  difficultySelection.classList.add("hidden");
  gameUi.classList.remove("hidden");

  fetchQuestions(difficulty, category)
    .then((questions) => {
      console.log("Questions fetched successfully:", questions);
      state.questions = questions;
      state.currentQuestionIndex = 0;
      displayQuestion();
      saveGame();
    })
    .catch((error) => {
      console.error("Failed to fetch questions:", error);
      state.questions = [
        {
          question: "What is 2 + 2?",
          correct_answer: "4",
          incorrect_answers: ["3", "5", "22"],
          category: "",
          type: "",
          difficulty: "",
        },
      ];
      state.currentQuestionIndex = 0;
      displayQuestion();
      saveGame();
    });
}

export function resumeGame(): boolean {
  const savedState = loadGame();
  if (
    !savedState ||
    savedState.currentQuestionIndex >= savedState.questions.length ||
    !savedState.gameStarted
  ) {
    clearGame();
    return false;
  }
  state = savedState;
  state.gameStarted = true;

  const gameUi = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelection = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;
  if (!gameUi || !difficultySelection) {
    console.error("DOM elements not found during resume");
    return false;
  }

  difficultySelection.classList.add("hidden");
  gameUi.classList.remove("hidden");
  displayQuestion();
  return true;
}

// ... (other imports and code unchanged)

function displayQuestion() {
  const question = state.questions[state.currentQuestionIndex];
  const answers = [...question.incorrect_answers, question.correct_answer].sort(
    () => Math.random() - 0.5
  );
  const questionEl = document.getElementById("question") as HTMLDivElement;
  if (questionEl) {
    console.log("Displaying question:", question.question);
    questionEl.textContent = question.question;
  } else {
    console.error("Question element not found");
  }
  console.log("Updating answers:", answers);
  updateAnswers(answers);
  updatePrizeLadder(state.currentQuestionIndex);
  startTimer(() => endGame(false, "Time’s up!"));
  saveGame();

  // Show lifelines when question displays
  const lifelinesEl = document.getElementById("lifelines") as HTMLDivElement;
  if (lifelinesEl) lifelinesEl.classList.remove("hidden");
}

export async function handleAnswer(
  selectedAnswer: string,
  selectedBtn: HTMLButtonElement
) {
  console.log("handleAnswer called with selectedAnswer:", selectedAnswer);
  stopTimer();
  const lifelinesEl = document.getElementById("lifelines") as HTMLDivElement;
  if (lifelinesEl) lifelinesEl.classList.add("hidden");

  selectedBtn.className =
    "bg-yellow-400 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center animate-pulse";
  playSound("answer-select");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;
  console.log(
    "Answer isCorrect:",
    isCorrect,
    "Correct answer:",
    currentQuestion.correct_answer
  );

  selectedBtn.className = `bg-${
    isCorrect ? "green" : "red"
  }-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center animate-bounce`;
  playSound(isCorrect ? "correct" : "incorrect");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (isCorrect) {
    state.currentQuestionIndex++;
    console.log(
      "Incremented currentQuestionIndex to:",
      state.currentQuestionIndex
    );
    if (state.currentQuestionIndex < state.questions.length) {
      displayQuestion();
    } else {
      console.log("You won!");
      endGame(true, "Congratulations, you’ve won!");
    }
  } else {
    endGame(false, "Incorrect answer");
  }
}

// ... (other functions unchanged)

function endGame(walkAway: boolean, message: string) {
  stopTimer();
  const prize = walkAway
    ? PRIZE_LADDER[state.currentQuestionIndex - 1]
    : PRIZE_LADDER[
        (SAFE_HAVENS.filter((h) => h <= state.currentQuestionIndex).pop() ||
          0) - 1
      ] || 0;
  const questionEl = document.getElementById("question") as HTMLDivElement;
  if (questionEl) {
    questionEl.textContent = walkAway
      ? `You walked away with $${prize.toLocaleString()}!`
      : `${message} You walk away with $${prize.toLocaleString()}.`;
  }
  const gameUi = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelection = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;
  if (gameUi) gameUi.classList.add("hidden");
  if (difficultySelection) difficultySelection.classList.remove("hidden");
  state.gameStarted = false;
  clearGame();
}

function startTimer(onTimeout: () => void) {
  const timerEl = document.getElementById("timer") as HTMLDivElement;
  if (timer) clearInterval(timer);
  state.timeLeft = QUESTION_TIMER_SECONDS;
  if (timerEl) {
    timerEl.textContent = `Time Left: ${state.timeLeft}s`;
    timerEl.classList.remove("hidden");
  }
  timer = setInterval(() => {
    state.timeLeft--;
    if (timerEl) timerEl.textContent = `Time Left: ${state.timeLeft}s`;
    if (state.timeLeft <= 0) {
      clearInterval(timer!);
      onTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    const timerEl = document.getElementById("timer") as HTMLDivElement;
    if (timerEl) timerEl.classList.add("hidden");
  }
}

export function useFiftyFifty() {
  console.log("50/50 used");
}
export function usePhoneFriend() {
  console.log("Phone a Friend used");
}
export function useAskAudience() {
  console.log("Ask Audience used");
}
export function walkAway(confirmed: boolean) {
  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  if (walkAwayModal) walkAwayModal.classList.add("hidden");
  if (confirmed) endGame(true, "Walked away");
  else displayQuestion();
}
