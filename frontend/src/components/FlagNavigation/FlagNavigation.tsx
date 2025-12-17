import React from 'react';
import useSWR from 'swr';
import FlagRenderer from './FlagRenderer';
import { fetcher } from '../../api/fetcher';
import { ILanguage, CountryCode } from '../../models/models';
import { filterLanguagesForDisplay } from '../../utils/languageUtils';

interface IProps {
  setLanguage: (lang: ILanguage) => void;
  selectedLanguage?: ILanguage;
  excludeBaseLanguage?: boolean;
}

function FlagNavigation({
  setLanguage,
  selectedLanguage,
  excludeBaseLanguage = false,
}: IProps) {
  const { data: languages, isLoading } = useSWR<ILanguage[]>(`language`, fetcher);

  const typedLanguages: ILanguage[] = (languages || []).map((lang) => ({
    languageId: lang.languageId,
    name: lang.name,
    code: lang.code as CountryCode,
  }));

  const filteredLanguages = filterLanguagesForDisplay(
    typedLanguages,
    !excludeBaseLanguage
  );

  if (!isLoading && excludeBaseLanguage && filteredLanguages.length === 0 && typedLanguages.length > 0) {
    return (
      <div className='w-full py-4 mb-10'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center'>
          <p className='text-yellow-800 font-medium'>
            No translation languages available. Please add more languages to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <nav className='w-full min-h-[6vh] py-2 bg-gradient-to-r mb-10'>
      <div className='w-full h-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent'>
        <div className='flex gap-2 sm:gap-3 md:gap-5 items-center justify-start sm:justify-center px-4 min-w-max sm:min-w-0 sm:flex-wrap sm:px-2'>
          {filteredLanguages?.map((language) => {
            const isSelected = selectedLanguage?.code === language.code;
            return (
              <button
                key={language.code}
                type='button'
                className={`drop-shadow-md w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                  isSelected
                    ? 'ring-2 sm:ring-4 ring-white ring-opacity-80 scale-110 shadow-lg'
                    : ''
                }`}
                onClick={() => setLanguage(language as ILanguage)}
              >
                <FlagRenderer
                  countryCode={language.code as CountryCode}
                  title={language.name}
                  className={isSelected ? 'brightness-110' : ''}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default FlagNavigation;
