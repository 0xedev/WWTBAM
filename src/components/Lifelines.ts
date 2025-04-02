import {
  useFiftyFifty,
  usePhoneFriend,
  useAskAudience,
} from "../logic/GameLogic";

export function renderLifelines(container: HTMLElement) {
  container.innerHTML = `
    <div id="lifelines" class="flex justify-center space-x-4 mt-4">
      <button id="fifty-fifty" class="px-3 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors text-sm md:text-base" title="50:50">50:50</button>
      <button id="phone-friend" class="px-3 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors text-sm md:text-base" title="Phone a Friend">Phone</button>
      <button id="ask-audience" class="px-3 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors text-sm md:text-base" title="Ask the Audience">Audience</button>
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

  fiftyFiftyBtn.onclick = () => {
    useFiftyFifty();
    fiftyFiftyBtn.disabled = true;
    fiftyFiftyBtn.className =
      "px-3 py-2 bg-gray-600 rounded-full text-sm md:text-base cursor-not-allowed";
  };
  phoneFriendBtn.onclick = () => {
    usePhoneFriend();
    phoneFriendBtn.disabled = true;
    phoneFriendBtn.className =
      "px-3 py-2 bg-gray-600 rounded-full text-sm md:text-base cursor-not-allowed";
  };
  askAudienceBtn.onclick = () => {
    useAskAudience();
    askAudienceBtn.disabled = true;
    askAudienceBtn.className =
      "px-3 py-2 bg-gray-600 rounded-full text-sm md:text-base cursor-not-allowed";
  };

  // Initially visible (hidden only during answer feedback)
  const lifelines = document.getElementById("lifelines") as HTMLDivElement;
  lifelines.classList.remove("hidden");
}
