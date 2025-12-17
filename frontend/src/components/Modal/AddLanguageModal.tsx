import React, { FC } from 'react';
import Modal from './Modal';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FlagRenderer from '../FlagNavigation/FlagRenderer';
import { CountryCode } from '../../models/models';
import * as Flags from 'country-flag-icons/react/3x2';
import { languageNames } from '../../utils/languageUtils';
import { useAdminOperations } from '../../hooks/useAdminOperations';

interface IProps {
  closeFn: () => void;
  usedLanguages: CountryCode[];
}

interface IFormInputs {
  language: CountryCode;
  code: string;
}

const schema = yup
  .object({
    code: yup.string().required(),
  })
  .required();

const AddLanguageModal: FC<IProps> = ({ closeFn, usedLanguages }) => {
  const { createLanguage } = useAdminOperations();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });

  const allLanguages = Object.keys(Flags) as CountryCode[];
  const availableLanguages = allLanguages.filter(
    (code): code is keyof typeof languageNames =>
      code in languageNames && !usedLanguages.includes(code)
  );

  const onSubmit = async (data: IFormInputs) => {
    const fullData = {
      name: languageNames[data.code as CountryCode] ?? data.code,
      code: data.code as CountryCode,
    };
    try {
      await createLanguage(fullData);
      closeFn();
    } catch (error) {}
  };

  return (
    <Modal closeFn={closeFn}>
      <div>
        <h2 className='text-lg font-bold tracking-wide uppercase mb-5 text-color-text'>
          Add Language
        </h2>
        <form className='flex flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className='block mb-2 text-sm font-medium text-primary'>
              Select Language
            </label>
            <select
              {...register('code')}
              defaultValue=''
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            >
              <option value='' disabled>
                Select a language
              </option>
              {availableLanguages.map((code) => (
                <option key={code} value={code}>
                  {languageNames[code]}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.language.message}
              </p>
            )}
          </div>

          {watch('code') && (
            <div className='flex items-center gap-2 mt-2'>
              <FlagRenderer
                countryCode={watch('code') as CountryCode}
                title='Preview'
                className='w-8 h-5 rounded'
              />
              <span className='text-sm text-gray-700 font-medium'>
                {languageNames[watch('code') as CountryCode] ?? watch('code')}
              </span>
            </div>
          )}

          <button
            type='submit'
            className='bg-primary text-white font-bold tracking-wide px-4 py-2 rounded-lg w-[10rem]'
          >
            Add Language
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AddLanguageModal;
