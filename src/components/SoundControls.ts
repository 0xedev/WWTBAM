import { toggleMute, setVolume } from "../utils/sound";

export function renderSoundControls(container: HTMLElement) {
  container.innerHTML += `
    <div class="absolute top-2 left-2 flex space-x-2">
      <button id="mute-btn" class="px-2 py-1 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors text-sm">Mute</button>
      <input id="volume-slider" type="range" min="0" max="1" step="0.1" value="0.5" class="w-20" />
    </div>
  `;

  const muteBtn = document.getElementById("mute-btn") as HTMLButtonElement;
  const volumeSlider = document.getElementById(
    "volume-slider"
  ) as HTMLInputElement;

  muteBtn.addEventListener("click", () => {
    const isMuted = toggleMute();
    muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  });
  volumeSlider.addEventListener("input", () =>
    setVolume(Number(volumeSlider.value))
  );
}
