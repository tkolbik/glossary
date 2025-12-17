import React from 'react';

interface AlphabetFilterProps {
  onFilterChange: (letter: string) => void;
  activeLetter: string;
}

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const AlphabetFilter: React.FC<AlphabetFilterProps> = ({
  onFilterChange,
  activeLetter,
}) => {
  return (
    <div className='flex flex-wrap justify-center space-x-1 md:space-x-2 my-3 md:my-5'>
      {ALPHABET.map((letter) => (
        <button
          key={letter}
          onClick={() => onFilterChange(letter)}
          className={`px-3 py-1 font-semibold rounded transition-all duration-200 
                        ${
                          activeLetter === letter
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-primary hover:text-white'
                        }`}
        >
          {letter}
        </button>
      ))}
      <button
        onClick={() => onFilterChange('')}
        className={`px-3 py-1 font-semibold rounded transition-all duration-200 
                    ${
                      activeLetter === ''
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-primary hover:text-white'
                    }`}
      >
        All
      </button>
    </div>
  );
};

export default AlphabetFilter;
