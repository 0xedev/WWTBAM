import { sdk } from "@farcaster/frame-sdk";
import { startGame, resumeGame, loadGame } from "../logic/GameLogic";
import { fetchCategories } from "../logic/Api";

// Mock context for local development
const isFarcasterEnvironment = !!window.parent; // Rough check for iframe-like embedding
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
    if (!context && !isFarcasterEnvironment) {
      console.log(
        "Not in Farcaster environment, using mock context in DifficultySelection"
      );
      context = mockContext;
    } else if (!context) {
      console.warn("sdk.context is undefined even in Farcaster environment");
      context = mockContext; // Fallback anyway
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
    <div id="difficulty-selection" class="text-center">
      <h1 class="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">Who Wants to Be a Millionaire</h1>
      <p class="text-lg md:text-2xl mb-4">${welcomeMessage}</p>
      <p class="text-lg md:text-2xl mb-4">Select Category and Difficulty:</p>
      <div class="flex flex-col items-center space-y-3 mb-4">
        <select id="category-select" class="text-black">
          <option value="">Any Category</option>
        </select>
      </div>
      <div class="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4">
        <button id="easy-btn" class="px-4 py-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors text-base md:text-lg">Easy</button>
        <button id="medium-btn" class="px-4 py-2 bg-yellow-600 rounded-full hover:bg-yellow-700 transition-colors text-base md:text-lg">Medium</button>
        <button id="hard-btn" class="px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors text-base md:text-lg">Hard</button>
      </div>
      <button id="resume-btn" class="mt-4 px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors text-base md:text-lg hidden">Resume Game</button>
    </div>
  `;

  const categorySelect = document.getElementById(
    "category-select"
  ) as HTMLSelectElement;
  const easyBtn = document.getElementById("easy-btn") as HTMLButtonElement; // Fixed typo: 'get' -> 'getElementById'
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
