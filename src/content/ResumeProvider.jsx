import React, { createContext, useContext, useState, useRef, useCallback, lazy, Suspense } from 'react';

// pdf.js is heavy, so the viewer is only fetched the first time someone opens it
const ResumeViewer = lazy(() => import('../components/ResumeViewer'));

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const triggerRef = useRef(null);

    const openResume = useCallback(() => {
        triggerRef.current = document.activeElement;
        setHasOpened(true);
        setIsOpen(true);
    }, []);

    const closeResume = useCallback(() => {
        setIsOpen(false);
        // Hand focus back to whichever button opened the viewer
        triggerRef.current?.focus?.();
    }, []);

    return (
        <ResumeContext.Provider value={{ isOpen, openResume, closeResume }}>
            {children}
            {hasOpened && (
                <Suspense fallback={null}>
                    <ResumeViewer isOpen={isOpen} onClose={closeResume} />
                </Suspense>
            )}
        </ResumeContext.Provider>
    );
};

export const useResume = () => useContext(ResumeContext);
