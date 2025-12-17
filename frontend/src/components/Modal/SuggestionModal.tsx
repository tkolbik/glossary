import React, { useState } from 'react';
import { ISuggestion } from '../../models/models';
import {
  X,
  Check,
  XCircle,
  Globe,
  User,
  Mail,
  FileText,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { isBaseLanguageCode, getLanguageDisplayName } from '../../utils/languageUtils';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { SWR_KEYS } from '../../constants';
import { suggestionsApi } from '../../api/suggestionsApi';

interface SuggestionModalProps {
  suggestion: ISuggestion;
  onClose: () => void;
}

const getErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (typeof error?.response?.data === 'string') {
    return error.response.data;
  }
  return error?.message || fallback;
};

const SuggestionModal: React.FC<SuggestionModalProps> = ({
  suggestion,
  onClose,
}) => {
  const {
    suggestionId,
    termId,
    suggestedName,
    languageCode,
    fullname,
    reasoning,
    reference,
    description,
    email,
  } = suggestion;

  const [baseTermName, setBaseTermName] = useState('');
  const [baseDescription, setBaseDescription] = useState('');
  const [baseReference, setBaseReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isNewSuggestion = termId === null;
  const isNonBaseLanguage = !isBaseLanguageCode(languageCode);
  const languageName = getLanguageDisplayName(languageCode);

  const handleApprove = async () => {
    if (isNonBaseLanguage && isNewSuggestion) {
      if (!baseTermName.trim() || !baseDescription.trim()) {
        toast.error(
          'Base language term name and description are required for non-base language suggestions'
        );
        return;
      }
    }

    setIsProcessing(true);
    const payload = {
      suggestionId,
      termId,
      suggestedName,
      languageCode,
      fullname,
      reasoning,
      reference,
      description,
      email,
      ...(isNonBaseLanguage &&
        isNewSuggestion && {
          baseTermName,
          baseDescription,
          baseReference,
        }),
    };

    try {
      const response = await suggestionsApi.approve(payload);
      toast.success(
        response.data.message || 'Suggestion approved successfully!'
      );
      mutate(SWR_KEYS.SUGGESTIONS);
      mutate(SWR_KEYS.TERMS);
      mutate(SWR_KEYS.TRANSLATIONS);
      onClose();
    } catch (error: any) {
      toast.error(
        getErrorMessage(error, 'An error occurred. Please try again.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await suggestionsApi.delete(suggestionId);
      toast.success('Suggestion rejected');
      mutate(SWR_KEYS.SUGGESTIONS);
      onClose();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Reject failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        <div className='bg-gradient-to-r from-primary to-primary/80 text-white p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-lg'>
                {isNewSuggestion ? (
                  <FileText className='w-6 h-6' />
                ) : (
                  <ExternalLink className='w-6 h-6' />
                )}
              </div>
              <div>
                <h2 className='text-xl font-bold'>
                  {isNewSuggestion
                    ? 'New Term Suggestion'
                    : 'Change Suggestion'}
                </h2>
                <p className='text-white/80 text-sm'>
                  Review and approve or reject this suggestion
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Globe className='w-5 h-5 text-primary' />
                  Suggestion Details
                </h3>

                <div className='space-y-4'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Suggested Name
                    </label>
                    <div className='text-lg font-semibold text-gray-900'>
                      {suggestedName}
                    </div>
                  </div>

                  {description && (
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Description
                      </label>
                      <div className='text-gray-900 whitespace-pre-wrap'>
                        {description}
                      </div>
                    </div>
                  )}

                  {reference && (
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Reference
                      </label>
                      <div className='text-gray-900'>{reference}</div>
                    </div>
                  )}

                  {reasoning && (
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                      <label className='block text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2'>
                        <Lightbulb className='w-4 h-4' />
                        Reasoning
                      </label>
                      <div className='text-yellow-700 whitespace-pre-wrap'>
                        {reasoning}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h4 className='font-semibold text-blue-900 mb-2'>
                  Language Information
                </h4>
                <div className='text-blue-800'>
                  <p>
                    <strong>Language:</strong> {languageName}
                  </p>
                  <p>
                    <strong>Type:</strong>{' '}
                    {isNewSuggestion ? 'New Term' : 'Term Change'}
                  </p>
                </div>
              </div>

              {isNonBaseLanguage && isNewSuggestion && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Base Language Term Details
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Base Language Name *
                      </label>
                      <input
                        type='text'
                        value={baseTermName}
                        onChange={(e) => setBaseTermName(e.target.value)}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent'
                        placeholder='Enter base language term name'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Base Language Description *
                      </label>
                      <textarea
                        value={baseDescription}
                        onChange={(e) => setBaseDescription(e.target.value)}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent'
                        rows={3}
                        placeholder='Enter base language description'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Base Language Reference
                      </label>
                      <input
                        type='text'
                        value={baseReference}
                        onChange={(e) => setBaseReference(e.target.value)}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent'
                        placeholder='Enter base language reference'
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  Contact Information
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-700'>{email}</span>
                  </div>
                  {fullname && (
                    <div className='flex items-center gap-2'>
                      <User className='w-4 h-4 text-gray-500' />
                      <span className='text-gray-700'>{fullname}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-gray-50 px-6 py-4 flex items-center justify-between'>
          <div className='flex gap-3'>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className='flex items-center gap-2 px-4 py-2 bg-red text-black rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              <XCircle className='w-4 h-4' />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className='flex items-center gap-2 px-4 py-2 bg-green text-black rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              <Check className='w-4 h-4' />
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;

