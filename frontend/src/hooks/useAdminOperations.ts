import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdminData } from './useAdminData';
import { ITerm, ITag, ITranslation, ILanguage } from '../models/models';
import { termsApi } from '../api/termsApi';
import { tagsApi } from '../api/tagsApi';
import { translationsApi } from '../api/translationsApi';
import { importApi } from '../api/importApi';
import { languagesApi } from '../api/languagesApi';

export const useAdminOperations = () => {
  const { refreshAll } = useAdminData();

  const performOperation = useCallback(
    async (operation: () => Promise<any>, successMessage: string) => {
      try {
        const result = await operation();
        toast.success(successMessage);
        refreshAll();
        return result;
      } catch (error: any) {
        const data = error?.response?.data as {
          message?: string;
          detail?: string;
          statusCode?: number;
        };

        const baseMessage = data?.message || 'Operation failed';
        const detail = data?.detail;

        const toastMessage =
          detail && detail !== baseMessage
            ? `${baseMessage}: ${detail}`
            : baseMessage;

        toast.error(toastMessage);
        throw error;
      }
    },
    [refreshAll]
  );

  const createTerm = useCallback(
    (termData: Partial<ITerm>) =>
      performOperation(() => termsApi.create(termData), 'Term created successfully'),
    [performOperation]
  );

  const updateTerm = useCallback(
    (
      termId: number,
      termData: Partial<ITerm> & { markTranslationsForReview?: boolean }
    ) =>
      performOperation(() => termsApi.update(termId, termData), 'Term updated successfully'),
    [performOperation]
  );

  const deleteTerm = useCallback(
    (termId: number) =>
      performOperation(() => termsApi.delete(termId), 'Term deleted successfully'),
    [performOperation]
  );

  const createTag = useCallback(
    (tagData: Partial<ITag>) =>
      performOperation(() => tagsApi.create(tagData), 'Tag created successfully'),
    [performOperation]
  );

  const updateTag = useCallback(
    (tagId: number, tagData: Partial<ITag>) =>
      performOperation(() => tagsApi.update(tagId, tagData), 'Tag updated successfully'),
    [performOperation]
  );

  const deleteTag = useCallback(
    (tagId: number) =>
      performOperation(() => tagsApi.delete(tagId), 'Tag deleted successfully'),
    [performOperation]
  );

  const createTranslation = useCallback(
    (translationData: Partial<ITranslation>) =>
      performOperation(() => translationsApi.create(translationData), 'Translation created successfully'),
    [performOperation]
  );

  const deleteTranslationByTermAndLanguage = useCallback(
    (termId: number, languageCode: string) =>
      performOperation(() => translationsApi.delete(termId, languageCode), 'Translation deleted successfully'),
    [performOperation]
  );

  const updateTranslation = useCallback(
    (
      translationData: Partial<ITranslation> & {
        termId: number;
        languageCode: string;
      }
    ) =>
      performOperation(() => translationsApi.update(translationData), 'Translation updated successfully'),
    [performOperation]
  );

  const markTranslationReviewed = useCallback(
    (termId: number, languageCode: string) =>
      performOperation(() => translationsApi.markAsReviewed(termId, languageCode), 'Translation marked as reviewed'),
    [performOperation]
  );

  const deleteAllTerms = useCallback(
    () =>
      performOperation(() => termsApi.deleteAll(), 'All terms deleted successfully'),
    [performOperation]
  );

  const importTerms = useCallback(
    (formData: FormData) =>
      performOperation(() => importApi.importTerms(formData), 'Terms imported successfully'),
    [performOperation]
  );

  const importTranslations = useCallback(
    (formData: FormData) =>
      performOperation(() => importApi.importTranslations(formData), 'Translations imported successfully'),
    [performOperation]
  );

  const deleteLanguage = useCallback(
    (languageId: number) =>
      performOperation(() => languagesApi.delete(languageId), 'Language deleted successfully'),
    [performOperation]
  );

  const createLanguage = useCallback(
    (languageData: Partial<ILanguage>) =>
      performOperation(() => languagesApi.create(languageData), 'Language added successfully'),
    [performOperation]
  );

  return {
    createTerm,
    updateTerm,
    deleteTerm,
    createTag,
    updateTag,
    deleteTag,
    createTranslation,
    deleteTranslationByTermAndLanguage,
    updateTranslation,
    markTranslationReviewed,
    deleteLanguage,
    createLanguage,
    deleteAllTerms,
    importTerms,
    importTranslations,
  };
};
