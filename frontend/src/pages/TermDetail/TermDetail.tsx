import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../../api/fetcher';
import {
  ITag,
  ITerm,
  ILanguage,
  CountryCode,
  ISynonym,
} from '../../models/models';
import {
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AddSuggestionModal from '../../components/Modal/AddSuggestionModal';
import FlagNavigation from '../../components/FlagNavigation/FlagNavigation';
import { getCodeFromName, getNameFromCode, getBaseLanguageCode } from '../../utils/languageUtils';
import Tag from '../../components/Tag/Tag';
import { LANGUAGE_CONFIG } from '../../config/languageConfig';
import { formatFullDate } from '../../utils/dateUtils';
import { synonymsApi } from '../../api/synonymsApi';
import { termsApi } from '../../api/termsApi';

function TermDetail() {
  const { language, termName } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const languageCode =
    getCodeFromName(language ?? '') ??
    (getBaseLanguageCode() as CountryCode);

  const selectedLanguage: ILanguage = useMemo(
    () => ({
      languageId: 0,
      name: language ?? LANGUAGE_CONFIG.BASE_LANGUAGE_NAME,
      code: languageCode,
    }),
    [language, languageCode]
  );


  const {
    data: term,
    error: termError,
    isLoading: termLoading,
  } = useSWR<ITerm>(
    `terms/${language}/${termName}`,
    fetcher
  );

  const {
    data: synonyms = [],
    isLoading: synonymsLoading,
  } = useSWR<ISynonym[]>(
    term?.termId ? `synonyms/${term.termId}` : null,
    () => synonymsApi.getByTermId(term!.termId).then(r => r.data || [])
  );


  const baseTermName = term?.baseName || termName;

  const {
    data: navigation = {
      previousTerm: null,
      nextTerm: null,
    },
  } = useSWR(
    baseTermName
      ? ['term-navigation', baseTermName, languageCode]
      : null,
    () =>
      termsApi
        .getNavigation(baseTermName!, languageCode)
        .then(r => r.data)
  );

  const handleLanguageChange = (lang: ILanguage) => {
    const languageName = getNameFromCode(lang.code);
    if (!languageName) return;

    const targetTerm =
      term?.baseName || term?.name || termName;

    navigate(`/${languageName}/${targetTerm}`);
  };

  if (termLoading) {
    return (
      <div className='min-h-screen bg-slate-100'>
        <FlagNavigation
          setLanguage={handleLanguageChange}
          selectedLanguage={selectedLanguage}
        />
        <div className='max-w-4xl mx-auto px-4 py-10'>
          <div className="text-center text-lg text-gray-600">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (termError) {
    return (
      <div className='min-h-screen bg-slate-100'>
        <FlagNavigation
          setLanguage={handleLanguageChange}
          selectedLanguage={selectedLanguage}
        />
        <div className='max-w-4xl mx-auto px-4 py-10'>
          <div className="text-center">
            <h3 className="text-2xl uppercase tracking-wide text-primary mb-4 font-bold">
              {termName}
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="text-yellow-600 text-4xl mb-4">🌐</div>
              <h4 className="text-xl font-semibold text-yellow-800 mb-2">
                Translation Not Available
              </h4>
              <p className="text-yellow-700 mb-4">
                This term has not been translated to{' '}
                <strong>{language}</strong> yet.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
            >
              Back to glossary
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-100'>
      <FlagNavigation
        setLanguage={handleLanguageChange}
        selectedLanguage={selectedLanguage}
      />
      <div className='max-w-4xl mx-auto px-4 py-10'>
        <div className="mb-6">
          <h3 className="text-2xl uppercase tracking-wide text-primary font-bold inline">
            {term?.name}
          </h3>

          {!synonymsLoading && synonyms.length > 0 && (
            <span className="text-lg text-gray-600 ml-3">
              <span className="text-sm font-medium">Synonyms:</span>{' '}
              {synonyms.map((s, i) => (
                <span key={s.synonymId}>
                  {i > 0 && ', '}
                  <Link
                    to={`/${LANGUAGE_CONFIG.BASE_LANGUAGE_NAME}/${s.synonymTermName}`}
                    className="text-primary hover:underline"
                  >
                    {s.synonymTermName}
                  </Link>
                </span>
              ))}
            </span>
          )}

          {(term?.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {term!.tags.map((tag: ITag) => (
                <Tag key={tag.tagId} {...tag} />
              ))}
            </div>
          )}

          {term?.createdAt && (
            <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatFullDate(term.createdAt)}
            </p>
          )}
        </div>

        <p className="text-md mb-5">{term?.description}</p>
        <p className="text-md mb-10">{term?.reference}</p>

        <div className="flex justify-between items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
          >
            Back to glossary
          </Link>

          {showModal && term?.termId && (
            <AddSuggestionModal
              termId={term.termId}
              languageCode={languageCode}
              onClose={() => setShowModal(false)}
              variant="change"
            />
          )}

          <button
            onClick={() => setShowModal(true)}
            className="border w-[15rem] px-4 py-2 drop-shadow-sm font-bold text-sm tracking-wide"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            Suggest change
          </button>
        </div>

        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
          {navigation.previousTerm && (
            <Link
              to={`/${language}/${navigation.previousTerm.baseName}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">
                {navigation.previousTerm.displayName}
              </span>
            </Link>
          )}

          {navigation.nextTerm && (
            <Link
              to={`/${language}/${navigation.nextTerm.baseName}`}
              className="flex items-center gap-2 text-primary hover:underline ml-auto"
            >
              <span className="text-sm">
                {navigation.nextTerm.displayName}
              </span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default TermDetail;
