import { FC, ComponentType, ReactNode } from 'react'

interface WrapperProps {
 children: ReactNode;
 className?: string;
}

interface DefinitionListItemProps {
 IconClass?: ComponentType<{ className: string; title: string; alt: string }>;
 text: string;
 itemChildren?: ReactNode;
 href?: string;
 vertical?: boolean;
 className?: string;
}

export default function DefinitionListItem({
 IconClass,
 text,
 href,
 vertical = false,
 itemChildren,
 className = '',
}: DefinitionListItemProps) {
 const Wrapper: FC<WrapperProps> = href 
   ? props => <a href={href} target="_blank" {...props} /> 
   : props => <div {...props} />;

 return (
   <div className={`${!vertical && 'flex'} ${className}`}>
     <dt>
       <Wrapper className="flex">
         {IconClass && (<IconClass className="w-5 h-5" title={`${text}`} alt={`${text}`} />)}
       </Wrapper>
     </dt>
     <dd className={`pl-2 text-sm`}>
       <Wrapper>
         {text}
       </Wrapper>
       {itemChildren && 
       <Wrapper className='pt-4 -ml-6'>
         {itemChildren}
       </Wrapper>
       }
     </dd>
   </div>
 )
}