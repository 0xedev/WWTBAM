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
import { fetchCategories } from "./api";

// Initialize event listeners for difficulty selection
const easyBtn = document.getElementById("easy-btn") as HTMLButtonElement | null;
const mediumBtn = document.getElementById(
  "medium-btn"
) as HTMLButtonElement | null;
const hardBtn = document.getElementById("hard-btn") as HTMLButtonElement | null;
const resumeBtn = document.getElementById(
  "resume-btn"
) as HTMLButtonElement | null;
const categorySelect = document.getElementById(
  "category-select"
) as HTMLSelectElement | null;

// Lifeline buttons
const fiftyFiftyBtn = document.getElementById(
  "fifty-fifty"
) as HTMLButtonElement | null;
const phoneFriendBtn = document.getElementById(
  "phone-friend"
) as HTMLButtonElement | null;
const askAudienceBtn = document.getElementById(
  "ask-audience"
) as HTMLButtonElement | null;

// Modal close buttons
const histogramCloseBtn = document.getElementById(
  "histogram-close"
) as HTMLButtonElement | null;
const phoneCloseBtn = document.getElementById(
  "phone-close"
) as HTMLButtonElement | null;

// Restart button
const startBtn = document.getElementById(
  "start-btn"
) as HTMLButtonElement | null;

// Initialize the game
async function initializeGame() {
  // Check for required DOM elements
  if (!categorySelect) {
    console.error("Category select element not found in the DOM.");
    return;
  }
  if (!easyBtn || !mediumBtn || !hardBtn || !resumeBtn) {
    console.error("Difficulty selection buttons not found in the DOM.");
    return;
  }
  if (!fiftyFiftyBtn || !phoneFriendBtn || !askAudienceBtn) {
    console.error("Lifeline buttons not found in the DOM.");
    return;
  }
  if (!histogramCloseBtn || !phoneCloseBtn) {
    console.error("Modal close buttons not found in the DOM.");
    return;
  }
  if (!startBtn) {
    console.error("Start button not found in the DOM.");
    return;
  }

  // Fetch and populate categories
  try {
    const categories = await fetchCategories();
    categories.forEach((category: { id: number; name: string }) => {
      const option = document.createElement("option");
      option.value = category.id.toString();
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load categories:", error);
  }

  // Check if a saved game exists and show the resume button if so
  const hasSavedGame = resumeGame();
  if (hasSavedGame) {
    resumeBtn.classList.remove("hidden");
  } else {
    resumeBtn.classList.add("hidden");
  }

  // Set up difficulty selection
  const getSelectedCategory = () => {
    const category = categorySelect.value
      ? Number(categorySelect.value)
      : undefined;
    return category;
  };

  easyBtn.addEventListener("click", () =>
    startGame("easy", getSelectedCategory())
  );
  mediumBtn.addEventListener("click", () =>
    startGame("medium", getSelectedCategory())
  );
  hardBtn.addEventListener("click", () =>
    startGame("hard", getSelectedCategory())
  );
  resumeBtn.addEventListener("click", () => resumeGame());

  // Set up lifelines
  fiftyFiftyBtn.addEventListener("click", useFiftyFifty);
  phoneFriendBtn.addEventListener("click", usePhoneFriend);
  askAudienceBtn.addEventListener("click", useAskAudience);

  // Set up walk away modal buttons
  const walkAwayYesBtn = document.getElementById(
    "walk-away-yes"
  ) as HTMLButtonElement | null;
  const walkAwayNoBtn = document.getElementById(
    "walk-away-no"
  ) as HTMLButtonElement | null;
  if (!walkAwayYesBtn || !walkAwayNoBtn) {
    console.error("Walk away modal buttons not found in the DOM.");
    return;
  }
  walkAwayYesBtn.addEventListener("click", () => walkAway(true));
  walkAwayNoBtn.addEventListener("click", () => walkAway(false));

  // Set up modal close buttons
  histogramCloseBtn.addEventListener("click", () => {
    const audienceHistogramEl = document.getElementById(
      "audience-histogram"
    ) as HTMLDivElement;
    if (audienceHistogramEl) {
      audienceHistogramEl.classList.add("hidden");
    }
  });
  phoneCloseBtn.addEventListener("click", () => {
    const phoneConversationEl = document.getElementById(
      "phone-conversation"
    ) as HTMLDivElement;
    if (phoneConversationEl) {
      phoneConversationEl.classList.add("hidden");
    }
  });

  // Set up restart button
  startBtn.addEventListener("click", () => {
    const difficultySelectionEl = document.getElementById(
      "difficulty-selection"
    ) as HTMLDivElement;
    const gameUiEl = document.getElementById("game-ui") as HTMLDivElement;
    if (!difficultySelectionEl || !gameUiEl) {
      console.error("Difficulty selection or game UI elements not found.");
      return;
    }
    difficultySelectionEl.style.display = "block";
    gameUiEl.classList.add("hidden");
    startBtn.style.display = "none";
    const questionEl = document.getElementById("question") as HTMLDivElement;
    if (questionEl) {
      questionEl.textContent = "";
    }
    const answerButtons = [
      document.getElementById("answer-a") as HTMLButtonElement,
      document.getElementById("answer-b") as HTMLButtonElement,
      document.getElementById("answer-c") as HTMLButtonElement,
      document.getElementById("answer-d") as HTMLButtonElement,
    ];
    answerButtons.forEach((btn) => {
      if (btn) {
        btn.classList.remove("hidden");
      }
    });
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

// Start the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeGame();
});
