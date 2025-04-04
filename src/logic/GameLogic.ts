import { GameState, TriviaQuestion } from "../utils/Types";
import { fetchQuestions } from "./Api";
import { updatePrizeLadder } from "../components/PrizeLadder";
import { updateQuestionUI, updateLifelinesUI } from "../uiUpdates";
import { updateAnswers } from "../components/GameUI";
import {
  PRIZE_LADDER,
  SAFE_HAVENS,
  PHONE_FRIEND_CORRECT_PROBABILITY,
  AUDIENCE_VOTE_CORRECT_PERCENTAGE,
  QUESTION_TIMER_SECONDS,
} from "../utils/Constants";
import { playSound } from "../utils/Sound";
import { sdk } from "@farcaster/frame-sdk";
import axios from "axios";

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
    difficulty,
    category,
  };

  const gameUi = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelection = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;
  const togglePrizeLadderBtn = document.getElementById(
    "toggle-prize-ladder"
  ) as HTMLButtonElement;

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

  // Show the prize ladder toggle button
  if (togglePrizeLadderBtn) {
    togglePrizeLadderBtn.classList.remove("hidden");
  }

  // Ensure all modals are hidden on start
  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  const prizeModal = document.getElementById("prize-modal") as HTMLDivElement;
  const phoneFriendModal = document.getElementById(
    "phone-friend-modal"
  ) as HTMLDivElement;
  const audienceModal = document.getElementById(
    "audience-modal"
  ) as HTMLDivElement;
  [walkAwayModal, prizeModal, phoneFriendModal, audienceModal].forEach(
    (modal) => {
      if (modal) modal.classList.add("hidden");
    }
  );

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
      const modal = document.getElementById("modals-container") as HTMLElement;
      if (modal) {
        modal.innerHTML = `
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
              <h2 class="text-xl mb-4 text-red-400">Error</h2>
              <p class="text-lg mb-4">${error.message}</p>
              <button id="close-error" class="px-4 py-2 bg-gray-600 rounded-full hover:bg-gray-700">OK</button>
            </div>
          </div>
        `;
        document
          .getElementById("close-error")
          ?.addEventListener("click", () => {
            modal.innerHTML = "";
            gameUi?.classList.add("hidden");
            difficultySelection?.classList.remove("hidden");
            // Hide lifelines since game UI is hidden
            const lifelinesContainer = document.getElementById(
              "lifelines-container"
            ) as HTMLDivElement;
            if (lifelinesContainer) {
              console.log(
                "Hiding lifelines container after error modal (game not started)"
              );
              lifelinesContainer.classList.add("hidden");
            }
          });
      }
    });
}

export function resumeGame(savedGame: GameState): boolean {
  if (
    !savedGame ||
    savedGame.currentQuestionIndex >= savedGame.questions.length ||
    !savedGame.gameStarted
  ) {
    clearGame();
    return false;
  }

  // Restore the state
  state = {
    ...savedGame,
    gameStarted: true,
    lifelinesUsed: savedGame.lifelinesUsed || {
      fiftyFifty: false,
      phoneFriend: false,
      askAudience: false,
    },
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

  // Ensure all modals are hidden on resume
  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  const prizeModal = document.getElementById("prize-modal") as HTMLDivElement;
  const phoneFriendModal = document.getElementById(
    "phone-friend-modal"
  ) as HTMLDivElement;
  const audienceModal = document.getElementById(
    "audience-modal"
  ) as HTMLDivElement;
  [walkAwayModal, prizeModal, phoneFriendModal, audienceModal].forEach(
    (modal) => {
      if (modal) modal.classList.add("hidden");
    }
  );

  // Update UI based on restored state
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const answers = getAnswers(currentQuestion);
  const answerButtons = getAnswerButtons();
  const normalizedQuestion = normalizeQuestionText(currentQuestion.question); // Normalize the question text
  console.log("Resuming game with normalized question:", normalizedQuestion);
  updateQuestionUI(normalizedQuestion, answers, answerButtons, handleAnswer);
  updatePrizeLadder(state.currentQuestionIndex);
  updateLifelinesUI(state.lifelinesUsed);

  startTimer(() => endGame(false, "Time’s up!"));
  return true;
}

// Helper function to normalize question text
function normalizeQuestionText(text: string): string {
  // Decode HTML entities (e.g., &quot; to ", &nbsp; to space)
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  let normalized = textArea.value;

  // Replace smart quotes with straight quotes
  normalized = normalized
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  // Remove extra spaces around quotation marks
  normalized = normalized.replace(/"\s+/g, '"').replace(/\s+"/g, '"');

  // Replace multiple spaces with a single space
  normalized = normalized.replace(/\s+/g, " ");

  // Trim any leading/trailing spaces
  normalized = normalized.trim();

  return normalized;
}

// Helper functions to get answers and buttons (used in displayQuestion and resumeGame)
function getAnswers(question: TriviaQuestion): string[] {
  return [...question.incorrect_answers, question.correct_answer].sort(
    () => Math.random() - 0.5
  );
}

function getAnswerButtons(): HTMLButtonElement[] {
  return [
    document.getElementById("answer-a") as HTMLButtonElement,
    document.getElementById("answer-b") as HTMLButtonElement,
    document.getElementById("answer-c") as HTMLButtonElement,
    document.getElementById("answer-d") as HTMLButtonElement,
  ].filter(Boolean);
}

function displayQuestion() {
  const question = state.questions[state.currentQuestionIndex];
  const answers = getAnswers(question);
  const answerButtons = getAnswerButtons();
  const normalizedQuestion = normalizeQuestionText(question.question);
  const questionEl = document.getElementById("question") as HTMLDivElement;
  if (questionEl) {
    // Log the raw question text
    console.log("Raw question text:", question.question);
    // Normalize the question text

    console.log("Normalized question text:", normalizedQuestion);
    questionEl.textContent = normalizedQuestion;
  } else {
    console.error("Question element not found");
  }

  // Reset all answer buttons before updating
  answerButtons.forEach((btn) => {
    if (btn) {
      btn.className =
        "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center";
      btn.disabled = false;
      btn.classList.remove("hidden");
      btn.onclick = null;
    }
  });

  console.log("Updating answers:", answers);
  // Pass the normalized question text to updateQuestionUI
  updateQuestionUI(normalizedQuestion, answers, answerButtons, handleAnswer);
  updatePrizeLadder(state.currentQuestionIndex);
  updateLifelinesUI(state.lifelinesUsed);
  startTimer(() => endGame(false, "Time’s up!"));
  saveGame();

  // Always show lifelines when displaying a new question
  const lifelinesContainer = document.getElementById(
    "lifelines-container"
  ) as HTMLDivElement;
  if (lifelinesContainer) {
    console.log(
      "Showing lifelines container for question",
      state.currentQuestionIndex + 1
    );
    lifelinesContainer.classList.remove("hidden");
    // Also ensure the inner lifelines div is shown (if it exists)
    const lifelinesEl = document.getElementById("lifelines") as HTMLDivElement;
    if (lifelinesEl) {
      console.log(
        "Ensuring inner lifelines div is visible for question",
        state.currentQuestionIndex + 1
      );
      lifelinesEl.classList.remove("hidden");
    }
  } else {
    console.error("Lifelines container not found");
  }
}
// handle answer function
export async function handleAnswer(
  selectedAnswer: string,
  selectedBtn: HTMLButtonElement
) {
  console.log("handleAnswer called with:", selectedAnswer);
  stopTimer();
  const lifelinesContainer = document.getElementById(
    "lifelines-container"
  ) as HTMLDivElement;
  if (lifelinesContainer) {
    console.log("Hiding lifelines container during answer animation");
    lifelinesContainer.classList.add("hidden");
  } else {
    console.error("Lifelines container not found in handleAnswer");
  }

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

  const answerButtons = getAnswerButtons();

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

        // Add event listeners for Yes/No buttons
        const yesBtn = document.getElementById(
          "walk-away-yes"
        ) as HTMLButtonElement;
        const noBtn = document.getElementById(
          "walk-away-no"
        ) as HTMLButtonElement;
        if (yesBtn && noBtn) {
          yesBtn.onclick = () => walkAway(true);
          noBtn.onclick = () => walkAway(false);
        } else {
          console.error("Walk away buttons not found");
        }

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

export async function endGame(walkAway: boolean, message: string) {
  stopTimer();

  const safeHavensBelow = SAFE_HAVENS.filter(
    (h) => h <= state.currentQuestionIndex
  );

  const lastSafeHaven = safeHavensBelow.pop() || 0;

  const prize = walkAway
    ? PRIZE_LADDER[state.currentQuestionIndex - 1] || 0
    : PRIZE_LADDER[lastSafeHaven - 1] || 0;
  console.log("Calculated prize:", prize);

  // Mock context for local development
  const isLocalDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const isFarcasterEnvironment = !!window.parent && !isLocalDev;
  const mockContext = {
    user: { fid: 9999, username: "LocalTester", displayName: "Local Tester" },
    client: {
      clientFid: 0,
      added: false,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      notificationDetails: null,
    },
  };

  // Send notification if notifications are enabled
  let context;
  try {
    context = await sdk.context;
    if (!context && isFarcasterEnvironment) {
      console.warn("sdk.context is undefined even in Farcaster environment");
      context = mockContext;
    } else if (!context) {
      console.log(
        "Not in Farcaster environment, using mock context in endGame"
      );
      context = mockContext;
    }
  } catch (error) {
    console.error("Error resolving sdk.context in endGame:", error);
    context = mockContext;
  }

  const notificationDetails = context.client.notificationDetails;
  if (notificationDetails && prize > 0) {
    const notificationPayload = {
      notificationId: `wwtbam-${Date.now()}`,
      title: "WWTBAM Update",
      body: `You won $${prize.toLocaleString()}!`,
      targetUrl: "https://yourdomain.com/",
      tokens: [notificationDetails.token],
    };
    try {
      await axios.post(notificationDetails.url, notificationPayload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  // Reset answer buttons
  const answerButtons = getAnswerButtons();
  answerButtons.forEach((btn) => {
    if (btn) {
      btn.className =
        "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center";
      btn.disabled = false;
      btn.onclick = null;
      btn.classList.add("hidden");
    }
  });

  // Hide game UI and show difficulty selection
  const gameUi = document.getElementById("game-ui") as HTMLDivElement;
  const difficultySelection = document.getElementById(
    "difficulty-selection"
  ) as HTMLDivElement;
  const togglePrizeLadderBtn = document.getElementById(
    "toggle-prize-ladder"
  ) as HTMLButtonElement;
  if (gameUi) gameUi.classList.add("hidden");
  else console.error("Game UI not found in endGame");
  if (difficultySelection) difficultySelection.classList.remove("hidden");
  else console.error("Difficulty selection not found in endGame");
  if (togglePrizeLadderBtn) togglePrizeLadderBtn.classList.add("hidden");

  // Show prize announcement modal
  const prizeModal = document.getElementById("prize-modal") as HTMLDivElement;
  if (prizeModal) {
    playSound(prize > 0 ? "win" : "lose");
    const isWin = message === "Congratulations, you’ve won!";
    prizeModal.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
        <h2 class="text-2xl md:text-3xl mb-4 ${
          isWin ? "text-yellow-400" : "text-white"
        }">
          ${isWin ? "Congratulations!" : "Game Over"}
        </h2>
        <p class="text-lg md:text-xl mb-4">
          You walk away with <span class="font-bold text-yellow-400 animate-bounce">$${prize.toLocaleString()}</span>!
        </p>
        <button id="close-prize" class="px-4 py-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors text-sm md:text-base">OK</button>
      </div>
    `;
    prizeModal.classList.remove("hidden");
    document.getElementById("close-prize")?.addEventListener("click", () => {
      prizeModal.classList.add("hidden");
      // Hide lifelines since game UI is hidden
      const lifelinesContainer = document.getElementById(
        "lifelines-container"
      ) as HTMLDivElement;
      if (lifelinesContainer) {
        console.log(
          "Hiding lifelines container after prize modal (game ended)"
        );
        lifelinesContainer.classList.add("hidden");
      }
    });
  } else {
    console.error("Prize modal not found");
  }

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
  }, 1000) as unknown as number; // TypeScript fix for Node vs Browser setInterval
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
  updateAnswers(newAnswers);
  updateLifelinesUI(state.lifelinesUsed);
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
    playSound("phone-ringing");

    // Simulate phone call sequence
    setTimeout(() => {
      modal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
          <p class="text-lg">${friendName}: Hello?</p>
        </div>
      `;
      playSound("phone-pickup");
    }, 2000);

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
        // Show lifelines after closing the modal
        const lifelinesContainer = document.getElementById(
          "lifelines-container"
        ) as HTMLDivElement;
        if (lifelinesContainer && state.gameStarted) {
          console.log(
            "Showing lifelines container after closing phone friend modal"
          );
          lifelinesContainer.classList.remove("hidden");
          const lifelinesEl = document.getElementById(
            "lifelines"
          ) as HTMLDivElement;
          if (lifelinesEl) {
            console.log(
              "Ensuring inner lifelines div is visible after phone friend modal"
            );
            lifelinesEl.classList.remove("hidden");
          }
        }
      });
    }, 3500);
  } else {
    console.error("Phone friend modal not found");
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
  const answerButtons = getAnswerButtons();
  const answers = answerButtons
    .map((btn) => (btn ? btn.textContent?.substring(3).trim() : ""))
    .filter((answer) => answer !== "");

  // Simulate audience voting
  const votes = answers.map((answer) => {
    if (answer === currentQuestion.correct_answer) {
      return Math.floor(Math.random() * 20) + AUDIENCE_VOTE_CORRECT_PERCENTAGE;
    }
    return Math.floor(Math.random() * 20);
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
      // Show lifelines after closing the modal
      const lifelinesContainer = document.getElementById(
        "lifelines-container"
      ) as HTMLDivElement;
      if (lifelinesContainer && state.gameStarted) {
        console.log("Showing lifelines container after closing audience modal");
        lifelinesContainer.classList.remove("hidden");
        const lifelinesEl = document.getElementById(
          "lifelines"
        ) as HTMLDivElement;
        if (lifelinesEl) {
          console.log(
            "Ensuring inner lifelines div is visible after audience modal"
          );
          lifelinesEl.classList.remove("hidden");
        }
      }
    });
  } else {
    console.error("Audience modal not found");
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
      displayQuestion();
    } else {
      endGame(true, "Congratulations, you’ve won!");
    }
    // Show lifelines after closing the walk-away modal (if continuing)
    const lifelinesContainer = document.getElementById(
      "lifelines-container"
    ) as HTMLDivElement;
    if (lifelinesContainer && state.gameStarted) {
      console.log(
        "Showing lifelines container after closing walk-away modal (continuing)"
      );
      lifelinesContainer.classList.remove("hidden");
      const lifelinesEl = document.getElementById(
        "lifelines"
      ) as HTMLDivElement;
      if (lifelinesEl) {
        console.log(
          "Ensuring inner lifelines div is visible after walk-away modal"
        );
        lifelinesEl.classList.remove("hidden");
      }
    }
  }
}
