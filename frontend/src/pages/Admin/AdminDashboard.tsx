import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LogOut,
  BookOpen,
  MessageSquare,
  Languages,
  Tag,
  FileText,
  Globe,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TermsSection from './sections/TermsSection';
import TranslationsSection from './sections/TranslationsSection';
import TagsSection from './sections/TagsSection';
import SuggestionsSection from './sections/SuggestionsSection';
import LanguagesSection from './sections/LanguagesSection';
import SettingsSection from './sections/SettingsSection';
import { useAdminData } from '../../hooks/useAdminData';
import UntranslatedSection from './sections/UntranslatedSection';
import { ITranslation } from '../../models/models';
import { ADMIN_TABS, AdminTabType, ROUTES } from '../../constants';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTabType>(ADMIN_TABS.TERMS);
  const { translations } = useAdminData();

  const reviewCount =
    (translations as ITranslation[])?.filter(
      (t: ITranslation) => t.status === 'Review'
    ).length || 0;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.HOME);
  };

  const tabs = [
    { id: ADMIN_TABS.TERMS, label: 'Terms', icon: BookOpen },
    { id: ADMIN_TABS.TRANSLATIONS, label: 'Translations', icon: Languages },
    { id: ADMIN_TABS.TAGS, label: 'Tags', icon: Tag },
    { id: ADMIN_TABS.SUGGESTIONS, label: 'Suggestions', icon: MessageSquare },
    { id: ADMIN_TABS.UNTRANSLATED, label: 'Untranslated', icon: FileText },
    { id: ADMIN_TABS.LANGUAGES, label: 'Languages', icon: Globe },
    { id: ADMIN_TABS.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className='bg-white min-h-screen'>
      <div className='container mx-auto flex flex-col pt-10'>
        <div className='flex justify-between items-center mb-8 px-6'>
          <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors'
          >
            <LogOut className='h-4 w-4' />
            Logout
          </button>
        </div>

        <div className='border-b border-gray-200 px-6'>
          <nav className='-mb-px flex space-x-8'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {tab.label}
                  {tab.id === ADMIN_TABS.TRANSLATIONS && reviewCount > 0 && (
                    <span className='ml-1 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                      {reviewCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className='flex-1 px-6 py-8'>
          {activeTab === ADMIN_TABS.TERMS && <TermsSection />}
          {activeTab === ADMIN_TABS.TRANSLATIONS && <TranslationsSection />}
          {activeTab === ADMIN_TABS.TAGS && <TagsSection />}
          {activeTab === ADMIN_TABS.SUGGESTIONS && <SuggestionsSection />}
          {activeTab === ADMIN_TABS.UNTRANSLATED && <UntranslatedSection />}
          {activeTab === ADMIN_TABS.LANGUAGES && <LanguagesSection />}
          {activeTab === ADMIN_TABS.SETTINGS && <SettingsSection />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
