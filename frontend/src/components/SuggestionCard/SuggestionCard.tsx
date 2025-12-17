import React from 'react';
import { ISuggestion } from '../../models/models';
import { User, Globe, Edit3, Plus, Clock } from 'lucide-react';
import { LANGUAGE_CONFIG } from '../../config/languageConfig';

interface SuggestionCardProps {
  suggestion: ISuggestion;
  onClick: () => void;
  type: 'new' | 'change';
  currentDescription?: string;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onClick,
  type,
  currentDescription,
}) => {
  const isNewSuggestion = type === 'new';
  const displayName = isNewSuggestion
    ? suggestion.suggestedName || 'Untitled'
    : suggestion.termName || 'Untitled';
  const languageName =
    suggestion.languageCode === LANGUAGE_CONFIG.BASE_LANGUAGE_CODE
      ? LANGUAGE_CONFIG.BASE_LANGUAGE_NAME
      : suggestion.languageCode;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-200 hover:border-primary/30 group'>
      <div onClick={handleCardClick}>
        <div className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              {isNewSuggestion ? (
                <div className='flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium'>
                  <Plus className='w-3 h-3' />
                  New Term
                </div>
              ) : (
                <div className='flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium'>
                  <Edit3 className='w-3 h-3' />
                  Change
                </div>
              )}
              <div className='flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs'>
                <Globe className='w-3 h-3' />
                {languageName}
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors'>
              {displayName}
            </h3>

            {suggestion.description && (
              <div className='space-y-2'>
                {!isNewSuggestion && currentDescription && (
                  <div className='bg-gray-50 border border-gray-200 rounded-md p-2'>
                    <p className='text-gray-700 text-xs font-medium'>
                      Current:
                    </p>
                    <p className='text-gray-600 text-xs mt-1 line-clamp-2'>
                      {currentDescription}
                    </p>
                  </div>
                )}
                <div className='bg-blue-50 border border-blue-200 rounded-md p-2'>
                  <p className='text-blue-800 text-xs font-medium'>
                    {isNewSuggestion ? 'Proposed:' : 'Suggested Change:'}
                  </p>
                  <p className='text-blue-700 text-xs mt-1 line-clamp-2'>
                    {suggestion.description}
                  </p>
                </div>
              </div>
            )}

            {suggestion.reasoning && (
              <div className='bg-yellow-50 border border-yellow-200 rounded-md p-2'>
                <p className='text-yellow-800 text-xs font-medium'>
                  Reasoning:
                </p>
                <p className='text-yellow-700 text-xs mt-1 line-clamp-2'>
                  {suggestion.reasoning}
                </p>
              </div>
            )}
          </div>

          <div className='mt-4 pt-3 border-t border-gray-100'>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <div className='flex items-center gap-1'>
                <User className='w-3 h-3' />
                <span className='truncate max-w-32'>{suggestion.email}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='w-3 h-3' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
