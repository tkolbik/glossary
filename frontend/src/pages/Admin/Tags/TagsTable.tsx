import React, { useState } from 'react';
import { ITag } from '../../../models/models';
import { LucideEdit, LucideTrash } from 'lucide-react';
import TagModal from '../../../components/Modal/TagModal';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { useAdminOperations } from '../../../hooks/useAdminOperations';

interface TagsTableProps {
  tags: ITag[];
}

const TagsTable: React.FC<TagsTableProps> = ({ tags }) => {
  const { updateTag, deleteTag } = useAdminOperations();
  const [tagToEdit, setTagToEdit] = useState<ITag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<ITag | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (tag: ITag) => {
    setTagToEdit(tag);
    setShowEditModal(true);
  };

  const handleDeleteClick = (tag: ITag) => {
    setTagToDelete(tag);
  };

  const confirmDelete = async (tag: ITag) => {
    try {
      await deleteTag(tag.tagId);
      setTagToDelete(null);
    } catch (error) {}
  };

  return (
    <div className='space-y-4'>
      {tags.map((tag) => (
        <div
          key={tag.tagId}
          className='p-5 bg-white rounded shadow flex justify-between items-center'
        >
          <div>
            <p className='font-semibold'>{tag.name}</p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              className='text-primary px-4 py-2 hover:scale-110'
              onClick={() => handleEditClick(tag)}
            >
              <LucideEdit />
            </button>
            <button
              className='text-red px-4 py-2 hover:scale-110'
              onClick={() => handleDeleteClick(tag)}
            >
              <LucideTrash />
            </button>
          </div>
        </div>
      ))}
      {tagToEdit && showEditModal && (
        <TagModal
          initialData={tagToEdit}
          closeFn={() => setShowEditModal(false)}
          onSubmit={async (data, isEdit) => {
            try {
              await updateTag(tagToEdit.tagId, data);
            } catch (error) {
              throw error;
            }
          }}
        />
      )}
      {tagToDelete && (
        <ConfirmModal
          title='Confirm Deletion'
          message={
            <>
              Are you sure you want to delete the tag{' '}
              <strong>"{tagToDelete?.name}"</strong>?
            </>
          }
          confirmLabel='Delete'
          cancelLabel='Cancel'
          onCancel={() => setTagToDelete(null)}
          onConfirm={() => tagToDelete && confirmDelete(tagToDelete)}
        />
      )}
    </div>
  );
};

export default TagsTable;
