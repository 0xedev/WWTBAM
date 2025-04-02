import { renderDifficultySelection } from "./components/DifficultySelection";
import { renderGameUI } from "./components/GameUI";
import { renderPrizeLadder } from "./components/PrizeLadder";
import { renderLifelines } from "./components/Lifelines";
import { renderModals } from "./components/Modals";
import { renderSoundControls } from "./components/SoundControls";
import "./styles/styles.css";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired");
  const container = document.getElementById("game-container") as HTMLElement;
  if (!container) {
    console.error("game-container not found in DOM");
    return;
  }
  console.log("Rendering components into container:", container);

  container.innerHTML = `
    <div id="sound-controls-container"></div>
    <div id="difficulty-selection-container"></div>
    <div id="game-ui-container"></div>
    <div id="prize-ladder-container"></div>
    <div id="lifelines-container"></div>
    <div id="modals-container"></div>
  `;

  renderSoundControls(
    document.getElementById("sound-controls-container") as HTMLElement
  );
  renderDifficultySelection(
    document.getElementById("difficulty-selection-container") as HTMLElement
  );
  renderGameUI(document.getElementById("game-ui-container") as HTMLElement);
  renderPrizeLadder(
    document.getElementById("prize-ladder-container") as HTMLElement
  );
  renderLifelines(
    document.getElementById("lifelines-container") as HTMLElement
  );
  renderModals(document.getElementById("modals-container") as HTMLElement);
});
