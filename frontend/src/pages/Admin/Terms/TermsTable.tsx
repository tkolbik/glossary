import React, { useState } from 'react';
import { ITag, ITerm } from '../../../models/models';
import { LucideEdit, LucideTrash, LucideClock, LucideLink2 } from 'lucide-react';
import TermsModal from './TermsModal';
import SynonymsModal from './SynonymsModal';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { useAdminOperations } from '../../../hooks/useAdminOperations';
import { formatDate } from '../../../utils/dateUtils';

interface TermsTableProps {
  terms: ITerm[];
  tags: ITag[] | undefined;
}

const TermsTable: React.FC<TermsTableProps> = ({ terms, tags }) => {
  const { updateTerm, deleteTerm } = useAdminOperations();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSynonymsModal, setShowSynonymsModal] = useState(false);
  const [termToEdit, setTermToEdit] = useState<Partial<ITerm> | null>(null);
  const [termForSynonyms, setTermForSynonyms] = useState<ITerm | null>(null);
  const [termToDelete, setTermToDelete] = useState<ITerm | null>(null);

  const handleEditClick = (term: ITerm) => {
    setTermToEdit(term);
    setShowEditModal(true);
  };

  const handleSynonymsClick = (term: ITerm) => {
    setTermForSynonyms(term);
    setShowSynonymsModal(true);
  };

  const handleDeleteClick = (term: ITerm) => {
    setTermToDelete(term);
  };

  const confirmDelete = async (term: ITerm) => {
    try {
      await deleteTerm(term.termId);
      setTermToDelete(null);
    } catch (error) {}
  };

  return (
    <div className='space-y-4'>
      {terms && Array.isArray(terms) ? (
        terms.map((term) => (
          <div
            key={term.termId}
            className='p-5 bg-white rounded shadow flex justify-between items-center'
          >
            <div>
              <p className='font-semibold'>{term.name}</p>
              <p className='text-sm text-gray-600'>{term.description}</p>
              <p className='text-sm text-gray-500'>{term.reference}</p>
              {term.createdAt && (
                <p className='text-xs text-gray-400 mt-2 flex items-center gap-1'>
                  <LucideClock className='w-3 h-3' />
                  {formatDate(term.createdAt)}
                </p>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <button
                className='text-primary px-4 py-2 hover:scale-110'
                onClick={() => handleEditClick(term)}
                title='Edit term'
              >
                <LucideEdit />
              </button>
              <button
                className='text-blue-600 px-4 py-2 hover:scale-110'
                onClick={() => handleSynonymsClick(term)}
                title='Manage synonyms'
              >
                <LucideLink2 />
              </button>
              <button
                className='text-red px-4 py-2 hover:scale-110'
                onClick={() => handleDeleteClick(term)}
                title='Delete term'
              >
                <LucideTrash />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>No terms found</p>
          <p className='text-gray-400 text-sm mt-1'>
            Add your first term to get started
          </p>
        </div>
      )}

      {showEditModal && termToEdit && (
        <TermsModal
          closeFn={() => {
            setShowEditModal(false);
            setTermToEdit(null);
          }}
          tags={tags}
          initialData={termToEdit}
          onSubmit={async (data: ITerm) => {
            await updateTerm(termToEdit.termId!, data);
          }}
          variant='term'
        />
      )}

      {showSynonymsModal && termForSynonyms && (
        <SynonymsModal
          closeFn={() => {
            setShowSynonymsModal(false);
            setTermForSynonyms(null);
          }}
          termId={termForSynonyms.termId}
          termName={termForSynonyms.name}
        />
      )}

      {termToDelete && (
        <ConfirmModal
          title='Confirm Deletion'
          message={
            <>
              Are you sure you want to delete the term{' '}
              <strong>{termToDelete?.name}</strong>? This will also delete all
              translations associated with this term.
            </>
          }
          confirmLabel='Delete'
          cancelLabel='Cancel'
          onCancel={() => setTermToDelete(null)}
          onConfirm={() => termToDelete && confirmDelete(termToDelete)}
        />
      )}
    </div>
  );
};

export default TermsTable;
