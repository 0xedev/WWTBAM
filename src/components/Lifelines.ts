import {
  useFiftyFifty,
  usePhoneFriend,
  useAskAudience,
} from "../logic/GameLogic";
import { updateLifelinesUI } from "../uiUpdates";
import { state } from "../logic/GameLogic";

export function renderLifelines(container: HTMLElement) {
  container.innerHTML = `
    <div id="lifelines" class="flex justify-center space-x-4 mt-4">
      <button id="fifty-fifty" class="px-3 py-1 md:px-4 md:py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors flex items-center text-sm md:text-base" title="50:50">50:50</button>
      <button id="phone-friend" class="px-3 py-1 md:px-4 md:py-2 bg-orange-600 rounded-full hover:bg-orange-700 transition-colors flex items-center text-sm md:text-base" title="Phone a Friend">Phone</button>
      <button id="ask-audience" class="px-3 py-1 md:px-4 md:py-2 bg-teal-600 rounded-full hover:bg-teal-700 transition-colors flex items-center text-sm md:text-base" title="Ask the Audience">Audience</button>
    </div>
  `;

  const fiftyFiftyBtn = document.getElementById(
    "fifty-fifty"
  ) as HTMLButtonElement;
  const phoneFriendBtn = document.getElementById(
    "phone-friend"
  ) as HTMLButtonElement;
  const askAudienceBtn = document.getElementById(
    "ask-audience"
  ) as HTMLButtonElement;

  if (!fiftyFiftyBtn || !phoneFriendBtn || !askAudienceBtn) {
    console.error("One or more lifeline buttons not found");
    return;
  }

  // Initially disable buttons until game starts
  fiftyFiftyBtn.disabled = !state.gameStarted;
  phoneFriendBtn.disabled = !state.gameStarted;
  askAudienceBtn.disabled = !state.gameStarted;

  fiftyFiftyBtn.onclick = (event) => {
    event.stopPropagation();
    console.log("50/50 button clicked");
    useFiftyFifty();
  };
  phoneFriendBtn.onclick = (event) => {
    event.stopPropagation();
    console.log("Phone Friend button clicked");
    usePhoneFriend();
  };
  askAudienceBtn.onclick = (event) => {
    event.stopPropagation();
    console.log("Ask Audience button clicked");
    useAskAudience();
  };

  console.log("Rendering lifelines with initial state:", state.lifelinesUsed);
  updateLifelinesUI(state.lifelinesUsed); // Initial state
}
