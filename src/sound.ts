// src/sound.ts
let isMuted = false;
let volume = 0.5;

export function playSound(type: string) {
  if (isMuted) return;
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = volume;
  audio
    .play()
    .catch((error) => console.error(`Error playing sound ${type}:`, error));
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function setVolume(newVolume: number) {
  volume = Math.max(0, Math.min(1, newVolume));
}
