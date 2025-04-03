// src/components/PrizeLadder.ts
import { PRIZE_LADDER, SAFE_HAVENS } from "../utils/Constants";
import { state } from "../logic/GameLogic";

export function renderPrizeLadder(container: HTMLElement) {
  container.innerHTML = `
    <button id="toggle-prize-ladder" class="relative px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full hover:bg-purple-700 transition-colors text-sm md:text-base hidden shadow-md overflow-hidden">
      <span class="relative z-10">Show Prize Ladder</span>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>
    </button>
    <div id="in-game-prize-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm hidden transition-opacity duration-300">
      <div class="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-xl border border-yellow-500/30 w-11/12 max-w-md shadow-2xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-yellow-400">Prize Ladder</h2>
          <button id="close-prize-ladder" class="text-gray-400 hover:text-white transition-colors">
            Close
          </button>
        </div>
        <div id="prize-ladder" class="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-2"></div>
        <div class="mt-6 flex justify-center">
          <div class="text-center text-sm text-gray-400 mb-2">
            <span class="inline-block w-3 h-3 bg-green-500/40 border border-green-500 rounded-sm mr-1"></span> Safe Havens
          </div>
        </div>
      </div>
    </div>
  `;

  const styleElement = document.createElement("style");
  styleElement.textContent = `
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
    #close-prize-ladder {
      z-index: 1000 !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(styleElement);

  const toggleBtn = document.getElementById(
    "toggle-prize-ladder"
  ) as HTMLButtonElement;
  const modal = document.getElementById(
    "in-game-prize-modal"
  ) as HTMLDivElement;
  const lifelinesContainer = document.getElementById(
    "lifelines-container"
  ) as HTMLDivElement;

  if (!toggleBtn) {
    console.error("Toggle button not found in PrizeLadder.ts");
  }
  if (!modal) {
    console.error("Modal not found in PrizeLadder.ts");
  }
  if (!lifelinesContainer) {
    console.error("Lifelines container not found in PrizeLadder.ts");
  }

  if (state.gameStarted) {
    toggleBtn.classList.remove("hidden");
  }

  toggleBtn.addEventListener("click", () => {
    console.log("Toggle button clicked to open prize ladder modal");
    modal.classList.remove("hidden");
    if (lifelinesContainer) {
      console.log("Hiding lifelines while prize ladder modal is open");
      lifelinesContainer.classList.add("hidden");
    }
  });

  // Use event delegation for handling clicks on the modal
  modal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    console.log("Click detected on in-game prize ladder modal", target);

    // Handle close button click
    if (target.closest("#close-prize-ladder")) {
      event.stopPropagation();
      console.log("Close button clicked for in-game prize ladder modal");
      modal.classList.add("hidden");
      if (state.gameStarted && lifelinesContainer) {
        console.log("Showing lifelines after closing prize ladder modal");
        lifelinesContainer.classList.remove("hidden");
      }
      return;
    }

    // Handle outside click
    if (target === modal) {
      console.log("Outside click detected on in-game prize ladder modal");
      modal.classList.add("hidden");
      if (state.gameStarted && lifelinesContainer) {
        console.log(
          "Showing lifelines after closing prize ladder modal (outside click)"
        );
        lifelinesContainer.classList.remove("hidden");
      }
    }
  });
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
    // const isMillionaire = index === PRIZE_LADDER.length - 1;
    const bgClass = isCurrent
      ? "bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 border border-yellow-500/50"
      : isSafeHaven
      ? "bg-gradient-to-r from-green-500/20 to-green-700/20 border border-green-500/40"
      : "border-b border-gray-700";
    const textClass = isCurrent
      ? "text-yellow-300"
      : isSafeHaven
      ? "text-green-400"
      : "text-gray-300";
    return `
      <div class="${bgClass} p-2 rounded text-sm md:text-base flex justify-between">
        <span class="${textClass}">Question ${index + 1}</span>
        <span class="${textClass}">$${amount.toLocaleString()}</span>
      </div>
    `;
  })
    .reverse()
    .join("");
}
