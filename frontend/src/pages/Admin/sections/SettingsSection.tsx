import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../../api/settingsApi';

interface Settings {
  email: string;
  senderEmail: string;
  mailjetApiKey: string;
  mailjetApiSecret: string;
}

const SettingsSection: React.FC = () => {
  const [currentSettings, setCurrentSettings] = useState<Settings>({
    email: '',
    senderEmail: '',
    mailjetApiKey: '',
    mailjetApiSecret: '',
  });
  const [savedSettings, setSavedSettings] = useState<Settings>({
    email: '',
    senderEmail: '',
    mailjetApiKey: '',
    mailjetApiSecret: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getSettings();
        const settings = {
          email: response.data.email ?? '',
          senderEmail: response.data.senderEmail ?? '',
          mailjetApiKey: response.data.mailjetApiKey ?? '',
          mailjetApiSecret: response.data.mailjetApiSecret ?? '',
        };
        setCurrentSettings(settings);
        setSavedSettings(settings);
      } catch (loadError: any) {
        setError(
          loadError?.response?.data?.message ||
            'Unable to load the notification settings.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const isDirty = useMemo(() => {
    return Object.keys(currentSettings).some(
      (key) =>
        currentSettings[key as keyof Settings].trim() !==
        savedSettings[key as keyof Settings].trim()
    );
  }, [currentSettings, savedSettings]);

  const handleSave = async () => {
    const trimmedSettings = {
      email: currentSettings.email.trim() || null,
      senderEmail: currentSettings.senderEmail.trim() || null,
      mailjetApiKey: currentSettings.mailjetApiKey.trim() || null,
      mailjetApiSecret: currentSettings.mailjetApiSecret.trim() || null,
    };

    setIsSaving(true);
    setError(null);

    try {
      await settingsApi.updateSettings(trimmedSettings);
      const newSettings = {
        email: trimmedSettings.email ?? '',
        senderEmail: trimmedSettings.senderEmail ?? '',
        mailjetApiKey: trimmedSettings.mailjetApiKey ?? '',
        mailjetApiSecret: trimmedSettings.mailjetApiSecret ?? '',
      };
      setCurrentSettings(newSettings);
      setSavedSettings(newSettings);
      toast.success('Notification settings updated');
    } catch (saveError: any) {
      const errorMessage =
        saveError?.response?.data?.message ||
        'Unable to save the notification settings.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof Settings, value: string) => {
    setCurrentSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <p>Loading settings...</p>;
  }

  return (
    <div className='space-y-6'>
      <div className='max-w-md space-y-4'>
        <label className='block text-sm font-medium text-gray-700'>
          Notification email
        </label>
        <input
          type='email'
          value={currentSettings.email}
          onChange={(event) => updateField('email', event.target.value)}
          placeholder='my@email.com'
          className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
        />

        <label className='block text-sm font-medium text-gray-700'>
          Sender email
        </label>
        <input
          type='email'
          value={currentSettings.senderEmail}
          onChange={(event) => updateField('senderEmail', event.target.value)}
          placeholder='my@email.com'
          className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
        />

        <label className='block text-sm font-medium text-gray-700'>
          Mailjet API key
        </label>
        <input
          type='text'
          value={currentSettings.mailjetApiKey}
          onChange={(event) => updateField('mailjetApiKey', event.target.value)}
          placeholder='mjAXEEXYZ...'
          className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
        />

        <label className='block text-sm font-medium text-gray-700'>
          Mailjet API secret
        </label>
        <input
          type='password'
          value={currentSettings.mailjetApiSecret}
          onChange={(event) => updateField('mailjetApiSecret', event.target.value)}
          placeholder='••••••••'
          className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
        />

        {error && <p className='text-sm text-red-600'>{error}</p>}

        <p className='text-xs text-gray-500'>
          Leave the email empty to disable notifications. Mailjet credentials are required to alert an email.
        </p>

        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition ${
              isSaving || !isDirty
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save settings'}
          </button>
          <span className='text-sm text-gray-500'>
            {savedSettings.email.trim()
              ? 'Notifications active'
              : 'Notifications paused until you save an email'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;

