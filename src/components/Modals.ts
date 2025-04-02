import { walkAway } from "../logic/GameLogic";

export function renderModals(container: HTMLElement) {
  container.innerHTML += `
    <div id="walk-away-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
      <div class="bg-gray-800 p-4 md:p-6 rounded-lg w-11/12 max-w-md">
        <h2 class="text-xl md:text-2xl mb-4">Walk Away?</h2>
        <p class="text-base md:text-lg mb-4">Would you like to walk away with your current winnings?</p>
        <div class="flex justify-center space-x-4">
          <button id="walk-away-yes" class="px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors text-sm md:text-base">Yes</button>
          <button id="walk-away-no" class="px-4 py-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors text-sm md:text-base">No</button>
        </div>
      </div>
    </div>
    <div id="phone-friend-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden"></div>
    <div id="audience-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden"></div>
    <div id="prize-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden"></div>
  `;

  const walkAwayModal = document.getElementById(
    "walk-away-modal"
  ) as HTMLDivElement;
  const walkAwayYes = document.getElementById(
    "walk-away-yes"
  ) as HTMLButtonElement;
  const walkAwayNo = document.getElementById(
    "walk-away-no"
  ) as HTMLButtonElement;

  walkAwayYes.addEventListener("click", () => {
    walkAway(true);
  });
  walkAwayNo.addEventListener("click", () => {
    walkAway(false);
  });
}
