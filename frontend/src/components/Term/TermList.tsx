import React from 'react';
import { Link } from 'react-router-dom';
import { ILanguage, ITerm } from '../../models/models';
import { getNavigationName } from '../../utils/languageUtils';

interface IProps {
  term: ITerm;
  currentLanguage: ILanguage;
}

function TermList({ term, currentLanguage }: IProps) {
  const navigationName = getNavigationName(term);

  return (
    <Link
      to={`${currentLanguage.name}/${navigationName}`}
      className='block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary/30 group'
    >
      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors flex-1 mr-2'>
            {term.name}
          </h3>
        </div>

        {term.description && (
          <p
            className='text-gray-600 text-sm mb-2 overflow-hidden'
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {term.description}
          </p>
        )}

        {term.reference && (
          <p className='text-gray-500 text-xs'>
            <span className='font-medium'>Reference:</span> {term.reference}
          </p>
        )}

        {term.tags && term.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mt-2'>
            {term.tags.map((tag) => (
              <span
                key={tag.tagId}
                className='inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full'
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default TermList;
