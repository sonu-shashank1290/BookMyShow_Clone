"use client";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function DummyLink({ children, className }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}
