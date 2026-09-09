import { ScanLine } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5 text-sm text-muted">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent/90">
            <ScanLine className="h-3.5 w-3.5 text-white" strokeWidth={2.4} />
          </span>
          VeriPack
        </div>
        <p className="text-xs text-subtle">
          Prototype — compliance results are indicative and not legal advice.
        </p>
      </div>
    </footer>
  );
}
