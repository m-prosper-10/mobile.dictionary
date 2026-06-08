import { normalizeAudioUrl } from "@/utils/normalizeAudioUrl";

export type DictionaryPhonetic = {
  text?: string;
  audio?: string;
};

export type DictionaryDefinition = {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
};

export type DictionaryMeaning = {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  synonyms: string[];
  antonyms: string[];
};

export type DictionaryEntry = {
  word: string;
  phonetic: string;
  phonetics: DictionaryPhonetic[];
  audioUrls: string[];
  meanings: DictionaryMeaning[];
  origin?: string;
};

type DictionaryApiEntry = {
  word?: unknown;
  phonetic?: unknown;
  phonetics?: unknown;
  meanings?: unknown;
  origin?: unknown;
};

export function parseDictionaryResponse(data: unknown): DictionaryEntry {
  const firstEntry = Array.isArray(data) ? (data[0] as DictionaryApiEntry) : null;

  if (!firstEntry || typeof firstEntry !== "object") {
    throw new Error("No dictionary data found.");
  }

  const phonetics = normalizePhonetics(firstEntry.phonetics);
  const meanings = normalizeMeanings(firstEntry.meanings);
  const audioUrls = [...new Set(phonetics.map((item) => normalizeAudioUrl(item.audio)).filter(Boolean))] as string[];

  return {
    word: normalizeText(firstEntry.word),
    phonetic: normalizeText(firstEntry.phonetic) || getFirstPhoneticText(phonetics),
    phonetics,
    audioUrls,
    meanings,
    origin: normalizeOptionalText(firstEntry.origin),
  };
}

function normalizePhonetics(value: unknown): DictionaryPhonetic[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): DictionaryPhonetic | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;

      return {
        text: normalizeOptionalText(record.text),
        audio: normalizeOptionalText(record.audio),
      };
    })
    .filter((item): item is DictionaryPhonetic => item !== null);
}

function normalizeMeanings(value: unknown): DictionaryMeaning[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): DictionaryMeaning | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;

      return {
        partOfSpeech: normalizeText(record.partOfSpeech),
        definitions: normalizeDefinitions(record.definitions),
        synonyms: normalizeStringArray(record.synonyms),
        antonyms: normalizeStringArray(record.antonyms),
      };
    })
    .filter((item): item is DictionaryMeaning => item !== null);
}

function normalizeDefinitions(value: unknown): DictionaryDefinition[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): DictionaryDefinition | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const definition = normalizeText(record.definition);

      if (!definition) {
        return null;
      }

      return {
        definition,
        example: normalizeOptionalText(record.example),
        synonyms: normalizeStringArray(record.synonyms),
        antonyms: normalizeStringArray(record.antonyms),
      };
    })
    .filter((item): item is DictionaryDefinition => item !== null);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeOptionalText(item))
    .filter((item): item is string => Boolean(item));
}

function normalizeText(value: unknown): string {
  const normalized = normalizeOptionalText(value);
  if (!normalized) {
    return "";
  }
  return normalized;
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function getFirstPhoneticText(phonetics: DictionaryPhonetic[]): string {
  const item = phonetics.find((phonetic) => phonetic.text);
  return item?.text ?? "";
}
