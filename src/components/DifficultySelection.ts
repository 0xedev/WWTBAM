import { sdk } from "@farcaster/frame-sdk";
import { startGame, resumeGame, loadGame } from "../logic/GameLogic";
import { fetchCategories } from "../logic/Api";

// Mock context for local development
const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const isFarcasterEnvironment = !!window.parent && !isLocalDev; // Improved check
const mockContext = {
  user: { fid: 9999, username: "LocalTester", displayName: "Local Tester" },
  client: {
    clientFid: 0,
    added: false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  },
};

let isRendered = false;

export async function renderDifficultySelection(container: HTMLElement) {
  if (isRendered) return;
  isRendered = true;

  // Get context with fallback for local dev
  let context;
  try {
    context = await sdk.context;
    if (!context && isFarcasterEnvironment) {
      console.warn("sdk.context is undefined even in Farcaster environment");
      context = mockContext; // Fallback to mock context
    } else if (!context) {
      console.log(
        "Not in Farcaster environment, using mock context in DifficultySelection"
      );
      context = mockContext;
    }
  } catch (error) {
    console.error("Error resolving sdk.context in DifficultySelection:", error);
    context = mockContext;
  }

  const user = context.user;
  const welcomeMessage = user.username
    ? `Welcome, ${user.username}!`
    : `Welcome, FID ${user.fid}!`;

  container.innerHTML = `
    <div id="difficulty-selection" class="relative text-center min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <!-- Spotlight Background Effect -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-900/20 to-transparent animate-pulse-slow"></div>

      <!-- Title -->
      <h1 class="text-4xl md:text-6xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 tracking-wide animate-fade-in">
        Who Wants to Be a Millionaire
      </h1>

      <!-- Welcome Message -->
      <p class="text-lg md:text-2xl mb-4 text-gray-300 font-light animate-fade-in-delay-1">
        ${welcomeMessage}
      </p>

      <!-- Prompt -->
      <p class="text-md md:text-xl mb-8 text-gray-400 font-medium animate-fade-in-delay-2">
        Select Category and Difficulty
      </p>

      <!-- Category Dropdown -->
      <div class="flex flex-col items-center mb-8 w-full max-w-xs animate-fade-in-delay-3">
        <select id="category-select" class="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300">
          <option value="">Any Category</option>
        </select>
      </div>

      <!-- Difficulty Buttons -->
      <div class="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 mb-8 animate-fade-in-delay-4">
        <button id="easy-btn" class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-full shadow-lg hover:from-green-600 hover:to-green-800 hover:scale-105 transition-all duration-300">
          Easy
        </button>
        <button id="medium-btn" class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-semibold rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-800 hover:scale-105 transition-all duration-300">
          Medium
        </button>
        <button id="hard-btn" class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-full shadow-lg hover:from-red-600 hover:to-red-800 hover:scale-105 transition-all duration-300">
          Hard
        </button>
      </div>

      <!-- Resume Game and Show Prize Ladder Buttons -->
      <div class="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 animate-fade-in-delay-5">
        <button id="resume-btn" class="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-purple-800 hover:scale-105 transition-all duration-300 hidden">
          Resume Game
        </button>
        <button id="show-prize-ladder-btn" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-200 font-semibold rounded-full shadow-lg hover:from-gray-700 hover:to-gray-900 hover:scale-105 transition-all duration-300">
          Show Prize Ladder
        </button>
      </div>
    </div>
  `;

  const categorySelect = document.getElementById(
    "category-select"
  ) as HTMLSelectElement;
  const easyBtn = document.getElementById("easy-btn") as HTMLButtonElement;
  const mediumBtn = document.getElementById("medium-btn") as HTMLButtonElement;
  const hardBtn = document.getElementById("hard-btn") as HTMLButtonElement;
  const resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;

  fetchCategories().then((categories) => {
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id.toString();
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  });

  const savedGame = loadGame();
  if (savedGame) {
    resumeBtn.classList.remove("hidden");
    resumeBtn.addEventListener("click", () => resumeGame(savedGame));
  }

  const getCategoryId = () => {
    const value = categorySelect.value;
    return value ? parseInt(value, 10) : undefined;
  };

  easyBtn.addEventListener("click", () => startGame("easy", getCategoryId()));
  mediumBtn.addEventListener("click", () =>
    startGame("medium", getCategoryId())
  );
  hardBtn.addEventListener("click", () => startGame("hard", getCategoryId()));
}
