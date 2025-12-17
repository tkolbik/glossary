import React from 'react';
import { Link } from 'react-router-dom';
import { ILanguage, ITerm } from '../../models/models';
import { getNavigationName } from '../../utils/languageUtils';

interface IProps {
  term: ITerm;
  currentLanguage: ILanguage;
}

function Term({ term, currentLanguage }: IProps) {
  const navigationName = getNavigationName(term);

  return (
    <Link
      data-popover-target='popover-default'
      to={`${currentLanguage.name}/${navigationName}`}
      className='block text-white text-center bg-primary rounded py-4 px-2 drop-shadow-lg uppercase font-semibold w-full sm:w-auto transition-all duration-200 hover:scale-110'
    >
      {term.name}
    </Link>
  );
}

export default Term;
