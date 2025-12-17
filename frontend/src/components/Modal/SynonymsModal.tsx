import React, { useState, useEffect } from 'react';
import { ISynonym, ITerm } from '../../models/models';
import { synonymsApi } from '../../api/synonymsApi';
import { termsApi } from '../../api/termsApi';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import { LucideSearch, LucideX, LucideLoader2 } from 'lucide-react';

interface SynonymsModalProps {
  termId: number;
}

const SynonymsModal: React.FC<SynonymsModalProps> = ({ termId }) => {
  const [synonyms, setSynonyms] = useState<ISynonym[]>([]);
  const [searchResults, setSearchResults] = useState<ITerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [deleteAction, setDeleteAction] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    fetchSynonyms();
  }, [termId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await termsApi.get({ search: searchQuery, pageSize: 20 });
        const terms = response.data?.terms || [];
        
        const synonymTermIds = new Set(synonyms.map((s) => s.synonymTermId));
        const filtered = terms.filter(
          (term: ITerm) => term.termId !== termId && !synonymTermIds.has(term.termId)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching terms:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, termId, synonyms]);

  const fetchSynonyms = async () => {
    try {
      setLoading(true);
      const response = await synonymsApi.getByTermId(termId);
      setSynonyms(response.data || []);
    } catch (error) {
      console.error('Error fetching synonyms:', error);
      toast.error('Failed to load synonyms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSynonym = async (synonymTermId: number) => {
    try {
      await synonymsApi.create({
        termId,
        synonymTermId,
      });
      toast.success('Synonym added successfully');
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
      fetchSynonyms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add synonym');
    }
  };

  const handleDeleteClick = (synonym: ISynonym) => {
    setDeleteAction({
      id: synonym.synonymId,
      name: synonym.synonymTermName || 'this synonym',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteAction) return;

    try {
      await synonymsApi.delete(deleteAction.id);
      toast.success('Synonym removed successfully');
      fetchSynonyms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove synonym');
    } finally {
      setDeleteAction(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading synonyms...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
          <LucideSearch className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search terms to add as synonym..."
            className="flex-1 outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <LucideX className="w-4 h-4" />
            </button>
          )}
        </div>

        {showDropdown && searchQuery && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searching ? (
              <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                <LucideLoader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No matching terms found
              </div>
            ) : (
              searchResults.map((term) => (
                <button
                  key={term.termId}
                  onClick={() => handleAddSynonym(term.termId)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{term.name}</div>
                  {term.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {term.description}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}

      <div className="space-y-2">
        {synonyms.length === 0 ? (
          <p className="text-gray-500 text-sm py-2">
            No synonyms yet. Search for terms above to add them as synonyms.
          </p>
        ) : (
          synonyms.map((synonym) => (
            <div
              key={synonym.synonymId}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{synonym.synonymTermName}</div>
                {synonym.synonymTermDescription && (
                  <div className="text-xs text-gray-500 truncate">
                    {synonym.synonymTermDescription}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteClick(synonym)}
                className="ml-2 text-red-600 hover:text-red-800 text-sm px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {deleteAction && (
        <ConfirmModal
          title="Remove Synonym"
          message={
            <>
              Are you sure you want to remove{' '}
              <strong>"{deleteAction.name}"</strong> as a synonym?
            </>
          }
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteAction(null)}
        />
      )}
    </div>
  );
};

export default SynonymsModal;

