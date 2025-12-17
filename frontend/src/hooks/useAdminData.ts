import useSWR, { mutate } from 'swr';
import { ITag, ISuggestion, ILanguage } from '../models/models';
import { SWR_KEYS } from '../constants';
import { termsApi } from '../api/termsApi';
import { tagsApi } from '../api/tagsApi';
import { languagesApi } from '../api/languagesApi';
import { translationsApi } from '../api/translationsApi';
import { suggestionsApi } from '../api/suggestionsApi';

export const useAdminData = () => {
  const {
    data: termsResponse,
    error: termsError,
    isLoading: termsLoading,
  } = useSWR(SWR_KEYS.TERMS, () => termsApi.get().then((res) => res.data));
  const terms = termsResponse?.terms || [];

  const {
    data: tags = [],
    error: tagsError,
    isLoading: tagsLoading,
  } = useSWR<ITag[]>(SWR_KEYS.TAGS, () =>
    tagsApi.getAll().then((res) => res.data)
  );

  const {
    data: languages = [],
    error: languagesError,
    isLoading: languagesLoading,
  } = useSWR<ILanguage[]>(SWR_KEYS.LANGUAGES, () =>
    languagesApi.getAll().then((res) => res.data)
  );

  const {
    data: translationsResponse,
    error: translationsError,
    isLoading: translationsLoading,
  } = useSWR(SWR_KEYS.TRANSLATIONS, () =>
    translationsApi.getAll().then((res) => res.data)
  );
  const translations = translationsResponse?.translations || [];

  const {
    data: suggestions = [],
    error: suggestionsError,
    isLoading: suggestionsLoading,
  } = useSWR<ISuggestion[]>(SWR_KEYS.SUGGESTIONS, () =>
    suggestionsApi.getAll().then((res) => res.data)
  );

  const refreshAll = () => {
    mutate(SWR_KEYS.TERMS);
    mutate(SWR_KEYS.TAGS);
    mutate(SWR_KEYS.TRANSLATIONS);
    mutate(SWR_KEYS.SUGGESTIONS);
    mutate(SWR_KEYS.LANGUAGES);
  };

  return {
    terms,
    tags,
    languages,
    translations,
    suggestions,

    termsLoading,
    tagsLoading,
    languagesLoading,
    translationsLoading,
    suggestionsLoading,

    termsError,
    tagsError,
    languagesError,
    translationsError,
    suggestionsError,

    refreshAll,
  };
};
