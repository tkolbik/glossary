import React, { FC } from 'react';
import Modal from '../../../components/Modal/Modal';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { ITag, ITerm } from '../../../models/models';
import TagsSelector from '../../../components/TagsSelector/TagsSelector';

const getSchema = (variant: 'term' | 'translation') => {
  return yup.object({
    name: yup.string().required(),
    description: yup.string().required(),
    reference:
      variant === 'term' ? yup.string().required() : yup.string().optional(),
    tags: yup.string().optional(),
  });
};

interface IProps {
  closeFn: () => void;
  tags?: ITag[];
  onSubmit: (data: any) => void;
  initialData?: Partial<ITerm>;
  selectedLanguageCode?: string;
  variant: 'term' | 'translation';
}

const TermsModal: FC<IProps> = ({
  closeFn,
  tags,
  onSubmit,
  initialData,
  selectedLanguageCode,
  variant,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITerm>({
    resolver: yupResolver(getSchema(variant)),
    defaultValues: {
      name: initialData?.name || '',
      reference: initialData?.reference || '',
      description: initialData?.description || '',
      termId: initialData?.termId,
      languageCode: initialData?.languageCode,
    },
  });

  const [selectedTags, setSelectedTags] = useState<ITag[]>(
    initialData?.tags ?? []
  );

  const [markTranslationsForReview, setMarkTranslationsForReview] =
    useState(false);

  const [useCustomDate, setUseCustomDate] = useState<boolean>(
    !!initialData?.createdAt
  );
  const [customDate, setCustomDate] = useState<string>(() => {
    if (initialData?.createdAt) {
      const date = new Date(initialData.createdAt);
      return date.toISOString().slice(0, 10);
    }
    return '';
  });

  const internalSubmit = async (data: ITerm) => {
    try {
      await onSubmit({
        ...data,
        termId: initialData?.termId,
        ...(variant === 'term' && { tags: selectedTags }),
        ...(variant === 'term' && useCustomDate && customDate && { createdAt: customDate }),
        markTranslationsForReview: markTranslationsForReview,
      });
      closeFn();
    } catch (error) {
    }
  };

  return (
    <Modal closeFn={closeFn}>
      <div>
        <form
          className='flex flex-col gap-5'
          onSubmit={handleSubmit(internalSubmit)}
        >
          <div>
            <p>{errors.name?.message}</p>
            <label className='block mb-2 text-sm font-medium text-primary'>
              Term name
            </label>
            <input
              type='text'
              className='input-class'
              {...register('name')}
              placeholder='Name'
            />
          </div>

          <div className='w-full max-w-2xl mx-auto'>
            <label className='block mb-2 text-sm font-medium text-primary'>
              Term description
            </label>
            <textarea
              className='input-class w-full'
              {...register('description')}
              placeholder='Description'
            />
          </div>

          {variant === 'term' && (
            <div className='w-full max-w-2xl mx-auto'>
              <label className='block mb-2 text-sm font-medium text-primary'>
                Term reference
              </label>
              <textarea
                className='input-class w-full'
                {...register('reference')}
                placeholder='Reference'
              />
            </div>
          )}

          {variant === 'term' && (
            <TagsSelector
              tags={tags}
              selectedTags={selectedTags}
              onChange={(tags) => setSelectedTags(tags)}
            />
          )}

          {variant === 'term' && (
            <div className='p-4 border rounded bg-gray-50'>
              <div className='flex items-center mb-2'>
                <input
                  type='checkbox'
                  id='useCustomDate'
                  checked={useCustomDate}
                  onChange={(e) => setUseCustomDate(e.target.checked)}
                  className='mr-2'
                />
                <label htmlFor='useCustomDate' className='font-medium text-sm'>
                  {initialData ? 'Edit creation date' : 'Set custom creation date (for historical terms)'}
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
                    {initialData 
                      ? 'Update the creation date for this term'
                      : 'Set when this term was originally created'}
                  </p>
                </div>
              )}
            </div>
          )}

          {variant === 'term' && initialData && (
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='markTranslationsForReview'
                checked={markTranslationsForReview}
                onChange={(e) => setMarkTranslationsForReview(e.target.checked)}
                className='w-4 h-4 text-primary'
              />
              <label
                htmlFor='markTranslationsForReview'
                className='text-sm font-medium text-primary'
              >
                Mark translations for review
              </label>
            </div>
          )}

          {variant === 'term' && initialData && markTranslationsForReview && (
            <p className='text-xs text-gray-500'>
              All existing translations of this term will be marked for review.
            </p>
          )}

          <button
            type='submit'
            className='bg-primary text-white font-bold tracking-wide px-4 py-2 rounded-lg w-[10rem]'
          >
            {variant === 'term' && (initialData ? 'Update term' : 'Add term')}
            {variant === 'translation' &&
              (initialData ? 'Update translation' : 'Translate')}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default TermsModal;
