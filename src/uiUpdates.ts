// src/uiUpdates.ts
import { TriviaQuestion, GameState } from "./types";
import { OPTION_LABELS, PRIZE_LADDER } from "./constants";
import { playSound } from "./sound";

export function updateQuestionUI(
  question: TriviaQuestion,
  answers: string[],
  answerButtons: HTMLButtonElement[],
  handleAnswer: (answer: string, btn: HTMLButtonElement) => void
) {
  const questionEl = document.getElementById("question") as HTMLDivElement;
  questionEl.innerHTML = question.question;

  answerButtons.forEach((btn, i) => {
    btn.innerHTML = `<span class="mr-2 font-bold">${OPTION_LABELS[i]}:</span> ${answers[i]}`;
    btn.className =
      "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center";
    btn.onclick = () => handleAnswer(answers[i], btn);
    btn.classList.remove("hidden");
  });

  playSound("question-reveal");
}

export function updatePrizeLadder(currentQuestionIndex: number) {
  const prizeLadderEl = document.getElementById(
    "prize-ladder"
  ) as HTMLDivElement;
  const ul = prizeLadderEl.querySelector("ul") as HTMLUListElement;
  ul.innerHTML = "";
  PRIZE_LADDER.forEach((prize, index) => {
    const li = document.createElement("li");
    li.className = `py-1 ${
      index === currentQuestionIndex ? "text-yellow-400 font-bold" : ""
    }`;
    li.textContent = `${15 - index}: $${prize.toLocaleString()}`;
    ul.appendChild(li);
  });
}

export function updateLifelinesUI(lifelinesUsed: GameState["lifelinesUsed"]) {
  const fiftyFiftyBtn = document.getElementById(
    "fifty-fifty"
  ) as HTMLButtonElement;
  const phoneFriendBtn = document.getElementById(
    "phone-friend"
  ) as HTMLButtonElement;
  const askAudienceBtn = document.getElementById(
    "ask-audience"
  ) as HTMLButtonElement;

  fiftyFiftyBtn.disabled = lifelinesUsed.fiftyFifty;
  phoneFriendBtn.disabled = lifelinesUsed.phoneFriend;
  askAudienceBtn.disabled = lifelinesUsed.askAudience;
}

export function showLoading() {
  const questionEl = document.getElementById("question") as HTMLDivElement;
  questionEl.innerHTML = `<div class="flex justify-center items-center"><svg class="animate-spin h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>`;
}

export function showGameOver(
  correctAnswer: string,
  answerButtons: HTMLButtonElement[],
  answers: string[]
) {
  const questionEl = document.getElementById("question") as HTMLDivElement;
  questionEl.textContent = `Game Over! Correct answer was: ${correctAnswer}`;

  answerButtons.forEach((btn, i) => {
    if (answers[i] === correctAnswer) {
      btn.className =
        "bg-green-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center";
    } else {
      btn.classList.add("hidden");
    }
  });
}

export function showWin() {
  const questionEl = document.getElementById("question") as HTMLDivElement;
  questionEl.textContent = "Congratulations! You’re a Millionaire!";
}
