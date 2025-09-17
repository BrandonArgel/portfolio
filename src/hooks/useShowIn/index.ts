import { RefObject } from 'react';
const showIn = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');

    observer.unobserve(entry.target);
  });
};

const observerOptions = {
  root: null,
  rootMargin: '0px 0px -100px 0px',
  threshold: 0.0,
};

const observer = new IntersectionObserver(showIn, observerOptions);

const useShowIn = (ref: RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    observer.observe(ref.current);
  }
};


export { useShowIn };
