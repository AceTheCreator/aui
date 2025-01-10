import IconWrapper, { IconWrapperProps } from './IconWrapper'

type IconServerProps = IconWrapperProps

export default function IconServer(props: IconServerProps) {
 return (
   <IconWrapper stroke="url(#icon-server-gradient)" {...props}>
     <linearGradient id="icon-server-gradient" x2="1" y2="1">
       <stop offset="0%" className="primary-gradient-color-stop" />
       <stop offset="100%" className="secondary-gradient-color-stop" />
     </linearGradient>
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
   </IconWrapper>
 )
}