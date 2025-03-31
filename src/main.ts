// src/main.ts
import "./style.css";
import axios from "axios";
import { TriviaQuestion } from "./types";

const prizeLadder = [
  100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000,
  250000, 500000, 1000000,
];

let questions: TriviaQuestion[] = [];
let currentQuestionIndex = 0;
let gameStarted = false;

const questionEl = document.getElementById("question") as HTMLDivElement;
const answersEl = document.getElementById("answers") as HTMLUListElement;
const prizeEl = document.getElementById("prize") as HTMLParagraphElement;
const nextPrizeEl = document.getElementById(
  "next-prize"
) as HTMLParagraphElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;

// Hide answers initially
answersEl.style.display = "none";

async function fetchQuestions(amount: number = 15): Promise<TriviaQuestion[]> {
  const response = await axios.get(
    `https://opentdb.com/api.php?amount=${amount}&difficulty=hard&type=multiple`
  );
  return response.data.results;
}

function shuffleArray(array: string[]): string[] {
  return array.sort(() => Math.random() - 0.5);
}

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  questionEl.innerHTML = question.question;
  answersEl.innerHTML = "";
  answersEl.style.display = "block"; // Show answers when question loads

  const answers = shuffleArray([
    ...question.incorrect_answers,
    question.correct_answer,
  ]);
  answers.forEach((answer) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = answer;
    button.className =
      "w-full max-w-xs px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-red-600 transition-colors";
    button.addEventListener("click", () => handleAnswer(answer));
    li.appendChild(button);
    answersEl.appendChild(li);
  });

  prizeEl.textContent = `Current Prize: $${
    prizeLadder[currentQuestionIndex - 1] || 0
  }`;
  nextPrizeEl.textContent = `Next Prize: $${
    prizeLadder[currentQuestionIndex] || "Millionaire!"
  }`;
}

function handleAnswer(selectedAnswer: string) {
  const currentQuestion = questions[currentQuestionIndex];
  if (selectedAnswer === currentQuestion.correct_answer) {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      displayQuestion();
    } else {
      questionEl.textContent = "Congratulations! You’re a Millionaire!";
      answersEl.innerHTML = "";
      answersEl.style.display = "none";
      startBtn.style.display = "block";
      gameStarted = false;
    }
  } else {
    questionEl.textContent = `Game Over! Correct answer was: ${currentQuestion.correct_answer}`;
    answersEl.innerHTML = "";
    answersEl.style.display = "none";
    prizeEl.textContent = `Final Prize: $${
      prizeLadder[currentQuestionIndex - 1] || 0
    }`;
    nextPrizeEl.textContent = "";
    startBtn.style.display = "block";
    gameStarted = false;
  }
}

async function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  startBtn.style.display = "none";
  questions = await fetchQuestions();
  currentQuestionIndex = 0;
  displayQuestion();
}

startBtn.addEventListener("click", startGame);
