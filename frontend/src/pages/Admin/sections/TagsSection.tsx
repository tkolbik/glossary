import React, { useState } from 'react';
import TagsTable from '../Tags/TagsTable';
import { useAdminData } from '../../../hooks/useAdminData';
import { Plus } from 'lucide-react';
import TagModal from '../../../components/Modal/TagModal';
import { useAdminOperations } from '../../../hooks/useAdminOperations';

const TagsSection: React.FC = () => {
  const { tags, tagsLoading, tagsError } = useAdminData();
  const { createTag } = useAdminOperations();
  const [showTagModal, setShowTagModal] = useState(false);

  if (tagsLoading) return <p>Loading...</p>;
  if (tagsError) return <p>Error loading tags.</p>;

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold'>Tags</h2>
        <button
          onClick={() => setShowTagModal(true)}
          className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition'
        >
          <Plus className='w-4 h-4' />
          Add Tag
        </button>
      </div>

      {showTagModal && (
        <TagModal
          closeFn={() => setShowTagModal(false)}
          onSubmit={async (data) => {
            await createTag(data);
          }}
        />
      )}

      <TagsTable tags={tags || []} />
    </div>
  );
};

export default TagsSection;
