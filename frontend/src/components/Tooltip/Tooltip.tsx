import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  description?: string;
  reference?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, description, reference }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!description && !reference) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2">
          <div className="bg-black text-white text-sm rounded-lg shadow-lg p-3">
            {description && (
              <div className={reference ? 'mb-2' : ''}>
                <p className="font-semibold mb-1 text-xs">Definition:</p>
                <p className="text-gray-200 text-xs break-words">{description}</p>
              </div>
            )}

            {reference && (
              <div>
                <p className="font-semibold mb-1 text-xs">Reference:</p>
                <p className="text-gray-200 text-xs break-words">{reference}</p>
              </div>
            )}
          </div>

          <div className="absolute left-1/2 top-full -translate-x-1/2">
            <div className="border-4 border-transparent border-t-black" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
