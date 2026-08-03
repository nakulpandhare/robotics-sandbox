/* Shared brand emblem — mountain range, switchback path, rising
   sun. Used in the nav of every page (landing, challenges, sandbox)
   so the wordmark reads as the same product everywhere. */
export default function MountainMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <circle cx="21" cy="10" r="2.1" fill="var(--gold)" />
      <path d="M7 22 L12 14 L15 17 L19 9 L23 18 L26 22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <path d="M10 22 L13 17.5 L11.5 15 L14.5 11.5 L14 9.5" stroke="var(--ember)" strokeWidth="1.3" strokeDasharray="2.2 2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
