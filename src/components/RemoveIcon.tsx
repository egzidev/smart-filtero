import {X} from "lucide-react";
import React from "react";

interface RemoveIconProps {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  validateStyle: (className: string) => string;
}

const RemoveIcon: React.FC<RemoveIconProps> = ({ onClick, validateStyle }) => {
  return (
    <div
      className={validateStyle('removeIcon')}
      onClick={onClick}
    >
      <X size={14}/>
    </div>
  );
};

export default RemoveIcon;

