export interface ISidePanelProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function SidePanel ({isOpen, setIsOpen}: ISidePanelProps) {
    if(isOpen) {
          return <div>Hello worlda</div>;
    }
}
