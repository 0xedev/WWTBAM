// src/components/SoundControls.ts
import { toggleMute, setVolume } from "../utils/Sound";

export function renderSoundControls(container: HTMLElement) {
  container.innerHTML += `
    <div class="absolute top-4 left-4 flex space-x-2 items-center">
      <button id="mute-btn" class="relative px-3 py-1 bg-gray-700/80 backdrop-blur-sm text-white rounded-full hover:bg-gray-600/80 transition-all duration-300 shadow-md text-sm flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 5.586a2 2 0 000 2.828L10.172 12l-4.586 4.586a2 2 0 102.828 2.828L13 14.828l4.586 4.586a2 2 0 102.828-2.828L15.828 12l4.586-4.586a2 2 0 10-2.828-2.828L13 9.172 8.414 4.586a2 2 0 00-2.828 0z" class="mute-icon" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8v8M8 5l4 4 4-4M8 19l4-4 4 4" class="unmute-icon hidden" />
        </svg>
        <span>Mute</span>
      </button>
      <input id="volume-slider" type="range" min="0" max="1" step="0.1" value="0.5" class="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer" />
    </div>
  `;

  const muteBtn = document.getElementById("mute-btn") as HTMLButtonElement;
  const volumeSlider = document.getElementById(
    "volume-slider"
  ) as HTMLInputElement;

  const muteIcon = muteBtn.querySelector(".mute-icon") as HTMLElement;
  const unmuteIcon = muteBtn.querySelector(".unmute-icon") as HTMLElement;

  muteBtn.addEventListener("click", () => {
    const isMuted = toggleMute();
    muteBtn.querySelector("span")!.textContent = isMuted ? "Unmute" : "Mute";
    if (isMuted) {
      muteIcon.classList.add("hidden");
      unmuteIcon.classList.remove("hidden");
    } else {
      muteIcon.classList.remove("hidden");
      unmuteIcon.classList.add("hidden");
    }
  });

  volumeSlider.addEventListener("input", () =>
    setVolume(Number(volumeSlider.value))
  );

  // Style the range input
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      background: #facc15;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
    }
    input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: #facc15;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
    }
  `;
  document.head.appendChild(styleElement);
}
