import React from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud } from 'lucide-react';

const FileUpload = ({
  onHeadersExtracted,
  displayString,
}: {
  onHeadersExtracted: (headers: string[], file: File) => void;
  displayString?: string;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const headers = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      })[0] as string[];
      onHeadersExtracted(headers, file);
      e.target.value = '';
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className='w-[20rem]'>
      <label
        htmlFor='file_input'
        className='flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md cursor-pointer hover:bg-primary/90 transition'
      >
        <UploadCloud className='w-5 h-5' />
        {displayString}
      </label>
      <input
        type='file'
        id='file_input'
        accept='.xlsx,.xls'
        onChange={handleFileChange}
        className='hidden'
      />
    </div>
  );
};

export default FileUpload;
