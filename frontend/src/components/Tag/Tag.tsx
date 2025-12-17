import { ITag } from '../../models/models';

const Tag = ({ name }: ITag) => (
  <div className='px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 hover:shadow-lg bg-gray-light text-black'>
    {name}
  </div>
);

export default Tag;
