// src/api.ts
import axios from "axios";
import { TriviaQuestion } from "./types";

export async function fetchQuestions(
  difficulty: string,
  amount: number = 15
): Promise<TriviaQuestion[]> {
  try {
    const response = await axios.get(
      `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple`
    );
    return response.data.results;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions. Please try again later.");
  }
}
