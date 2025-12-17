import React, { useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import Modal from './Modal';
import ReCAPTCHA from 'react-google-recaptcha';
import { CountryCode, ISuggestion } from '../../models/models';
import { LANGUAGE_CONFIG } from '../../config/languageConfig';
import { suggestionsApi } from '../../api/suggestionsApi';

interface Props {
  termId?: number;
  languageCode?: CountryCode;
  onClose: () => void;
  variant: 'new' | 'change';
}

interface FormValues extends Omit<ISuggestion, 'termId' | 'termName'> {
  suggestedName?: string;
  captchaToken: string;
}

const AddSuggestionModal: React.FC<Props> = ({
  termId,
  languageCode,
  onClose,
  variant,
}) => {
  const effectiveLanguageCode =
    variant === 'new'
      ? (LANGUAGE_CONFIG.BASE_LANGUAGE_CODE as CountryCode)
      : languageCode!;

  if (variant === 'change' && !languageCode) {
    throw new Error('languageCode is required for change variant');
  }
  const schema = yup.object({
    suggestedName: yup.string().when([], {
      is: () => variant === 'new',
      then: yup.string().required('Term name is required'),
      otherwise: yup.string().notRequired(),
    }),
    description: yup.string().required('Description is required'),
    reference: yup.string().required('Reference is required'),
    reasoning: yup.string().required('Reasoning is required'),
    fullname: yup.string().required('Full name is required'),
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
    captchaToken: yup.string().required(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      suggestedName: '',
      description: '',
      reference: '',
      reasoning: '',
      fullname: '',
      email: '',
      captchaToken: '',
    },
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }

    const payload: Partial<ISuggestion> & { captchaToken: string } = {
      languageCode: effectiveLanguageCode,
      description: data.description,
      reference: data.reference,
      reasoning: data.reasoning,
      fullname: data.fullname,
      email: data.email,
      captchaToken,
    };

    if (variant === 'change') {
      payload.termId = termId;
    }
    
    if (data.suggestedName) {
      payload.suggestedName = data.suggestedName;
    }

    try {
      await suggestionsApi.create(payload);
      toast.success('Suggestion submitted');
      onClose();
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error(
          'You have reached the rate limit for this hour. Please try again later.'
        );
      } else {
        const errorMessage =
          err.response?.data?.message || err.response?.data || err.message;
        toast.error('Error: ' + errorMessage);
      }
    }
  };

  return (
    <Modal closeFn={onClose}>
      <div className='max-h-[90vh] overflow-y-auto p-4 sm:p-8 w-full max-w-lg'>
        <h2 className='text-lg font-bold uppercase mb-5 text-primary'>
          {variant === 'new' ? 'Suggest New Term' : 'Suggest Change'}
        </h2>

        {variant === 'new' && (
          <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <strong>Note:</strong> New term suggestions will be created in{' '}
              {LANGUAGE_CONFIG.BASE_LANGUAGE_NAME} (base language).
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <div>
            <label className='text-sm font-medium text-primary'>
              Term Name
            </label>
            <input
              {...register('suggestedName')}
              className='w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Your proposed term name'
            />
            {errors.suggestedName && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.suggestedName.message}
              </p>
            )}
          </div>

          <div>
            <label className='text-sm font-medium text-primary'>
              Definition
            </label>
            <textarea
              {...register('description')}
              className='w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Definition'
            />
            {errors.description && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label className='text-sm font-medium text-primary'>
              Reference
            </label>
            <input
              type='text'
              {...register('reference')}
              className='w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Reference'
            />
            {errors.reference && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.reference.message}
              </p>
            )}
          </div>
          <div>
            <label className='text-sm font-medium text-primary'>
              Reasoning
            </label>
            <input
              type='text'
              {...register('reasoning')}
              className='w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Why this suggestion?'
            />
            {errors.reasoning && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.reasoning.message}
              </p>
            )}
          </div>
          <div>
            <label className='text-sm font-medium text-primary'>Full Name</label>
            <input
              type='text'
              {...register('fullname')}
              className='w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Full name'
            />
            {errors.fullname && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.fullname.message}
              </p>
            )}
          </div>
          <div>
            <label className='text-sm font-medium text-primary'>Email</label>
            <input
              type='email'
              {...register('email')}
              className='w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='your@email.com'
            />
            {errors.email && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_CAPTCHA_SITE_KEY!}
            onChange={(token) => {
              setCaptchaToken(token);
              setValue('captchaToken', token || '');
            }}
          />

          <button
            type='submit'
            disabled={isSubmitting}
            className='bg-primary text-white font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-50 mt-4'
          >
            Submit
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AddSuggestionModal;
