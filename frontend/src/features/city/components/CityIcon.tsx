type IconProps = { size?: number; className?: string };

/**
 * Simplified line-art landmarks, one per popular city, with a skyline fallback
 * for everywhere else.
 */
const LANDMARKS: Record<string, (props: Required<IconProps>) => React.ReactNode> = {
  // Gateway of India
  Mumbai: () => (
    <>
      <path d="M7 42h34" />
      <path d="M13 42V21h22v21" />
      <path d="M13 21l4-6h14l4 6" />
      <path d="M19 42V31a5 5 0 0 1 10 0v11" />
      <path d="M17 15v-4M31 15v-4" />
    </>
  ),
  // India Gate
  "Delhi-NCR": () => (
    <>
      <path d="M6 42h36" />
      <path d="M12 42V17h24v25" />
      <path d="M12 17h24M16 17v-4h16v4" />
      <path d="M19 42V29a5 5 0 0 1 10 0v13" />
    </>
  ),
  // Vidhana Soudha
  Bengaluru: () => (
    <>
      <path d="M6 42h36" />
      <path d="M10 42V25h28v17" />
      <path d="M16 42V29M22 42V29M26 42V29M32 42V29" />
      <path d="M18 25a6 6 0 0 1 12 0" />
      <path d="M24 19v-4" />
    </>
  ),
  // Charminar
  Hyderabad: () => (
    <>
      <path d="M7 42h34" />
      <path d="M13 42V21h22v21" />
      <path d="M20 42V32a4 4 0 0 1 8 0v10" />
      <path d="M13 21v-9M35 21v-9M17 21v-6M31 21v-6" />
      <path d="M13 12l-1.5-2 1.5-2 1.5 2zM35 12l-1.5-2L35 8l1.5 2z" />
    </>
  ),
  // Open Hand Monument
  Chandigarh: () => (
    <>
      <path d="M12 24c2 9 7 13 12 13s10-4 12-13" />
      <path d="M12 24l2-7M18 20l1-8M24 18V8M30 20l-1-8M36 24l-2-7" />
      <path d="M24 37v5M17 42h14" />
    </>
  ),
  // Jama Masjid
  Ahmedabad: () => (
    <>
      <path d="M6 42h36" />
      <path d="M13 42V27h22v15" />
      <path d="M18 27a6 6 0 0 1 12 0" />
      <path d="M24 21v-4" />
      <path d="M13 27V14M35 27V14" />
      <path d="M13 14l-1.5-3L13 8l1.5 3zM35 14l-1.5-3L35 8l1.5 3z" />
      <path d="M21 42v-7a3 3 0 0 1 6 0v7" />
    </>
  ),
  // Shaniwar Wada
  Pune: () => (
    <>
      <path d="M6 42h36" />
      <path d="M10 42V22h28v20" />
      <path d="M10 22v-4h5v4M19 22v-4h5v4M28 22v-4h5v4" />
      <path d="M35 18h3v4" />
      <path d="M20 42V31a4 4 0 0 1 8 0v11" />
    </>
  ),
  // Temple gopuram
  Chennai: () => (
    <>
      <path d="M8 42h32" />
      <path d="M13 42V27h22v15" />
      <path d="M15 27l3-6h12l3 6" />
      <path d="M18 21l2-5h8l2 5" />
      <path d="M21 42v-8h6v8" />
      <path d="M20 16h8" />
    </>
  ),
  // Victoria Memorial
  Kolkata: () => (
    <>
      <path d="M6 42h36" />
      <path d="M11 42V29h26v13" />
      <path d="M16 29a8 8 0 0 1 16 0" />
      <path d="M24 21v-4" />
      <path d="M11 29v-4M37 29v-4" />
    </>
  ),
  // Chinese fishing boat
  Kochi: () => (
    <>
      <path d="M8 35h32l-4 7H12z" />
      <path d="M24 35V9" />
      <path d="M24 12l11 17H24z" />
      <path d="M6 42h4M38 42h4" />
    </>
  ),
};

function Skyline() {
  return (
    <>
      <path d="M6 42h36" />
      <path d="M10 42V27h8v15M22 42V18h8v24M34 42V31h4v11" />
      <path d="M26 18v-4" />
      <path d="M13 33h2M25 25h2M25 32h2" />
    </>
  );
}

export function CityIcon({ city, size = 44, className = "" }: IconProps & { city: string }) {
  const Landmark = LANDMARKS[city];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {Landmark ? Landmark({ size, className }) : <Skyline />}
    </svg>
  );
}
