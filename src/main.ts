// src/main.ts
import "./style.css";
import {
  startGame,
  useFiftyFifty,
  usePhoneFriend,
  useAskAudience,
  walkAway,
  setupKeyboardSupport,
  setupSoundControls,
  resumeGame,
} from "./gameLogic";

// Initialize event listeners for difficulty selection
const easyBtn = document.getElementById("easy-btn") as HTMLButtonElement;
const mediumBtn = document.getElementById("medium-btn") as HTMLButtonElement;
const hardBtn = document.getElementById("hard-btn") as HTMLButtonElement;
const resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;

// Lifeline buttons
const fiftyFiftyBtn = document.getElementById(
  "fifty-fifty"
) as HTMLButtonElement;
const phoneFriendBtn = document.getElementById(
  "phone-friend"
) as HTMLButtonElement;
const askAudienceBtn = document.getElementById(
  "ask-audience"
) as HTMLButtonElement;

// Walk away button
const walkAwayBtn = document.getElementById("walk-away") as HTMLButtonElement;

// Modal close buttons
const histogramCloseBtn = document.getElementById(
  "histogram-close"
) as HTMLButtonElement;
const phoneCloseBtn = document.getElementById(
  "phone-close"
) as HTMLButtonElement;

// Restart button
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;

// Initialize the game
function initializeGame() {
  // Check if a saved game exists and show the resume button if so
  const hasSavedGame = resumeGame();
  if (hasSavedGame) {
    resumeBtn.classList.remove("hidden");
  }

  // Set up difficulty selection
  easyBtn.addEventListener("click", () => startGame("easy"));
  mediumBtn.addEventListener("click", () => startGame("medium"));
  hardBtn.addEventListener("click", () => startGame("hard"));
  resumeBtn.addEventListener("click", () => resumeGame());

  // Set up lifelines
  fiftyFiftyBtn.addEventListener("click", useFiftyFifty);
  phoneFriendBtn.addEventListener("click", usePhoneFriend);
  askAudienceBtn.addEventListener("click", useAskAudience);

  // Set up walk away
  walkAwayBtn.addEventListener("click", walkAway);

  // Set up modal close buttons
  histogramCloseBtn.addEventListener("click", () => {
    const audienceHistogramEl = document.getElementById(
      "audience-histogram"
    ) as HTMLDivElement;
    audienceHistogramEl.classList.add("hidden");
  });
  phoneCloseBtn.addEventListener("click", () => {
    const phoneConversationEl = document.getElementById(
      "phone-conversation"
    ) as HTMLDivElement;
    phoneConversationEl.classList.add("hidden");
  });

  // Set up restart button
  startBtn.addEventListener("click", () => {
    const difficultySelectionEl = document.getElementById(
      "difficulty-selection"
    ) as HTMLDivElement;
    const gameUiEl = document.getElementById("game-ui") as HTMLDivElement;
    difficultySelectionEl.style.display = "block";
    gameUiEl.classList.add("hidden");
    startBtn.style.display = "none";
    const questionEl = document.getElementById("question") as HTMLDivElement;
    questionEl.textContent = "";
    const answerButtons = [
      document.getElementById("answer-a") as HTMLButtonElement,
      document.getElementById("answer-b") as HTMLButtonElement,
      document.getElementById("answer-c") as HTMLButtonElement,
      document.getElementById("answer-d") as HTMLButtonElement,
    ];
    answerButtons.forEach((btn) => btn.classList.remove("hidden"));
    const hasSavedGame = resumeGame();
    if (hasSavedGame) {
      resumeBtn.classList.remove("hidden");
    } else {
      resumeBtn.classList.add("hidden");
    }
  });

  // Set up keyboard support
  setupKeyboardSupport();

  // Set up sound controls
  setupSoundControls();
}

// Start the game
initializeGame();
