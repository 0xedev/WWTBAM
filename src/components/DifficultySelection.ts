// src/components/DifficultySelection.ts
import { sdk } from "@farcaster/frame-sdk";
import { startGame, resumeGame, loadGame } from "../logic/GameLogic";
import { fetchCategories } from "../logic/Api";
import { PRIZE_LADDER, SAFE_HAVENS } from "../utils/Constants";

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
      context = mockContext;
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

  const savedGame = loadGame();

  container.innerHTML = `
    <div id="difficulty-selection" class="relative flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 via-blue-950 to-black overflow-hidden">
      <!-- Spotlight Background Effect -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.3)_0%,transparent_60%)] animate-spotlight"></div>
      <!-- Subtle Grid Overlay -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>

      <!-- Sound Controls -->
      <div id="sound-controls-container" class="absolute top-4 right-4"></div>

      <!-- Title with Glow Effect -->
      <h1 class="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 tracking-wide animate-glow shadow-2xl">
        Who Wants to Be a Millionaire
      </h1>

      <!-- Welcome Message -->
      <p class="text-lg md:text-xl mb-2 text-gray-200 font-light animate-fade-in-delay-1">
        ${welcomeMessage}
      </p>

      <!-- Prompt -->
      <p class="text-md md:text-lg mb-6 text-gray-300 font-medium animate-fade-in-delay-2">
        Select Category and Difficulty
      </p>

      <!-- Category Dropdown -->
      <div class="flex flex-col items-center mb-6 w-full max-w-xs animate-fade-in-delay-3">
        <select id="category-select" class="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-sm text-gray-200 rounded-lg border-2 border-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 shadow-lg hover:bg-gray-700/80">
          <option value="">Any Category</option>
        </select>
      </div>

      <!-- Difficulty Buttons -->
      <div class="grid grid-cols-3 gap-4 mb-6 animate-fade-in-delay-4">
        <button id="easy-btn" class="relative px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-full shadow-lg hover:from-green-600 hover:to-green-800 hover:scale-105 transition-all duration-300 overflow-hidden">
          <span class="relative z-10">Easy</span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>
        </button>
        <button id="medium-btn" class="relative px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-semibold rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-800 hover:scale-105 transition-all duration-300 overflow-hidden">
          <span class="relative z-10">Medium</span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>
        </button>
        <button id="hard-btn" class="relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-full shadow-lg hover:from-red-600 hover:to-red-800 hover:scale-105 transition-all duration-300 overflow-hidden">
          <span class="relative z-10">Hard</span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="relative z-10 flex flex-col sm:flex-row gap-4">
        ${
          savedGame
            ? `<button id="resume-btn" class="relative px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-full shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="relative z-10">Resume Game</span>
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>
              </button>`
            : ""
        }
        <button id="show-prize-ladder-btn" class="relative px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-full shadow-lg hover:shadow-gray-600/40 hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span class="relative z-10">Prize Ladder</span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>
        </button>
      </div>

      <!-- Prize Ladder Modal -->
      <div id="prize-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm hidden transition-opacity duration-300">
        <div class="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-xl border border-yellow-500/30 w-11/12 max-w-md shadow-2xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-yellow-400">Prize Ladder</h2>
            <button id="close-prize-ladder" class="text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <ul class="space-y-2">
              ${PRIZE_LADDER.map((prize, index) => {
                const isSafe = SAFE_HAVENS.includes(index + 1);
                const isMillionaire = index === PRIZE_LADDER.length - 1;

                return `
                <li class="flex items-center justify-between py-2 px-3 rounded ${
                  isMillionaire
                    ? "bg-gradient-to-r from-yellow-500/30 to-yellow-700/30 border border-yellow-500/50"
                    : isSafe
                    ? "bg-gradient-to-r from-green-500/20 to-green-700/20 border border-green-500/40"
                    : "border-b border-gray-700"
                }">
                  <span class="font-medium text-sm ${
                    isMillionaire
                      ? "text-yellow-300"
                      : isSafe
                      ? "text-green-400"
                      : "text-gray-300"
                  }">Question ${index + 1}</span>
                  <span class="font-bold ${
                    isMillionaire
                      ? "text-yellow-300"
                      : isSafe
                      ? "text-green-400"
                      : "text-white"
                  }">$${prize.toLocaleString()}</span>
                </li>
                `;
              }).join("")}
            </ul>
          </div>
          <div class="mt-6 flex justify-center">
            <div class="text-center text-sm text-gray-400 mb-2">
              <span class="inline-block w-3 h-3 bg-green-500/40 border border-green-500 rounded-sm mr-1"></span> Safe Havens
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const styleElement = document.createElement("style");
  styleElement.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes spotlight {
      0% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.2); opacity: 0.5; }
      100% { transform: scale(1); opacity: 0.3; }
    }

    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(75, 85, 99, 0.2);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(107, 114, 128, 0.5);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.5);
    }
  `;
  document.head.appendChild(styleElement);

  const categorySelect = document.getElementById(
    "category-select"
  ) as HTMLSelectElement;
  const easyBtn = document.getElementById("easy-btn") as HTMLButtonElement;
  const mediumBtn = document.getElementById("medium-btn") as HTMLButtonElement;
  const hardBtn = document.getElementById("hard-btn") as HTMLButtonElement;
  const resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;
  const showPrizeLadderBtn = document.getElementById(
    "show-prize-ladder-btn"
  ) as HTMLButtonElement;
  const prizeModal = document.getElementById("prize-modal") as HTMLDivElement;
  const closePrizeLadderBtn = document.getElementById(
    "close-prize-ladder"
  ) as HTMLButtonElement;

  fetchCategories().then((categories) => {
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id.toString();
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  });

  const getCategoryId = () => {
    const value = categorySelect.value;
    return value ? parseInt(value, 10) : undefined;
  };

  if (resumeBtn) {
    resumeBtn.addEventListener("click", () => {
      if (savedGame) {
        resumeGame(savedGame);
      }
    });
  }

  easyBtn.addEventListener("click", () => startGame("easy", getCategoryId()));
  mediumBtn.addEventListener("click", () =>
    startGame("medium", getCategoryId())
  );
  hardBtn.addEventListener("click", () => startGame("hard", getCategoryId()));
  showPrizeLadderBtn.addEventListener("click", () => {
    prizeModal.classList.remove("hidden");
  });

  closePrizeLadderBtn.addEventListener("click", () => {
    prizeModal.classList.add("hidden");
  });

  prizeModal.addEventListener("click", (event) => {
    if (event.target === prizeModal) {
      prizeModal.classList.add("hidden");
    }
  });
}
