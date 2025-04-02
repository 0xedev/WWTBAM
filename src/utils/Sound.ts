// src/sound.ts
let isMuted = false;
let volume = 0.5;
let currentAudio: HTMLAudioElement | null = null;
let hasUserInteracted = false;

document.addEventListener(
  "click",
  () => {
    hasUserInteracted = true;
  },
  { once: true }
);

export function playSound(type: string) {
  if (isMuted || !hasUserInteracted) return;

  // Stop any currently playing sound
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = volume;
  audio
    .play()
    .catch((error) => console.error(`Error playing sound ${type}:`, error));
  currentAudio = audio;
}

export function toggleMute() {
  isMuted = !isMuted;
  if (isMuted && currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  return isMuted;
}

export function setVolume(newVolume: number) {
  volume = Math.max(0, Math.min(1, newVolume));
  if (currentAudio) {
    currentAudio.volume = volume;
  }
}
