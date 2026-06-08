import axios from "axios";

import {
  parseDictionaryResponse,
  type DictionaryEntry,
} from "@/utils/parseDictionaryResponse";

export const DICTIONARY_BASE_URL =
  "https://api.dictionaryapi.dev/api/v2/entries/en";

export async function fetchWordDefinition(
  word: string,
): Promise<DictionaryEntry> {
  const cleanWord = word.trim().toLowerCase();

  if (!cleanWord) {
    throw new Error("Please enter a word.");
  }

  try {
    const response = await axios.get(`${DICTIONARY_BASE_URL}/${cleanWord}`);
    return parseDictionaryResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Word not found. Try another word.");
      }

      if (error.request) {
        throw new Error("Network error. Check your internet connection.");
      }
    }

    if (error instanceof Error && error.message) {
      throw new Error(error.message);
    }

    throw new Error("Failed to fetch word definition.");
  }
}
