import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageUp, RefreshCw, X } from 'lucide-react';
import { cn } from '../../lib/format';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
const MAX_BYTES = 10 * 1024 * 1024;

export function ImageDropzone({ file, onSelect, onError, disabled }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const accept = useCallback(
    (candidate) => {
      if (!candidate) return;
      if (!ACCEPTED.includes(candidate.type)) {
        onError('Unsupported file type. Upload a JPG, PNG or WebP image.');
        return;
      }
      if (candidate.size > MAX_BYTES) {
        onError('That image is larger than 10 MB. Try a smaller capture.');
        return;
      }
      onError(null);
      onSelect(candidate);
    },
    [onError, onSelect],
  );

  useEffect(() => {
    const onPaste = (event) => {
      const item = [...(event.clipboardData?.files ?? [])][0];
      if (item) accept(item);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [accept]);

  if (file && preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <img src={preview} alt="Selected package" className="max-h-[26rem] w-full object-contain" />
        <div className="flex items-center justify-between gap-3 border-t border-line bg-elevated/70 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink">{file.name}</p>
            <p className="text-2xs text-subtle">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-white/[0.06] hover:text-ink focus-ring disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Replace
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(null)}
              aria-label="Remove image"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-ink focus-ring disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(event) => accept(event.target.files?.[0])}
        />
      </motion.div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        accept(event.dataTransfer.files?.[0]);
      }}
      className={cn(
        'group relative flex min-h-[18rem] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center transition-all duration-200 focus-ring',
        dragging
          ? 'border-accent bg-accent-dim'
          : 'border-line-strong bg-surface hover:border-white/25 hover:bg-elevated',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <span
        className={cn(
          'grid h-12 w-12 place-items-center rounded-xl border border-line bg-elevated transition-transform duration-200',
          dragging ? 'scale-110 text-accent-soft' : 'text-muted group-hover:scale-105',
        )}
      >
        <ImageUp className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <p className="mt-5 text-sm font-medium text-ink">
        Drop a package photo, or <span className="text-accent-soft">browse</span>
      </p>
      <p className="mt-1.5 text-xs text-muted">JPG, PNG or WebP · up to 10 MB · paste works too</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(event) => accept(event.target.files?.[0])}
      />
    </div>
  );
}
