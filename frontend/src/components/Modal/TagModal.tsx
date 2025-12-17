import React, { FC } from 'react';
import Modal from './Modal';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ITag } from '../../models/models';

interface IProps {
  closeFn: () => void;
  initialData?: ITag;
  onSubmit: (data: ITag, isEdit: boolean) => void;
}

const schema = yup.object({
  name: yup.string().required('Tag name is required'),
});

const TagModal: FC<IProps> = ({ closeFn, initialData, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITag>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      tagId: initialData?.tagId || 0,
    },
  });

  const internalSubmit = async (data: ITag) => {
    await onSubmit(data, !!initialData?.name);
    closeFn();
  };

  return (
    <Modal closeFn={closeFn}>
      <div>
        <h2 className='text-lg font-bold tracking-wide uppercase mb-5 text-color-text'>
          {initialData ? 'Edit Tag' : 'Add Tag'}
        </h2>
        <form
          className='flex flex-col gap-5'
          onSubmit={handleSubmit(internalSubmit)}
        >
          <div>
            <label className='block mb-2 text-sm font-medium text-primary'>
              Tag Name
            </label>
            <input
              type='text'
              {...register('name')}
              placeholder='Tag name'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5'
            />
            {errors.name && (
              <p className='text-red-600 text-sm mt-1'>{errors.name.message}</p>
            )}
          </div>
          <button
            type='submit'
            className='bg-primary text-white font-bold tracking-wide px-4 py-2 rounded-lg w-[10rem]'
          >
            {initialData ? 'Update Tag' : 'Add Tag'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default TagModal;
