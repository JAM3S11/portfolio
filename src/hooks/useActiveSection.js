import { useState, useEffect } from 'react';

// Returns the id of the section currently crossing the middle band of the viewport
export const useActiveSection = (ids) => {
  const [active, setActive] = useState('');
  const key = ids.join(',');

  useEffect(() => {
    const sections = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key]);

  return active;
};

export default useActiveSection;
