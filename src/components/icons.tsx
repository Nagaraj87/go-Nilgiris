import type { SVGProps } from 'react';

export const DeerLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8.58c1.7.9 3.22 2.68 4 4.42" />
    <path d="M8.58 16c-.9-1.7-2.68-3.22-4.42-4" />
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    <path d="M12 12v10" />
    <path d="M16 16.21A5 5 0 0 0 12 22a5 5 0 0 0-4 5.79" />
    <path d="M22 12.21a5 5 0 0 0-5.79-4" />
    <path d="M3.79 8A5 5 0 0 0 8 12" />
  </svg>
);
