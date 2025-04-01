// src/gameLogic.ts (continued)
import { TriviaQuestion, GameState } from "./types";
import { fetchQuestions } from "./api";
import {
  updateQuestionUI,
  updatePrizeLadder,
  updateLifelinesUI,
  showLoading,
  showGameOver,
  showWin,
} from "./uiUpdates";
import { playSound, toggleMute, setVolume } from "./sound";
import {
  PRIZE_LADDER,
  SAFE_HAVENS,
  ANIMATION_DURATIONS,
  PHONE_FRIEND_CORRECT_PROBABILITY,
  AUDIENCE_VOTE_CORRECT_PERCENTAGE,
  QUESTION_TIMER_SECONDS,
  OPTION_LABELS,
} from "./constants";

let state: GameState = {
  questions: [],
  currentQuestionIndex: 0,
  gameStarted: false,
  lifelinesUsed: { fiftyFifty: false, phoneFriend: false, askAudience: false },
  timeLeft: QUESTION_TIMER_SECONDS,
};

const friends = ["Alex", "Sam", "Jordan", "Taylor", "Chris"];

const answerButtons = [
  document.getElementById("answer-a") as HTMLButtonElement,
  document.getElementById("answer-b") as HTMLButtonElement,
  document.getElementById("answer-c") as HTMLButtonElement,
  document.getElementById("answer-d") as HTMLButtonElement,
];

const timerEl = document.getElementById("timer") as HTMLDivElement;
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

function shuffleArray(array: string[]): string[] {
  return array.sort(() => Math.random() - 0.5);
}

function startTimer(onTimeout: () => void) {
  if (timer) clearInterval(timer);
  state.timeLeft = QUESTION_TIMER_SECONDS;
  timerEl.textContent = `Time Left: ${state.timeLeft}s`;
  timerEl.classList.remove("hidden");

  timer = window.setInterval(() => {
    state.timeLeft--;
    timerEl.textContent = `Time Left: ${state.timeLeft}s`;
    if (state.timeLeft <= 0) {
      clearInterval(timer!);
      onTimeout();
    }
    saveGame();
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    timerEl.classList.add("hidden");
  }
}

// ( the startGame function)

export async function startGame(
  difficulty: "easy" | "medium" | "hard",
  category?: number
) {
  if (state.gameStarted) return;
  state.gameStarted = true;

  const gameUiEl = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelectionEl = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;
  difficultySelectionEl.style.display = "none";
  gameUiEl.classList.remove("hidden");

  showLoading();
  try {
    state.questions = await fetchQuestions(difficulty, category);
    state.currentQuestionIndex = 0;
    state.lifelinesUsed = {
      fiftyFifty: false,
      phoneFriend: false,
      askAudience: false,
    };
    state.difficulty = difficulty; // Now type-safe
    state.category = category; // Now type-safe
    displayQuestion();
  } catch (error) {
    const questionEl = document.getElementById("question") as HTMLDivElement;
    questionEl.textContent = "Failed to load questions. Please try again.";
    difficultySelectionEl.style.display = "block";
    gameUiEl.classList.add("hidden");
    state.gameStarted = false;
  }
}

function displayQuestion() {
  const question = state.questions[state.currentQuestionIndex];
  const answers = shuffleArray([
    ...question.incorrect_answers,
    question.correct_answer,
  ]);
  updateQuestionUI(question, answers, answerButtons, handleAnswer);
  updatePrizeLadder(state.currentQuestionIndex);
  updateLifelinesUI(state.lifelinesUsed);

  // Show walk away option only after reaching a safe haven
  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  const hasReachedSafeHaven = SAFE_HAVENS.some(
    (haven) => state.currentQuestionIndex >= haven
  );
  if (hasReachedSafeHaven) {
    walkAwayModal.classList.remove("hidden");
  } else {
    walkAwayModal.classList.add("hidden");
  }

  startTimer(() => {
    stopTimer();
    endGame(false, "Time’s up!");
  });

  saveGame();
}
async function handleAnswer(
  selectedAnswer: string,
  selectedBtn: HTMLButtonElement
) {
  stopTimer();
  const lifelinesEl = document.getElementById("lifelines") as HTMLDivElement;
  const walkAwayBtn = document.getElementById("walk-away") as HTMLButtonElement;
  lifelinesEl.classList.add("hidden");
  walkAwayBtn.classList.add("hidden");

  selectedBtn.className =
    "bg-yellow-400 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center animate-pulse";
  playSound("answer-select");
  await new Promise((resolve) =>
    setTimeout(resolve, ANIMATION_DURATIONS.answerSelect)
  );

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;
  selectedBtn.className = `bg-${
    isCorrect ? "green" : "red"
  }-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center animate-bounce`;
  playSound(isCorrect ? "correct" : "incorrect");
  await new Promise((resolve) =>
    setTimeout(resolve, ANIMATION_DURATIONS.answerReveal)
  );

  if (isCorrect) {
    state.currentQuestionIndex++;
    if (state.currentQuestionIndex < state.questions.length) {
      displayQuestion();
    } else {
      showWin();
      answerButtons.forEach((btn) => btn.classList.add("hidden"));
      const startBtn = document.getElementById(
        "start-btn"
      ) as HTMLButtonElement;
      startBtn.style.display = "block";
      state.gameStarted = false;
      playSound("win");
      clearGame(); // Already present, just confirming
    }
  } else {
    endGame(false);
  }
}

// endGame)
function endGame(walkAway: boolean, message?: string) {
  stopTimer();
  const lifelinesEl = document.getElementById("lifelines") as HTMLDivElement;
  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  const startBtn = document.getElementById("start-btn") as HTMLButtonElement;

  // Add null checks
  if (lifelinesEl) {
    lifelinesEl.classList.add("hidden");
  } else {
    console.error("Lifelines element not found in the DOM.");
  }
  if (walkAwayModal) {
    walkAwayModal.classList.add("hidden");
  } else {
    console.error("Walk away modal element not found in the DOM.");
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const answers = answerButtons.map(
    (btn) => btn.innerHTML.split("</span> ")[1]
  );
  if (walkAway) {
    const questionEl = document.getElementById("question") as HTMLDivElement;
    const prize = PRIZE_LADDER[state.currentQuestionIndex - 1] || 0;
    if (questionEl) {
      questionEl.textContent = `You walked away with $${prize.toLocaleString()}!`;
    }
    answerButtons.forEach((btn) => btn.classList.add("hidden"));
    if (startBtn) {
      startBtn.style.display = "block";
    }
    state.gameStarted = false;
    playSound("walk-away");
  } else {
    const prizeIndex =
      SAFE_HAVENS.filter(
        (haven) => haven <= state.currentQuestionIndex
      ).pop() || 0;
    const prize = PRIZE_LADDER[prizeIndex - 1] || 0;
    showGameOver(currentQuestion.correct_answer, answerButtons, answers);
    const questionEl = document.getElementById("question") as HTMLDivElement;
    if (questionEl) {
      questionEl.textContent = message || questionEl.textContent;
      questionEl.textContent += `\nYou walk away with $${prize.toLocaleString()}.`;
    }
    if (startBtn) {
      startBtn.style.display = "block";
    }
    state.gameStarted = false;
  }
  clearGame();
}

export function useFiftyFifty() {
  if (state.lifelinesUsed.fiftyFifty) return;
  state.lifelinesUsed.fiftyFifty = true;
  playSound("fifty-fifty");
  saveGame();

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const incorrectAnswers = currentQuestion.incorrect_answers.slice();
  const remainingIncorrect = incorrectAnswers.splice(
    Math.floor(Math.random() * incorrectAnswers.length),
    1
  );
  const newAnswers = shuffleArray([
    currentQuestion.correct_answer,
    remainingIncorrect[0],
  ]);

  answerButtons.forEach((btn) => {
    btn.classList.add("hidden");
    btn.className =
      "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center";
  });

  const correctIndex = newAnswers.indexOf(currentQuestion.correct_answer);
  const incorrectIndex = newAnswers.indexOf(remainingIncorrect[0]);
  const remainingIndices = [correctIndex, incorrectIndex].sort();
  const remainingButtons = remainingIndices.map((i) => answerButtons[i]);

  remainingButtons.forEach((btn, i) => {
    btn.classList.remove("hidden");
    btn.className =
      "bg-green-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-green-700 transition-colors flex items-center justify-center animate-bounce";
    btn.innerHTML = `<span class="mr-2 font-bold">${
      OPTION_LABELS[remainingIndices[i]]
    }:</span> ${newAnswers[i]}`;
    btn.onclick = () => handleAnswer(newAnswers[i], btn);
  });

  updateLifelinesUI(state.lifelinesUsed);
}

export async function usePhoneFriend() {
  if (state.lifelinesUsed.phoneFriend) return;
  state.lifelinesUsed.phoneFriend = true;
  playSound("phone-friend");
  saveGame();

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const answers = [
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ];
  const isCorrect = Math.random() < PHONE_FRIEND_CORRECT_PROBABILITY;
  const friendAnswer = isCorrect
    ? currentQuestion.correct_answer
    : answers[Math.floor(Math.random() * answers.length)];
  const friendName = friends[Math.floor(Math.random() * friends.length)];

  const conversationTextEl = document.getElementById(
    "conversation-text"
  ) as HTMLDivElement;
  const phoneConversationEl = document.getElementById(
    "phone-conversation"
  ) as HTMLDivElement;
  const phoneCloseBtn = document.getElementById(
    "phone-close"
  ) as HTMLButtonElement;

  conversationTextEl.innerHTML = `<p id="ringing" class="flex items-center justify-center text-base md:text-lg">
    <svg class="w-5 h-5 md:w-6 md:h-6 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
    </svg>
    Ringing...
  </p>`;
  phoneConversationEl.classList.remove("hidden");

  const messages = [
    `You: Hello, ${friendName}! I need your help with this question.`,
    `${friendName}: Sure, what's the question?`,
    `You: ${currentQuestion.question}`,
    `${friendName}: Hmm, I think it’s "${friendAnswer}".`,
  ];

  await new Promise((resolve) =>
    setTimeout(resolve, ANIMATION_DURATIONS.phoneRinging)
  );
  conversationTextEl.innerHTML = "";

  for (const msg of messages) {
    const p = document.createElement("p");
    p.className = "animate-fade-in";
    p.textContent = msg;
    conversationTextEl.appendChild(p);
    await new Promise((resolve) =>
      setTimeout(resolve, ANIMATION_DURATIONS.phoneMessage)
    );
  }

  phoneCloseBtn.classList.remove("hidden");
  updateLifelinesUI(state.lifelinesUsed);
}

export function useAskAudience() {
  if (state.lifelinesUsed.askAudience) return;
  state.lifelinesUsed.askAudience = true;
  playSound("ask-audience");
  saveGame();

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const answers = [
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ];
  const votes: Record<number, number> = {};
  const correctIndex = answers.indexOf(currentQuestion.correct_answer);
  let remainingPercentage = 100;

  votes[correctIndex] = AUDIENCE_VOTE_CORRECT_PERCENTAGE;
  remainingPercentage -= AUDIENCE_VOTE_CORRECT_PERCENTAGE;

  const incorrectCount = answers.length - 1;
  for (let i = 0; i < answers.length; i++) {
    if (i !== correctIndex) {
      const share = Math.floor(
        (Math.random() * remainingPercentage) / incorrectCount
      );
      votes[i] = share;
      remainingPercentage -= share;
    }
  }
  for (let i = 0; i < answers.length && remainingPercentage > 0; i++) {
    if (i !== correctIndex) {
      votes[i] += remainingPercentage;
      break;
    }
  }

  const histogramBarsEl = document.getElementById(
    "histogram-bars"
  ) as HTMLDivElement;
  const audienceHistogramEl = document.getElementById(
    "audience-histogram"
  ) as HTMLDivElement;
  histogramBarsEl.innerHTML = "";
  answers.forEach((_, i) => {
    const barContainer = document.createElement("div");
    barContainer.className = "flex items-center space-x-2";
    const bar = document.createElement("div");
    bar.className = `h-6 rounded ${
      i === correctIndex ? "bg-green-600" : "bg-teal-600"
    } animate-grow`;
    bar.style.width = `${votes[i]}%`;
    const label = document.createElement("span");
    label.textContent = `${OPTION_LABELS[i]}: ${votes[i]}%`;
    barContainer.appendChild(bar);
    barContainer.appendChild(label);
    histogramBarsEl.appendChild(barContainer);
  });

  audienceHistogramEl.classList.remove("hidden");
  updateLifelinesUI(state.lifelinesUsed);
}

export function walkAway(confirmed: boolean) {
  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  walkAwayModal.classList.add("hidden");

  if (confirmed) {
    endGame(true);
  } else {
    // Continue the game (modal is already hidden)
    displayQuestion(); // Refresh UI to ensure timer and buttons are active
  }
}

export function setupKeyboardSupport() {
  document.addEventListener("keydown", (event) => {
    if (!state.gameStarted) return;
    const key = event.key.toUpperCase();
    const index = OPTION_LABELS.indexOf(key);
    if (index !== -1 && !answerButtons[index].classList.contains("hidden")) {
      answerButtons[index].click();
    }
  });
}

export function setupSoundControls() {
  const muteBtn = document.getElementById("mute-btn") as HTMLButtonElement;
  const volumeSlider = document.getElementById(
    "volume-slider"
  ) as HTMLInputElement;

  muteBtn.addEventListener("click", () => {
    const isMuted = toggleMute();
    muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  });

  volumeSlider.addEventListener("input", () => {
    setVolume(Number(volumeSlider.value));
  });
}

export function resumeGame() {
  const savedState = loadGame();
  if (
    !savedState ||
    savedState.currentQuestionIndex >= savedState.questions.length || // Game won
    !savedState.gameStarted // Game ended (lost or walked away)
  ) {
    clearGame(); // Clear any stale state
    return false;
  }

  state = savedState;
  state.gameStarted = true;

  const gameUiEl = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelectionEl = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;
  difficultySelectionEl.style.display = "none";
  gameUiEl.classList.remove("hidden");

  displayQuestion();
  return true;
}
