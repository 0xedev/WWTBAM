// src/api.ts
import axios from "axios";
import { TriviaQuestion } from "./types";

export async function fetchQuestions(
  difficulty: string,
  category?: number,
  amount: number = 15
): Promise<TriviaQuestion[]> {
  try {
    const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple${
      category ? `&category=${category}` : ""
    }`;
    const response = await axios.get(url);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions. Please try again later.");
  }
}

export async function fetchCategories(): Promise<
  { id: number; name: string }[]
> {
  try {
    const response = await axios.get("https://opentdb.com/api_category.php");
    return response.data.trivia_categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories. Please try again later.");
  }
}
