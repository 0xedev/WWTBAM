import { GameState } from "../utils/types";
import { fetchQuestions } from "./Api";
import { updatePrizeLadder } from "../components/PrizeLadder";
import { updateAnswers } from "../components/GameUI";
import {
  PRIZE_LADDER,
  SAFE_HAVENS,
  PHONE_FRIEND_CORRECT_PROBABILITY, // Add this
  AUDIENCE_VOTE_CORRECT_PERCENTAGE,
  QUESTION_TIMER_SECONDS,
} from "../utils/constants";
import { playSound } from "../utils/sound";

import { updateLifelinesUI } from "../uiUpdates";

let timer: number | null = null;

export let state: GameState = {
  questions: [],
  currentQuestionIndex: 0,
  gameStarted: false,
  lifelinesUsed: { fiftyFifty: false, phoneFriend: false, askAudience: false },
  timeLeft: QUESTION_TIMER_SECONDS,
};

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
  // Reset state for a new game
  state = {
    questions: [],
    currentQuestionIndex: 0,
    gameStarted: true,
    lifelinesUsed: {
      fiftyFifty: false,
      phoneFriend: false,
      askAudience: false,
    },
    timeLeft: QUESTION_TIMER_SECONDS,
  };

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

  // Update lifeline UI immediately after state reset
  updateLifelinesUI(state.lifelinesUsed);
  console.log("Lifelines reset and UI updated:", state.lifelinesUsed);

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
  state = {
    ...savedState,
    gameStarted: true,
    lifelinesUsed: savedState.lifelinesUsed || {
      fiftyFifty: false,
      phoneFriend: false,
      askAudience: false,
    }, // Ensure lifelines are defined
  };

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

  // Reset all answer buttons before updating
  const answerButtons = [
    document.getElementById("answer-a") as HTMLButtonElement,
    document.getElementById("answer-b") as HTMLButtonElement,
    document.getElementById("answer-c") as HTMLButtonElement,
    document.getElementById("answer-d") as HTMLButtonElement,
  ].filter(Boolean);

  answerButtons.forEach((btn) => {
    if (btn) {
      btn.className =
        "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center";
      btn.disabled = false; // Re-enable buttons
      btn.classList.remove("hidden"); // Ensure all buttons are visible
      btn.onclick = null; // Clear previous event listeners
    }
  });

  console.log("Updating answers:", answers);
  updateAnswers(answers); // This will set new text and onclick handlers
  updatePrizeLadder(state.currentQuestionIndex);
  updateLifelinesUI(state.lifelinesUsed);
  startTimer(() => endGame(false, "Time’s up!"));
  saveGame();

  const lifelinesEl = document.getElementById("lifelines") as HTMLDivElement;
  if (lifelinesEl) lifelinesEl.classList.remove("hidden");
}

// handle answer function
export async function handleAnswer(
  selectedAnswer: string,
  selectedBtn: HTMLButtonElement
) {
  console.log("handleAnswer called with:", selectedAnswer);
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

  const answerButtons = [
    document.getElementById("answer-a") as HTMLButtonElement,
    document.getElementById("answer-b") as HTMLButtonElement,
    document.getElementById("answer-c") as HTMLButtonElement,
    document.getElementById("answer-d") as HTMLButtonElement,
  ].filter(Boolean);

  answerButtons.forEach((btn) => {
    if (!btn) return;
    const btnAnswer = btn.textContent?.substring(3).trim();
    if (btn === selectedBtn) {
      btn.className = `bg-${
        isCorrect ? "green" : "red"
      }-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center animate-bounce`;
    } else if (btnAnswer === currentQuestion.correct_answer && !isCorrect) {
      btn.className =
        "bg-green-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center animate-bounce";
    }
    btn.disabled = true;
  });

  playSound(isCorrect ? "correct" : "incorrect");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (isCorrect) {
    state.currentQuestionIndex++;
    console.log(
      "Incremented currentQuestionIndex to:",
      state.currentQuestionIndex
    );

    // Check if we've reached a safe haven (adjust for 0-based index)
    const currentLevel = state.currentQuestionIndex; // 0-based index after increment
    const safeHavenReached = SAFE_HAVENS.includes(currentLevel + 1); // Convert to 1-based for SAFE_HAVENS
    if (safeHavenReached && currentLevel < state.questions.length) {
      playSound("safe-haven");
      console.log("Safe haven reached at question:", currentLevel + 1);
      const walkAwayModal = document.getElementById(
        "walk-away-modal"
      ) as HTMLDivElement;
      if (walkAwayModal) {
        const prize = PRIZE_LADDER[currentLevel]; // Current winnings
        walkAwayModal.querySelector(
          "p"
        )!.innerHTML = `Would you like to walk away with <span class="text-yellow-400 font-bold">$${prize.toLocaleString()}</span>?`;
        walkAwayModal.classList.remove("hidden");
        return; // Wait for user decision before proceeding
      }
    }

    if (state.currentQuestionIndex < state.questions.length) {
      displayQuestion();
    } else {
      console.log("You won!");
      endGame(true, "Congratulations, you’ve won!");
    }
  } else {
    console.log("Ending game due to incorrect answer");
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
  } else {
    console.error("Question element not found in endGame");
  }

  // Reset answer buttons
  const answerButtons = [
    document.getElementById("answer-a") as HTMLButtonElement,
    document.getElementById("answer-b") as HTMLButtonElement,
    document.getElementById("answer-c") as HTMLButtonElement,
    document.getElementById("answer-d") as HTMLButtonElement,
  ].filter(Boolean);
  answerButtons.forEach((btn) => {
    if (btn) {
      btn.className =
        "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center";
      btn.disabled = false;
      btn.onclick = null;
      btn.classList.add("hidden"); // Hide until next game
    }
  });

  const gameUi = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelection = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;
  if (gameUi) gameUi.classList.add("hidden");
  else console.error("Game UI not found in endGame");
  if (difficultySelection) difficultySelection.classList.remove("hidden");
  else console.error("Difficulty selection not found in endGame");
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
  if (state.lifelinesUsed.fiftyFifty || !state.gameStarted) {
    console.log("50/50 already used or game not started");
    return;
  }

  console.log("Using 50/50 lifeline");
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const incorrectAnswers = [...currentQuestion.incorrect_answers];
  const remainingAnswers = [currentQuestion.correct_answer];
  const randomIncorrect = incorrectAnswers.splice(
    Math.floor(Math.random() * incorrectAnswers.length),
    1
  )[0];
  remainingAnswers.push(randomIncorrect);

  const newAnswers = remainingAnswers.sort(() => Math.random() - 0.5);

  state.lifelinesUsed.fiftyFifty = true;
  console.log("New answers after 50/50:", newAnswers);
  updateAnswers(newAnswers); // Update UI with only 2 answers
  updateLifelinesUI(state.lifelinesUsed); // Disable the button
  playSound("fifty-fifty");
  saveGame();
}

export function usePhoneFriend() {
  if (state.lifelinesUsed.phoneFriend || !state.gameStarted) return;

  console.log("Phone a Friend used");
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = Math.random() < PHONE_FRIEND_CORRECT_PROBABILITY;
  const friendAnswer = isCorrect
    ? currentQuestion.correct_answer
    : currentQuestion.incorrect_answers[Math.floor(Math.random() * 3)];

  // Placeholder friend names
  const friends = ["Alex", "Sam", "Jordan", "Taylor", "Casey"];
  const friendName = friends[Math.floor(Math.random() * friends.length)];

  const modal = document.getElementById("phone-friend-modal") as HTMLDivElement;
  if (modal) {
    modal.classList.remove("hidden");

    // Initial ringing state
    modal.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
        <p class="text-lg animate-pulse">Calling ${friendName}...</p>
      </div>
    `;
    playSound("phone-ringing"); // Assumes you have a ringing sound file

    // Simulate phone call sequence
    setTimeout(() => {
      modal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
          <p class="text-lg">${friendName}: Hello?</p>
        </div>
      `;
      playSound("phone-pickup"); // Optional: sound for picking up
    }, 2000); // 2 seconds of ringing

    setTimeout(() => {
      modal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
          <p class="text-lg">${friendName}: Hmm, I think it’s "${friendAnswer}" (${
        isCorrect ? "70%" : "30%"
      } confident)</p>
          <button id="close-phone" class="mt-4 px-4 py-2 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors">Hang Up</button>
        </div>
      `;
      document.getElementById("close-phone")?.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }, 3500); // 1.5 seconds after "Hello?"
  }

  state.lifelinesUsed.phoneFriend = true;
  updateLifelinesUI(state.lifelinesUsed);
  saveGame();
}

export function useAskAudience() {
  if (state.lifelinesUsed.askAudience || !state.gameStarted) return;

  console.log("Ask Audience used");
  const currentQuestion = state.questions[state.currentQuestionIndex];

  // Get current displayed answers from buttons
  const answerButtons = [
    document.getElementById("answer-a") as HTMLButtonElement,
    document.getElementById("answer-b") as HTMLButtonElement,
    document.getElementById("answer-c") as HTMLButtonElement,
    document.getElementById("answer-d") as HTMLButtonElement,
  ].filter(Boolean);

  const answers = answerButtons
    .map((btn) => (btn ? btn.textContent?.substring(3).trim() : ""))
    .filter((answer) => answer !== "");

  // Simulate audience voting
  const votes = answers.map((answer) => {
    if (answer === currentQuestion.correct_answer) {
      return Math.floor(Math.random() * 20) + AUDIENCE_VOTE_CORRECT_PERCENTAGE; // 60% base + random 0-20%
    }
    return Math.floor(Math.random() * 20); // 0-20% for incorrect
  });
  const total = votes.reduce((sum, vote) => sum + vote, 0);
  const percentages = votes.map((vote) => Math.round((vote / total) * 100));

  const modal = document.getElementById("audience-modal") as HTMLDivElement;
  if (modal) {
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg w-11/12 max-w-lg">
        <h3 class="text-xl mb-4">Audience Results:</h3>
        <div class="space-y-4">
          ${answers
            .map(
              (answer, i) => `
            <div>
              <div class="flex justify-between mb-1">
                <span>${String.fromCharCode(65 + i)}: ${answer}</span>
                <span>${percentages[i]}%</span>
              </div>
              <div class="w-full bg-gray-600 rounded-full h-4">
                <div class="bg-teal-600 h-4 rounded-full" style="width: ${
                  percentages[i]
                }%"></div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        <button id="close-audience" class="mt-4 px-4 py-2 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors">Close</button>
      </div>
    `;
    document.getElementById("close-audience")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  state.lifelinesUsed.askAudience = true;
  updateLifelinesUI(state.lifelinesUsed);
  playSound("ask-audience");
  saveGame();
}

export function walkAway(confirmed: boolean) {
  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  if (walkAwayModal) walkAwayModal.classList.add("hidden");

  if (confirmed) {
    console.log("Player chose to walk away");
    endGame(true, "Walked away");
  } else {
    console.log("Player chose to continue");
    if (state.currentQuestionIndex < state.questions.length) {
      displayQuestion(); // Continue to next question
    } else {
      endGame(true, "Congratulations, you’ve won!"); // Edge case: last question was a safe haven
    }
  }
}
