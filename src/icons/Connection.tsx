interface IconUpdateProps {
  className?: string;
}

export default function Connection({ className }: IconUpdateProps) {
  return (
    <svg
      className={className || "inline-block"}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 5v14m7-7H5m10-3l-3 3 3 3m-6-6l3 3-3 3"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 6.873a9 9 0 011 4.127 9 9 0 01-1 4.127M5 6.873a9 9 0 00-1 4.127 9 9 0 001 4.127"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 8.873a6 6 0 011 3.127 6 6 0 01-1 3.127M8 8.873a6 6 0 00-1 3.127 6 6 0 001 3.127"
      />
    </svg>
  );
}
