import { handleAnswer } from "../logic/GameLogic";

export function renderGameUI(container: HTMLElement) {
  container.innerHTML = `
    <div id="game-ui" class="flex flex-col md:flex-row py-6">
      <div class="flex-1 flex flex-col items-center">
        <div id="timer" class="text-base md:text-lg mb-4 hidden">Time Left: 30s</div>
        <div id="question" class="bg-gray-900 bg-opacity-80 text-lg md:text-2xl p-6 rounded-lg w-full text-center mb-6 md:mb-10 border-2 border-yellow-400">Question goes here</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          <button id="answer-a" class="bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center"><span class="mr-2 font-bold">A:</span> Option A</button>
          <button id="answer-b" class="bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center"><span class="mr-2 font-bold">B:</span> Option B</button>
          <button id="answer-c" class="bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center"><span class="mr-2 font-bold">C:</span> Option C</button>
          <button id="answer-d" class="bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center"><span class="mr-2 font-bold">D:</span> Option D</button>
        </div>
      </div>
    </div>
  `;
  const gameUi = document.getElementById("game-ui") as HTMLDivElement;
  gameUi.classList.add("hidden");
}

export function updateAnswers(answers: string[]) {
  const answerButtons = [
    document.getElementById("answer-a") as HTMLButtonElement,
    document.getElementById("answer-b") as HTMLButtonElement,
    document.getElementById("answer-c") as HTMLButtonElement,
    document.getElementById("answer-d") as HTMLButtonElement,
  ].filter(Boolean);

  answerButtons.forEach((btn, i) => {
    if (btn) {
      if (i < answers.length) {
        btn.className =
          "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center";
        btn.innerHTML = `<span class="mr-2 font-bold">${String.fromCharCode(
          65 + i
        )}:</span> ${answers[i]}`;
        btn.onclick = () => {
          console.log("Answer button clicked:", answers[i]);
          handleAnswer(answers[i], btn);
        };
        btn.disabled = false; // Ensure button is enabled
        btn.classList.remove("hidden");
      } else {
        btn.className =
          "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center";
        btn.innerHTML = `<span class="mr-2 font-bold">${String.fromCharCode(
          65 + i
        )}:</span>`;
        btn.onclick = null;
        btn.disabled = true; // Disable unused buttons
        btn.classList.add("hidden"); // Hide unused buttons
      }
    } else {
      console.error(
        "Answer button not found:",
        `answer-${String.fromCharCode(97 + i)}`
      );
    }
  });
}
