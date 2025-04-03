import {
  useFiftyFifty,
  usePhoneFriend,
  useAskAudience,
} from "../logic/GameLogic";
import { updateLifelinesUI } from "../uiUpdates";
import { state } from "../logic/GameLogic";

export function renderLifelines(container: HTMLElement) {
  container.innerHTML = `
    <div id="lifelines" class="flex justify-center space-x-4 mt-6 mb-4">
      <button id="fifty-fifty" class="relative px-3 py-1 md:px-4 md:py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 active:bg-purple-800 transition-all flex items-center justify-center text-sm md:text-base font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md" title="50:50">
        <span class="relative z-10">50:50</span>
        <span class="absolute inset-0 bg-white opacity-20 rounded-full transform scale-0 transition-transform group-hover:scale-100"></span>
      </button>
      <button id="phone-friend" class="relative px-3 py-1 md:px-4 md:py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 active:bg-orange-800 transition-all flex items-center justify-center text-sm md:text-base font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md" title="Phone a Friend">
        <span class="relative z-10">Phone</span>
        <span class="absolute inset-0 bg-white opacity-20 rounded-full transform scale-0 transition-transform group-hover:scale-100"></span>
      </button>
      <button id="ask-audience" class="relative px-3 py-1 md:px-4 md:py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 active:bg-teal-800 transition-all flex items-center justify-center text-sm md:text-base font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md" title="Ask the Audience">
        <span class="relative z-10">Audience</span>
        <span class="absolute inset-0 bg-white opacity-20 rounded-full transform scale-0 transition-transform group-hover:scale-100"></span>
      </button>
    </div>
  `;

  // Add custom CSS to document
  const style = document.createElement("style");
  style.textContent = `
    #lifelines button {
      position: relative;
      overflow: hidden;
    }
    
    #lifelines button::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
      border-radius: 9999px;
    }
    
    #lifelines button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    #lifelines button:disabled:hover {
      transform: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      background: inherit;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }
    
    #lifelines button:not(:disabled):hover {
      animation: pulse 1.5s infinite;
    }
  `;
  document.head.appendChild(style);

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

  // Add custom icons to buttons
  fiftyFiftyBtn.innerHTML = `
    <span class="mr-1">50:50</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;

  phoneFriendBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
    <span>Phone</span>
  `;

  askAudienceBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <span>Audience</span>
  `;

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
