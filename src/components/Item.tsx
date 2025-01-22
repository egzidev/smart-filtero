import React from "react";
import {LucideProps} from "lucide-react";
import {ItemCmp} from "@/types";

const Item: React.FC<ItemCmp> = ({
  label,
  icon,
  query,
  onClick,
  isTyped = false,
  validateStyle,
}) => {

  const getIcon = (icon: React.ComponentType<LucideProps>) => {
    const Icon = icon;
    return <Icon size={14}/>;
  };

  return (
    <li
      className={isTyped ? validateStyle('queryItem') : validateStyle('dropdownItem')}
      onClick={onClick}
    >
      {icon && getIcon(icon)}
      {label}{' '}{isTyped && <>{query}</>}
    </li>
  )
}

export default Item;