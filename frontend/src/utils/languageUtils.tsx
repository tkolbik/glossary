import { CountryCode, ITerm } from '../models/models';
import { LANGUAGE_CONFIG, isBaseLanguage } from '../config/languageConfig';

export function getCodeFromName(name: string): CountryCode | undefined {
  const entry = Object.entries(languageNames).find(
    ([, displayName]) => displayName === name
  );

  return entry?.[0] as CountryCode | undefined;
}

export function getNameFromCode(code: CountryCode): string | undefined {
  return languageNames[code];
}

export function isBaseLanguageCode(languageCode: string): boolean {
  return isBaseLanguage(languageCode);
}

export function getBaseLanguageCode(): string {
  return LANGUAGE_CONFIG.BASE_LANGUAGE_CODE;
}

export function getBaseLanguageName(): string {
  return LANGUAGE_CONFIG.BASE_LANGUAGE_NAME;
}

export function getNavigationName(term: ITerm): string {
  return isBaseLanguageCode(term.languageCode)
    ? term.name
    : term.baseName || term.name;
}

export function filterLanguagesForDisplay(
  languages: Array<{ code: string; name: string }>,
  showBase: boolean = true
) {
  if (showBase) return languages;
  return languages.filter((lang) => lang.code !== getBaseLanguageCode());
}

export function getLanguageDisplayName(languageCode: string): string {
  return languageCode === getBaseLanguageCode()
    ? getBaseLanguageName()
    : languageCode;
}

export const languageNames: Partial<Record<CountryCode, string>> = {
  [LANGUAGE_CONFIG.BASE_LANGUAGE_CODE]: LANGUAGE_CONFIG.BASE_LANGUAGE_NAME,
  US: 'American English',
  DE: 'German',
  FR: 'French',
  ES: 'Spanish',
  IT: 'Italian',
  PL: 'Polish',
  CZ: 'Czech',
  SK: 'Slovak',
  NL: 'Dutch',
  PT: 'Portuguese',
  BR: 'Portuguese (Brazil)',
  RU: 'Russian',
  UA: 'Ukrainian',
  TR: 'Turkish',
  RO: 'Romanian',
  HU: 'Hungarian',
  SE: 'Swedish',
  NO: 'Norwegian',
  FI: 'Finnish',
  DK: 'Danish',
  GR: 'Greek',
  BG: 'Bulgarian',
  HR: 'Croatian',
  RS: 'Serbian',
  SI: 'Slovenian',
  JP: 'Japanese',
  CN: 'Chinese (Simplified)',
  TW: 'Chinese (Traditional)',
  KR: 'Korean',
  TH: 'Thai',
  VN: 'Vietnamese',
  ID: 'Indonesian',
  IN: 'Hindi',
  IL: 'Hebrew',
  IR: 'Persian',
  PK: 'Urdu',
  MY: 'Malay',
  PH: 'Filipino',
  ZA: 'Afrikaans',
  EG: 'Arabic (Egypt)',
  CA: 'English (Canada)',
  AU: 'English (Australia)',
  NZ: 'English (New Zealand)',
  MX: 'Spanish (Mexico)',
};
