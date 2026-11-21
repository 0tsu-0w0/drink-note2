/* 画面で使うアイコン（線画・currentColor） */
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function MugIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5c0 1 1 1 1 2M12 3.5c0 1 1 1 1 2" />
    </svg>
  );
}
export function GlassIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M7 3h10l-1 7a4 4 0 0 1-8 0z" />
      <path d="M12 14v6M8.5 20.5h7" />
    </svg>
  );
}
export function ListIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r=".6" fill="currentColor" />
      <circle cx="4" cy="12" r=".6" fill="currentColor" />
      <circle cx="4" cy="18" r=".6" fill="currentColor" />
    </svg>
  );
}
export function PlusIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} strokeWidth={2.4} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function SearchIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}
export function GearIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} width={24} height={24} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
