/* A handwritten margin note in Hindi, with a little drawn arrow. Decorative. */
export default function HindiNote({ children, flip = false }: { children: string; flip?: boolean }) {
  return (
    <span className={`g-hinote${flip ? " g-hinote--flip" : ""}`} lang="hi" aria-hidden="true">
      {children}
      <svg viewBox="0 0 60 30" width="46" height="23" fill="none">
        <path d="M4 6 C 20 4, 36 10, 48 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 22 L 49 25 L 50 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
