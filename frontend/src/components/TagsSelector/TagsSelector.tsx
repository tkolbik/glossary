import { X } from 'lucide-react';
import React from 'react';
import { ITag } from '../../models/models';

interface IProps {
  tags: ITag[] | undefined;
  selectedTags: ITag[];
  onChange: (tags: ITag[]) => void;
}

const TagsSelector: React.FC<IProps> = ({ tags, selectedTags, onChange }) => {
  const toggleTag = (tag: ITag) => {
    if (selectedTags.some((t) => t.tagId === tag.tagId)) {
      onChange(selectedTags.filter((t) => t.tagId !== tag.tagId));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const clearTags = () => {
    onChange([]);
  };

  return (
    <div className='bg-white rounded-xl shadow-md p-6 transition-all duration-200 ease-in-out'>
      <div className='flex flex-wrap items-center gap-3 mb-4'>
        <span className='text-sm font-medium text-gray-700'>Select tags:</span>
        {selectedTags.length > 0 && (
          <button
            onClick={clearTags}
            className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200'
          >
            Clear all
          </button>
        )}
      </div>

      <div className='flex flex-wrap gap-2'>
        {tags?.map((tag: ITag) => (
          <button
            type='button'
            key={tag.tagId}
            onClick={() => toggleTag(tag)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 hover:shadow-lg ${
              selectedTags.some((t) => t.tagId === tag.tagId)
                ? 'bg-primary text-white'
                : 'bg-gray-light text-black'
            }`}
          >
            {tag.name}
            {selectedTags.some((t) => t.tagId === tag.tagId) && <X />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagsSelector;
