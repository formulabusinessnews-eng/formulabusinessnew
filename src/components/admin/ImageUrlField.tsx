import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadPortalImage } from '../../lib/uploadPortalImage';

type ImageUrlFieldProps = {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  inputClassName?: string;
};

export const ImageUrlField: React.FC<ImageUrlFieldProps> = ({
  value,
  onChange,
  folder,
  placeholder = 'URL da imagem',
  hint,
  required,
  inputClassName = 'bg-[#061827]'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadPortalImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none font-mono text-[11px] ${inputClassName}`}
      />
      <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#D9A928] text-black text-[10px] font-bold cursor-pointer">
        <Upload className="w-3 h-3" />
        {uploading ? 'Enviando...' : 'Enviar imagem'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={e => {
            const file = e.target.files?.[0];
            e.target.value = '';
            void handleFile(file);
          }}
        />
      </label>
      {hint && <p className="text-[10px] text-[#D9A928] leading-snug">{hint}</p>}
      {error && <p className="text-[10px] text-red-400 leading-snug">{error}</p>}
    </div>
  );
};
