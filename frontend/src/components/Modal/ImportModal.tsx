import React, { FC } from 'react';
import Modal from './Modal';

interface ImportModalProps {
  headers: string[];
  onSubmit: (mapping: Record<string, string>, customDate?: string) => void;
  closeFn: () => void;
  variant: 'term' | 'translation';
  selectedLanguageCode?: string;
}

const ImportModal: FC<ImportModalProps> = ({
  headers,
  onSubmit,
  closeFn,
  variant,
  selectedLanguageCode,
}) => {
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [customDate, setCustomDate] = React.useState<string>('');
  const [useCustomDate, setUseCustomDate] = React.useState<boolean>(false);

  const handleChange = (field: string, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const fields =
    variant === 'term'
      ? ['Name', 'Description', 'Reference']
      : ['BaseLanguageName', 'TranslatedName', 'TranslatedDescription'];

  const getLabel = (field: string) => {
    if (variant === 'term') return field;
    if (field === 'BaseLanguageName') return 'Base Language Name of already existing term';
    if (field === 'TranslatedName') return `${selectedLanguageCode} Name`;
    if (field === 'TranslatedDescription')
      return `${selectedLanguageCode} Description`;
    return field;
  };

  return (
    <Modal closeFn={closeFn}>
      <div>
        <h2 className='text-lg font-bold mb-4'>
          {variant === 'term' ? 'Map Term Columns' : 'Map Translation Columns'}
        </h2>
        {fields.map((field) => (
          <div key={field} className='mb-4'>
            <label className='block mb-1'>{getLabel(field)}</label>
            <select
              value={mapping[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              className='w-full p-2 border rounded'
            >
              <option value=''>Select Column</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        ))}
        
        {variant === 'term' && (
          <div className='mb-4 p-4 border rounded bg-gray-50'>
            <div className='flex items-center mb-2'>
              <input
                type='checkbox'
                id='useCustomDate'
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
                className='mr-2'
              />
              <label htmlFor='useCustomDate' className='font-medium'>
                Set custom creation date (for historical terms)
              </label>
            </div>
            {useCustomDate && (
              <div>
                <label className='block mb-1 text-sm text-gray-600'>
                  Creation Date
                </label>
                <input
                  type='date'
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className='w-full p-2 border rounded'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  All imported terms will share this creation date
                </p>
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={() => onSubmit(mapping, useCustomDate ? customDate : undefined)}
          className='bg-primary text-white px-4 py-2 rounded'
        >
          Confirm Mapping
        </button>
      </div>
    </Modal>
  );
};

export default ImportModal;
