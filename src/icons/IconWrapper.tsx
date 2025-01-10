import { SVGProps, ReactNode } from 'react'

export interface IconWrapperProps extends SVGProps<SVGSVGElement> {
  className?: string;
  children: ReactNode;
}

export default function IconWrapper({ className, children, ...props }: IconWrapperProps) {
  return (
    <svg className={className || 'inline-block'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      {children}
    </svg>
  )
}