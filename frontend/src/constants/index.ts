export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 32,
  SERVER_PAGE_SIZE: 1024,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
} as const;

export const API_ENDPOINTS = {
  TERMS: 'terms',
  TERMS_ALL: 'terms/all',
  TERMS_FULL: 'terms/full',
  TAGS: 'tags',
  TRANSLATIONS: 'translations',
  TRANSLATIONS_UNTRANSLATED_BASE: 'translations/untranslated',
  SUGGESTIONS: 'suggestions',
  SYNONYMS: 'synonyms',
  LANGUAGES: 'language',
  AUTH_LOGIN: 'auth/login',
  AUTH_VERIFY: 'auth/verify',
  AUTH_LOGOUT: 'auth/logout',
  AUTH_SETUP: 'auth/setup',
  AUTH_SETUP_REQUIRED: 'auth/setup-required',
  IMPORT_TERMS: 'import/terms',
  IMPORT_TRANSLATIONS: 'import/translations',
  EXPORT_TERMS_DOCX: 'export/terms/docx',
  SETTINGS: 'settings',
} as const;

export const SWR_KEYS = {
  TERMS: 'terms',
  TAGS: 'tags',
  TRANSLATIONS: 'translations',
  SUGGESTIONS: 'suggestions',
  SYNONYMS: 'synonyms',
  LANGUAGES: 'language',
} as const;

export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
} as const;

export const ADMIN_TABS = {
  TERMS: 'terms',
  TRANSLATIONS: 'translations',
  TAGS: 'tags',
  SUGGESTIONS: 'suggestions',
  UNTRANSLATED: 'untranslated',
  LANGUAGES: 'languages',
  SETTINGS: 'settings',
} as const;

export type AdminTabType = (typeof ADMIN_TABS)[keyof typeof ADMIN_TABS];
