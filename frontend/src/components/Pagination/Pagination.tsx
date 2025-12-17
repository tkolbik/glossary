import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  totalPages: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<Props> = ({
  totalPages,
  currentPage,
  onPageChange,
  isLoading = false,
}) => {
  const delta = 2;
  const pages: (number | '...')[] = [];

  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  if (start > 2) {
    pages.push(1, '...');
  } else {
    pages.push(1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push('...', totalPages);
  } else {
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center mt-10 gap-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center gap-1.5 px-4 py-3 text-white text-center bg-primary rounded 
          drop-shadow-lg uppercase font-semibold transition-all duration-200 hover:scale-110
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <div className="flex items-center gap-2">
        {pages.map((page, index) =>
          page === '...' ? (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-gray-500 font-semibold select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`min-w-[44px] px-3 py-3 text-center rounded drop-shadow-lg 
                font-semibold transition-all duration-200 hover:scale-110
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center gap-1.5 px-4 py-3 text-white text-center bg-primary rounded 
          drop-shadow-lg uppercase font-semibold transition-all duration-200 hover:scale-110
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
