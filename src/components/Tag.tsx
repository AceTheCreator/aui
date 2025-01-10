interface TagProps {
    name: string;
    href?: string;
    title?: string;
   }
   
   export default function Tag({ name, href, title }: TagProps) {
    return (
        <a className={`text-xs whitespace-nowrap break-all leading-8 rounded-xl bg-gray-300 py-1 px-2 mr-1 -mt-1 ${href && 'hover:bg-cyan-500 hover:text-white'}`}
        href={href}
        target="_blank"
        title={title}
      >{name}</a>
    )
   }