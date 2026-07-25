/**
 * Trimmed, web-colocated port of the mobile app's
 * `src/constants/CountryData.ts` — a subset of countries + heritage
 * languages, enough for the Heritage step's country/language pickers.
 * Do NOT import this from anywhere outside `profile-setup/`.
 */

export interface Language {
  name: string;
  code: string;
  nativeName?: string;
}

export interface Country {
  name: string;
  /** ISO 3166-1 alpha-2 — also what CountryFlag maps to a bundled SVG. */
  code: string;
  languages: Language[];
}

export const COUNTRIES: Country[] = [
  {
    name: "Nigeria",
    code: "NG",
    languages: [
      { name: "English", code: "en" },
      { name: "Hausa", code: "ha", nativeName: "Harshen Hausa" },
      { name: "Yoruba", code: "yo", nativeName: "Èdè Yorùbá" },
      { name: "Igbo", code: "ig", nativeName: "Asụsụ Igbo" },
      { name: "Nigerian Pidgin", code: "pcm", nativeName: "Naijá" },
      { name: "Fulfulde", code: "ff" },
      { name: "Tiv", code: "tiv" },
      { name: "Ibibio", code: "ibb" },
      { name: "Edo", code: "bin" },
      { name: "Ijaw", code: "ijc" },
    ],
  },
  {
    name: "Cameroon",
    code: "CM",
    languages: [
      { name: "French", code: "fr" },
      { name: "English", code: "en" },
      { name: "Ewondo", code: "ewo" },
      { name: "Douala", code: "dua" },
      { name: "Fulfulde", code: "ff" },
      { name: "Bamun", code: "bax" },
    ],
  },
  {
    name: "Ghana",
    code: "GH",
    languages: [
      { name: "English", code: "en" },
      { name: "Twi", code: "aka" },
      { name: "Ewe", code: "ee" },
      { name: "Ga", code: "gaa" },
      { name: "Dagbani", code: "dag" },
      { name: "Fante", code: "fat" },
    ],
  },
  {
    name: "Kenya",
    code: "KE",
    languages: [
      { name: "Swahili", code: "sw" },
      { name: "English", code: "en" },
      { name: "Kikuyu", code: "ki" },
      { name: "Luo", code: "luo" },
      { name: "Luhya", code: "luy" },
      { name: "Kalenjin", code: "kln" },
    ],
  },
  {
    name: "South Africa",
    code: "ZA",
    languages: [
      { name: "Zulu", code: "zu" },
      { name: "Xhosa", code: "xh" },
      { name: "Afrikaans", code: "af" },
      { name: "English", code: "en" },
      { name: "Sotho", code: "st" },
      { name: "Tswana", code: "tn" },
    ],
  },
  {
    name: "DR Congo",
    code: "CD",
    languages: [
      { name: "French", code: "fr" },
      { name: "Lingala", code: "ln" },
      { name: "Swahili", code: "sw" },
      { name: "Kongo", code: "kg" },
      { name: "Tshiluba", code: "lua" },
    ],
  },
  {
    name: "China",
    code: "CN",
    languages: [
      { name: "Mandarin", code: "zh", nativeName: "普通话" },
      { name: "Cantonese", code: "yue", nativeName: "广东话" },
      { name: "Wu", code: "wuu" },
      { name: "Hakka", code: "hak" },
      { name: "Tibetan", code: "bo" },
      { name: "Uyghur", code: "ug" },
    ],
  },
  {
    name: "India",
    code: "IN",
    languages: [
      { name: "Hindi", code: "hi" },
      { name: "English", code: "en" },
      { name: "Bengali", code: "bn" },
      { name: "Telugu", code: "te" },
      { name: "Tamil", code: "ta" },
      { name: "Marathi", code: "mr" },
      { name: "Urdu", code: "ur" },
      { name: "Punjabi", code: "pa" },
    ],
  },
  {
    name: "Indonesia",
    code: "ID",
    languages: [
      { name: "Indonesian", code: "id" },
      { name: "Javanese", code: "jv" },
      { name: "Sundanese", code: "su" },
      { name: "Minangkabau", code: "min" },
      { name: "Balinese", code: "ban" },
    ],
  },
  {
    name: "Philippines",
    code: "PH",
    languages: [
      { name: "Filipino", code: "fil" },
      { name: "Tagalog", code: "tl" },
      { name: "Cebuano", code: "ceb" },
      { name: "Ilocano", code: "ilo" },
      { name: "Hiligaynon", code: "hil" },
    ],
  },
  {
    name: "Mexico",
    code: "MX",
    languages: [
      { name: "Spanish", code: "es" },
      { name: "Nahuatl", code: "nah" },
      { name: "Yucatec Maya", code: "yua" },
      { name: "Mixtec", code: "mix" },
      { name: "Zapotec", code: "zap" },
    ],
  },
  {
    name: "Brazil",
    code: "BR",
    languages: [
      { name: "Portuguese", code: "pt" },
      { name: "Nheengatu", code: "yrl" },
      { name: "Tikuna", code: "tca" },
      { name: "Guarani", code: "gn" },
    ],
  },
  {
    name: "United States",
    code: "US",
    languages: [
      { name: "English", code: "en" },
      { name: "Spanish", code: "es" },
      { name: "Navajo", code: "nv" },
      { name: "Cherokee", code: "chr" },
      { name: "Hawaiian", code: "haw" },
    ],
  },
  {
    name: "United Kingdom",
    code: "GB",
    languages: [
      { name: "English", code: "en" },
      { name: "Welsh", code: "cy" },
      { name: "Scottish Gaelic", code: "gd" },
      { name: "Irish", code: "ga" },
    ],
  },
  {
    name: "Vietnam",
    code: "VN",
    languages: [
      { name: "Vietnamese", code: "vi" },
      { name: "Tay", code: "tyz" },
      { name: "Khmer", code: "km" },
      { name: "Hmong", code: "hmn" },
    ],
  },
  {
    name: "Japan",
    code: "JP",
    languages: [
      { name: "Japanese", code: "ja" },
      { name: "Ryukyuan", code: "ryu" },
      { name: "Ainu", code: "ain" },
    ],
  },
];

/** Flattened, de-duplicated (by name), alphabetically sorted language list. */
export const ALL_LANGUAGES: Language[] = COUNTRIES.flatMap((c) => c.languages)
  .reduce<Language[]>((unique, item) => {
    if (!unique.some((l) => l.name === item.name)) unique.push(item);
    return unique;
  }, [])
  .sort((a, b) => a.name.localeCompare(b.name));

/** DiceBear "avataaars" seeds for the ready-made cartoon avatar row. */
export const AVATAR_SEEDS = ["Felix", "Aneka", "Max", "Zoe", "Milo", "Nala"];

export const dicebearUrl = (seed: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
