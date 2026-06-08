import axios from "axios";

const DATAMUSE_BASE_URL = "https://api.datamuse.com/sug";

type DatamuseSuggestion = {
  word?: unknown;
};

export async function fetchWordSuggestions(query: string): Promise<string[]> {
  const cleanQuery = query.trim().toLowerCase();

  if (cleanQuery.length < 2) {
    return [];
  }

  try {
    const response = await axios.get<DatamuseSuggestion[]>(DATAMUSE_BASE_URL, {
      params: {
        s: cleanQuery,
        max: 8,
      },
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data
      .map((item) => {
        if (!item || typeof item !== "object") {
          return "";
        }

        const word = item.word;
        return typeof word === "string" ? word.trim() : "";
      })
      .filter(Boolean)
      .slice(0, 8);
  } catch {
    return [];
  }
}
