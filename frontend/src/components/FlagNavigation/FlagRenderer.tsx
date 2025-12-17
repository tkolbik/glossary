import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

type CountryCode = keyof typeof Flags;

interface FlagRendererProps {
  countryCode: CountryCode;
  title: string;
  className?: string;
}

const FlagRenderer: React.FC<FlagRendererProps> = ({
  countryCode,
  title,
  className,
}) => {
  const Flag = Flags[countryCode];
  if (!Flag) {
    return <span title='Unknown'></span>;
  }
  return <Flag title={title} className={className} />;
};

export default FlagRenderer;

