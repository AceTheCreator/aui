interface TagProps {
  name: string;
  href?: string;
  title?: string;
}

export default function Tag({ name, href, title }: TagProps) {
  return (
    <a
      className={`text-xs whitespace-nowrap break-all mt-2 rounded-md bg-gray-300 py-[2px] px-[4px] mr-1 -mt-1 ${
        href && "hover:bg-cyan-500 hover:text-white"
      }`}
      href={href}
      target="_blank"
      title={title}
    >
      {name}
    </a>
  );
}
