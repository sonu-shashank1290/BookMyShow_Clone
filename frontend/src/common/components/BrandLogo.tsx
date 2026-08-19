import Link from "next/link";

export function BrandLogo({
  href = "/",
  size = "md",
  invert = false,
}: {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  invert?: boolean;
}) {
  const height = size === "lg" ? 40 : size === "sm" ? 26 : 34;
  const src = invert ? "/bookmyshow-logo.png" : "/bookmyshow-logo-header.png";

  const mark = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="bookmyshow"
      height={height}
      className="w-auto object-contain object-left"
      style={{ height }}
    />
  );

  if (!href) return mark;
  return (
    <Link href={href} className="shrink-0" aria-label="BookMyShow">
      {mark}
    </Link>
  );
}
