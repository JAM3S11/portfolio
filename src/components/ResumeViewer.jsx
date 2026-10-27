import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownToLine, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { RESUME_URL, RESUME_FILENAME } from '@/lib/resume';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const MAX_PAGE_WIDTH = 850;

const DownloadButton = ({ className = '' }) => (
  <a
    href={RESUME_URL}
    download={RESUME_FILENAME}
    className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3.5 sm:px-4 text-sm font-semibold text-background hover:bg-brand hover:text-white transition-colors active:scale-95 ${className}`}
  >
    <ArrowDownToLine size={15} />
    Download
  </a>
);

const ResumeViewer = ({ isOpen, onClose }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const bodyRef = useRef(null);
  const closeRef = useRef(null);

  // Esc to close, lock page scroll and move focus into the dialog while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  // Fit pages to the available width
  useEffect(() => {
    const el = bodyRef.current;
    if (!isOpen || !el) return;
    const observer = new ResizeObserver(([entry]) => {
      const padding = window.innerWidth < 640 ? 24 : 64;
      setPageWidth(Math.min(MAX_PAGE_WIDTH, entry.contentRect.width - padding));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center bg-black/60 sm:p-6 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Resume"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full sm:h-[min(92vh,1100px)] w-full sm:max-w-4xl flex-col overflow-hidden bg-background sm:rounded-2xl sm:border sm:border-border shadow-2xl"
          >
            {/* Top bar */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3">
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-semibold text-foreground">Resume</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {numPages ? `${numPages} page${numPages > 1 ? 's' : ''} · PDF` : 'PDF'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <DownloadButton />
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in new tab"
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowUpRight size={18} />
                </a>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close resume"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Pages. Scroll anchoring is off so the view stays at the top while pages render in */}
            <div ref={bodyRef} className="flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] bg-muted/40 py-4 sm:py-8">
              <Document
                file={RESUME_URL}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    Loading resume…
                  </div>
                }
                error={
                  <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle size={16} />
                      The preview couldn't load. You can still download the PDF.
                    </p>
                    <DownloadButton />
                  </div>
                }
                className="flex flex-col items-center gap-4 sm:gap-6"
              >
                {pageWidth > 0 &&
                  Array.from({ length: numPages }, (_, i) => (
                    <Page
                      key={i}
                      pageNumber={i + 1}
                      width={pageWidth}
                      loading={null}
                      className="overflow-hidden rounded-sm bg-white shadow-md ring-1 ring-black/5"
                    />
                  ))}
              </Document>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResumeViewer;
