export const LANGUAGE_CONFIG = {
  BASE_LANGUAGE_CODE: 'GB' as const,
  BASE_LANGUAGE_NAME: 'English',
} as const;

export const isBaseLanguage = (languageCode: string): boolean => {
  return languageCode === LANGUAGE_CONFIG.BASE_LANGUAGE_CODE;
};
