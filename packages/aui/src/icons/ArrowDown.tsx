interface IconArrowDownProps {
  className?: string;
}

export default function IconDownRight({ className }: IconArrowDownProps) {
  return (
    <svg
      className={className}
      id="Layer_1"
      version="1.1"
      viewBox="0 0 50 50"
      width="50px"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="47.25,15 45.164,12.914 25,33.078 4.836,12.914 2.75,15 25,37.25 " />
    </svg>
  );
}
