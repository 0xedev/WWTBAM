import { sdk } from "@farcaster/frame-sdk";
import { renderDifficultySelection } from "./components/DifficultySelection";
import { renderGameUI } from "./components/GameUI";
import { renderPrizeLadder } from "./components/PrizeLadder";
import { renderLifelines } from "./components/Lifelines";
import { renderModals } from "./components/Modals";
import { renderSoundControls } from "./components/SoundControls";
import "./styles/styles.css";

// Mock context for local development
const isFarcasterEnvironment = !!window.parent; // Rough check for iframe-like embedding
const mockContext = {
  user: { fid: 9999, username: "LocalTester", displayName: "Local Tester" },
  client: {
    clientFid: 0,
    added: false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  },
};

async function initializeApp() {
  const container = document.getElementById("game-container") as HTMLElement;
  if (!container) {
    console.error("game-container not found in DOM");
    return;
  }

  // Get context with fallback for local dev
  let context;
  try {
    context = await sdk.context;
    if (!context && !isFarcasterEnvironment) {
      console.log("Not in Farcaster environment, using mock context");
      context = mockContext;
    } else if (!context) {
      console.warn("sdk.context is undefined even in Farcaster environment");
      context = mockContext; // Fallback anyway
    }
  } catch (error) {
    console.error("Error resolving sdk.context:", error);
    context = mockContext;
  }

  const insets = context.client.safeAreaInsets || {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  const appContainer = document.getElementById("app-container") as HTMLElement;
  appContainer.style.marginTop = `${insets.top}px`;
  appContainer.style.marginBottom = `${insets.bottom}px`;
  appContainer.style.marginLeft = `${insets.left}px`;
  appContainer.style.marginRight = `${insets.right}px`;

  // Render components
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
  await renderDifficultySelection(
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

  // Only call ready() in Farcaster environment
  if (isFarcasterEnvironment) {
    try {
      await sdk.actions.ready();
    } catch (error) {
      console.error("Failed to call sdk.actions.ready():", error);
    }
  } else {
    console.log("Skipping sdk.actions.ready() in local environment");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContentLoaded fired");
  let context;
  try {
    context = await sdk.context;
    console.log("Farcaster Context:", context);
  } catch (error) {
    console.error("Error resolving sdk.context:", error);
    context = mockContext;
  }
  await initializeApp();
});
