import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Escape closes; focus starts on the safe choice (Cancel)
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => cancelRef.current?.focus(), 50);
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-start gap-4 p-5 pb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirm-title" className="font-semibold text-sm text-foreground">{title}</h3>
                <p id="confirm-message" className="text-sm mt-1 text-muted-foreground">{message}</p>
              </div>
              <button
                onClick={onCancel}
                aria-label="Close"
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-border">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/70 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
