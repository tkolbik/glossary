import { X } from 'lucide-react';
import React, { FC, ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  closeFn: () => void;
}

const Modal: FC<IProps> = ({ children, closeFn }) => (
  <div
    id='modal'
    className='fixed flex justify-center items-center bg-[#000]/70 top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'
  >
    <div className='relative w-full h-full bg-[#fff] max-w-md md:h-auto'>
      <div className='relative bg-[#fff] rounded-lg shadow'>
        <button
          type='button'
          className='absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white'
          onClick={closeFn}
        >
          <X />
          <span className='sr-only'>Close modal</span>
        </button>
        <div className='px-6 py-6 lg:px-8'>{children}</div>
      </div>
    </div>
  </div>
);

export default Modal;
