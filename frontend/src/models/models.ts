import * as Flags from 'country-flag-icons/react/3x2';

export type CountryCode = keyof typeof Flags;

export interface ITerm {
  termId: number;
  name: string;
  description: string;
  reference: string;
  languageCode: CountryCode;
  baseName?: string;
  createdAt?: string;
  tags: ITag[];
}

export interface ITranslation {
  termId: number;
  name: string;
  description: string;
  languageCode: CountryCode;
  status: string;
  baseName?: string;
  createdAt?: string;
}

export interface ISuggestion {
  suggestionId: number;
  termId?: number;
  termName?: string;
  suggestedName?: string;
  languageCode: CountryCode;
  fullname: string;
  reasoning: string;
  reference: string;
  description: string;
  email: string;
}

export interface ITag {
  tagId: number;
  name: string;
}

export interface ISynonym {
  synonymId: number;
  termId: number;
  synonymTermId: number;
  createdAt?: string;
  synonymTermName?: string;
  synonymTermDescription?: string;
}

export interface ILanguage {
  languageId: number;
  name: string;
  code: CountryCode;
}
