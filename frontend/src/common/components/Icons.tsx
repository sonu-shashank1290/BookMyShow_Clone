type IconProps = { className?: string; size?: number };

export function SearchIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5L21 21.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className, size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden>
      <path d="M2 4.2L6 8.2L10 4.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.5c1.4-3.2 3.9-4.8 7-4.8s5.6 1.6 7 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function StarIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.8l2.6 6.3 6.9.6-5.2 4.5 1.6 6.7L12 17.6 6.1 20.9l1.6-6.7L2.5 9.7l6.9-.6L12 2.8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HeartIcon({ className, size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 20s-7.2-4.5-9.3-8.6C1.2 8.4 2.6 5.4 6 5c2.1-.2 3.6.9 4.2 1.8C10.8 5.9 12.3 4.8 14.4 5c3.4.4 4.8 3.4 3.3 6.4C19.2 15.5 12 20 12 20z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PlayIcon({ className, size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M8 5.5v13l12-6.5L8 5.5z" fill="currentColor" />
    </svg>
  );
}

export function PencilIcon({ className, size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20l4.2-1.1L20 7.1 16.9 4 5.1 15.8 4 20z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function BackIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M15 5L8 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SocialIcon({
  name,
  className,
}: {
  name: "facebook" | "x" | "instagram" | "youtube" | "pinterest" | "linkedin";
  className?: string;
}) {
  const paths: Record<string, string> = {
    facebook: "M14 8h3V4h-3c-3 0-5 2-5 5v2H7v4h2v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1z",
    x: "M4 4l6.8 8.8L4.4 20H6l5.4-6.2L16.8 20H20l-7-9.1L19.4 4H18l-5 5.8L8 4H4z",
    instagram:
      "M8 3h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5zm8 2H8a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3zm-4 3.2A4.8 4.8 0 1112 18a4.8 4.8 0 010-9.6zM17.4 6.6a1 1 0 110 2 1 1 0 010-2z",
    youtube:
      "M22 12s0-3.4-.4-4.9c-.3-1.2-1.2-2-2.4-2.3C17.4 4.3 12 4.3 12 4.3s-5.4 0-7.2.5c-1.2.3-2.1 1.1-2.4 2.3C2 8.6 2 12 2 12s0 3.4.4 4.9c.3 1.2 1.2 2 2.4 2.3 1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5c1.2-.3 2.1-1.1 2.4-2.3.4-1.5.4-4.9.4-4.9zM10 15.5v-7l6 3.5-6 3.5z",
    pinterest:
      "M12 3a9 9 0 00-3.3 17.4c-.1-.8-.2-2 0-2.9l1.3-5.6s-.3-.7-.3-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.4-1 3.8-.3 1.1.6 2 1.7 2 2.1 0 3.5-2.6 3.5-5.8 0-2.4-1.6-4.2-4.6-4.2-3.3 0-5.4 2.5-5.4 5.2 0 1 .3 1.7.8 2.2.2.2.2.3.1.6l-.3 1.1c-.1.3-.3.4-.6.3-1.7-.7-2.5-2.6-2.5-4.7C5.2 7.2 8.1 4 12.4 4 15.9 4 18.5 6.5 18.5 10.2c0 4.1-2.3 7.2-5.6 7.2-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.2.9-.9 2-1.4 2.7A9 9 0 1012 3z",
    linkedin:
      "M6.5 9H3.7v11h2.8V9zM5.1 4C4 4 3.2 4.8 3.2 5.8S4 7.6 5.1 7.6 7 6.8 7 5.8 6.2 4 5.1 4zM20.3 20h-2.8v-5.4c0-1.5-.5-2.5-1.8-2.5-1 0-1.5.7-1.8 1.3-.1.2-.1.6-.1.9V20h-2.8s.0-9.8 0-10.8h2.8v1.7c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4.1 1.5 4.1 4.8V20z",
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={paths[name]} fill="currentColor" />
    </svg>
  );
}
