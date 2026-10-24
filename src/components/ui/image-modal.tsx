import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
  externalUrl?: string | null;
  externalLabel?: string;
}

export function ImageModal({ open, onOpenChange, src, alt, externalUrl, externalLabel = 'Open in new tab' }: ImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-border p-0 overflow-hidden">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative">
          <img src={src} alt={alt} className="w-full max-h-[75vh] object-contain bg-card" />
          {/* Back arrow - close modal */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute left-4 top-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors"
            aria-label="Close"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-background/80 px-3 py-1.5 text-sm font-medium backdrop-blur-sm border border-border hover:bg-background transition-colors"
            >
              {externalLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
