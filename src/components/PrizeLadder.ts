// src/components/PrizeLadder.ts
import { PRIZE_LADDER, SAFE_HAVENS } from "../utils/Constants";
import { state } from "../logic/GameLogic"; // Import game state to check if game has started

export function renderPrizeLadder(container: HTMLElement) {
  container.innerHTML = `
    <button id="toggle-prize-ladder" class="px-3 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors text-sm md:text-base hidden">Show Prize Ladder</button>
    <div id="prize-ladder-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
      <div class="bg-gray-800 p-4 rounded-lg max-h-[80vh] overflow-y-auto w-full max-w-md">
        <h2 class="text-xl md:text-2xl font-bold mb-4 text-yellow-400">Prize Ladder</h2>
        <div id="prize-ladder" class="space-y-2"></div>
        <button id="close-prize-ladder" class="mt-4 px-3 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors text-sm md:text-base">Close</button>
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById(
    "toggle-prize-ladder"
  ) as HTMLButtonElement;
  const closeBtn = document.getElementById(
    "close-prize-ladder"
  ) as HTMLButtonElement;
  const modal = document.getElementById("prize-ladder-modal") as HTMLDivElement;

  // Show the toggle button only if the game has started
  if (state.gameStarted) {
    toggleBtn.classList.remove("hidden");
  }

  toggleBtn.onclick = () => modal.classList.remove("hidden");
  closeBtn.onclick = () => modal.classList.add("hidden");
}

export function updatePrizeLadder(currentQuestionIndex: number) {
  const prizeLadder = document.getElementById("prize-ladder") as HTMLDivElement;
  if (!prizeLadder) {
    console.error("Prize ladder container not found");
    return;
  }

  prizeLadder.innerHTML = PRIZE_LADDER.map((amount, index) => {
    const isCurrent = index === currentQuestionIndex;
    const isSafeHaven = SAFE_HAVENS.includes(index + 1);
    const bgClass = isCurrent
      ? "bg-yellow-400 text-black"
      : isSafeHaven
      ? "bg-green-600"
      : "bg-gray-600";
    return `
      <div class="${bgClass} p-2 rounded text-sm md:text-base flex justify-between">
        <span>Question ${index + 1}</span>
        <span>$${amount.toLocaleString()}</span>
      </div>
    `;
  })
    .reverse()
    .join("");
}
