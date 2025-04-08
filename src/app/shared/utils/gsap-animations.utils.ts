import { gsap } from 'gsap';

export const fadeIn = (element: HTMLElement, duration = 0.5, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0 },
    { opacity: 1, duration, delay }
  );
};

export const slideInLeft = (element: HTMLElement, duration = 0.5, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, duration, delay }
  );
};

export const slideInRight = (element: HTMLElement, duration = 0.5, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0, x: 50 },
    { opacity: 1, x: 0, duration, delay }
  );
};
