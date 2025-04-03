import { ANIMATION_DURATIONS } from "./utils/Constants";

export function updateQuestionUI(
  question: { question: string },
  answers: string[],
  answerButtons: HTMLButtonElement[],
  handleAnswer: (answer: string, btn: HTMLButtonElement) => void
) {
  const questionEl = document.getElementById("question") as HTMLDivElement;
  if (questionEl) {
    questionEl.textContent = question.question;
  }
  answerButtons.forEach((btn, i) => {
    if (btn) {
      btn.className =
        "bg-orange-600 text-base md:text-lg py-2 md:py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center active:bg-orange-800";
      btn.innerHTML = `<span class="mr-2 font-bold">${String.fromCharCode(
        65 + i
      )}:</span> ${answers[i]}`;
      btn.onclick = () => handleAnswer(answers[i], btn);
      btn.classList.remove("hidden");
    }
  });
}

export function updatePrizeLadder(currentQuestionIndex: number) {
  const prizeLadderEl = document.getElementById(
    "prize-ladder"
  ) as HTMLUListElement;
  if (!prizeLadderEl) return;

  const items = prizeLadderEl.getElementsByTagName("li");
  for (let i = 0; i < items.length; i++) {
    if (i === items.length - 1 - currentQuestionIndex) {
      items[i].className = "py-1 font-bold text-yellow-400";
    } else {
      items[i].className = "py-1";
    }
  }
}

export function updateLifelinesUI(lifelinesUsed: {
  fiftyFifty: boolean;
  phoneFriend: boolean;
  askAudience: boolean;
}) {
  const fiftyFiftyBtn = document.getElementById(
    "fifty-fifty"
  ) as HTMLButtonElement;
  const phoneFriendBtn = document.getElementById(
    "phone-friend"
  ) as HTMLButtonElement;
  const askAudienceBtn = document.getElementById(
    "ask-audience"
  ) as HTMLButtonElement;

  if (fiftyFiftyBtn) {
    fiftyFiftyBtn.disabled = lifelinesUsed.fiftyFifty;
    fiftyFiftyBtn.className = lifelinesUsed.fiftyFifty
      ? "px-3 py-1 md:px-4 md:py-2 bg-gray-600 rounded-full flex items-center text-sm md:text-base cursor-not-allowed"
      : "px-3 py-1 md:px-4 md:py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors flex items-center text-sm md:text-base";
  }
  if (phoneFriendBtn) {
    phoneFriendBtn.disabled = lifelinesUsed.phoneFriend;
    phoneFriendBtn.className = lifelinesUsed.phoneFriend
      ? "px-3 py-1 md:px-4 md:py-2 bg-gray-600 rounded-full flex items-center text-sm md:text-base cursor-not-allowed"
      : "px-3 py-1 md:px-4 md:py-2 bg-orange-600 rounded-full hover:bg-orange-700 transition-colors flex items-center text-sm md:text-base";
  }
  if (askAudienceBtn) {
    askAudienceBtn.disabled = lifelinesUsed.askAudience;
    askAudienceBtn.className = lifelinesUsed.askAudience
      ? "px-3 py-1 md:px-4 md:py-2 bg-gray-600 rounded-full flex items-center text-sm md:text-base cursor-not-allowed"
      : "px-3 py-1 md:px-4 md:py-2 bg-teal-600 rounded-full hover:bg-teal-700 transition-colors flex items-center text-sm md:text-base";
  }
}

export function showLoading() {
  const questionEl = document.getElementById("question") as HTMLDivElement;
  if (questionEl) {
    questionEl.textContent = "Loading question...";
  }
  const answerButtons = [
    document.getElementById("answer-a") as HTMLButtonElement,
    document.getElementById("answer-b") as HTMLButtonElement,
    document.getElementById("answer-c") as HTMLButtonElement,
    document.getElementById("answer-d") as HTMLButtonElement,
  ];
  answerButtons.forEach((btn) => {
    if (btn) {
      btn.classList.add("hidden");
    }
  });
}

export function showGameOver(
  correctAnswer: string,
  answerButtons: HTMLButtonElement[],
  answers: string[]
) {
  answerButtons.forEach((btn, i) => {
    if (!btn) return;
    if (answers[i] === correctAnswer) {
      btn.className =
        "bg-green-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center animate-bounce";
    } else {
      btn.className =
        "bg-red-600 text-base md:text-lg py-2 md:py-3 rounded-full flex items-center justify-center";
    }
    btn.disabled = true;
  });
}

export function showWin() {
  const questionEl = document.getElementById("question") as HTMLDivElement;
  if (questionEl) {
    questionEl.textContent = "Congratulations! You’ve won $1,000,000!";
  }
}
